import { createHash } from "crypto";

const MAX_PER_HOUR = 5;
const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

function hashIp(ip, salt) {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

async function supabase(path, options = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("STORAGE_NOT_CONFIGURED");

  return fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body || {};
  const honeypot = String(body.honeypot || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const source = String(body.source || "yourgirls-site").slice(0, 64);
  const creatorName = String(body.creatorName || "").trim().slice(0, 128) || null;
  const profileUrl = String(body.profileUrl || "").trim().slice(0, 512) || null;

  if (honeypot) {
    return res.status(200).json({ ok: true });
  }

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const salt = process.env.IP_HASH_SALT;
  if (!salt) {
    return res.status(503).json({ error: "Storage not configured" });
  }

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    "unknown";

  try {
    const ipHash = hashIp(ip, salt);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const rateResponse = await supabase(
      `email_signups?ip_hash=eq.${ipHash}&created_at=gte.${oneHourAgo}&select=id`,
      { method: "GET" }
    );

    if (!rateResponse.ok) {
      return res.status(500).json({ error: "Rate check failed" });
    }

    const recent = await rateResponse.json();
    if (Array.isArray(recent) && recent.length >= MAX_PER_HOUR) {
      return res.status(429).json({ error: "Too many attempts. Try again later." });
    }

    const insertResponse = await supabase("email_signups", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        email,
        source,
        creator_name: creatorName,
        profile_url: profileUrl,
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