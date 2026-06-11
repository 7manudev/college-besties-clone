import { createHash, timingSafeEqual } from "crypto";

const MAX_PER_HOUR = 3;
const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

function hashIp(ip, salt) {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, response: token, remoteip: ip }),
  });

  const result = await response.json();
  return Boolean(result.success);
}

async function supabaseRequest(path, options = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("STORAGE_NOT_CONFIGURED");

  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  return response;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body || {};
  const honeypot = String(body.honeypot || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const source = String(body.source || "besties-site").slice(0, 64);
  const ageConfirmed = Boolean(body.ageConfirmed);
  const turnstileToken = String(body.turnstileToken || "");

  if (honeypot) {
    return res.status(200).json({ ok: true });
  }

  if (!ageConfirmed) {
    return res.status(400).json({ error: "Age confirmation required" });
  }

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "unknown";

  if (process.env.TURNSTILE_SECRET_KEY) {
    if (!turnstileToken) {
      return res.status(400).json({ error: "Captcha required" });
    }
    const captchaOk = await verifyTurnstile(turnstileToken, ip);
    if (!captchaOk) {
      return res.status(403).json({ error: "Captcha failed" });
    }
  }

  const salt = process.env.IP_HASH_SALT;
  if (!salt || safeEqual(salt, "change-me")) {
    return res.status(503).json({ error: "Server misconfigured" });
  }

  try {
    const ipHash = hashIp(ip, salt);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const rateResponse = await supabaseRequest(
      `email_signups?ip_hash=eq.${ipHash}&created_at=gte.${oneHourAgo}&select=id`,
      { method: "GET", headers: { Prefer: "count=exact" } }
    );

    if (!rateResponse.ok) {
      return res.status(500).json({ error: "Rate check failed" });
    }

    const rateRows = await rateResponse.json();
    if (Array.isArray(rateRows) && rateRows.length >= MAX_PER_HOUR) {
      return res.status(429).json({ error: "Too many attempts. Try again later." });
    }

    const insertResponse = await supabaseRequest("email_signups", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        email,
        source,
        age_confirmed: true,
        ip_hash: ipHash,
      }),
    });

    if (insertResponse.ok || insertResponse.status === 409) {
      return res.status(200).json({ ok: true });
    }

    return res.status(500).json({ error: "Could not save email" });
  } catch (error) {
    if (error.message === "STORAGE_NOT_CONFIGURED") {
      return res.status(503).json({ error: "Storage not configured" });
    }
    return res.status(500).json({ error: "Server error" });
  }
}