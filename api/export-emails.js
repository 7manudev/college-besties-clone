export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const adminKey = process.env.ADMIN_EXPORT_KEY;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!adminKey || !url || !key) {
    return res.status(503).json({ error: "Export not configured" });
  }

  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== adminKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const response = await fetch(
    `${url}/rest/v1/email_signups?select=email,source,creator_name,profile_url,created_at&order=created_at.desc`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    }
  );

  if (!response.ok) {
    return res.status(500).json({ error: "Could not load emails" });
  }

  const rows = await response.json();
  const lines = ["email,source,creator_name,profile_url,created_at"];
  for (const row of rows) {
    const email = `"${String(row.email).replace(/"/g, '""')}"`;
    const source = `"${String(row.source || "").replace(/"/g, '""')}"`;
    const creatorName = `"${String(row.creator_name || "").replace(/"/g, '""')}"`;
    const profileUrl = `"${String(row.profile_url || "").replace(/"/g, '""')}"`;
    const created = row.created_at || "";
    lines.push(`${email},${source},${creatorName},${profileUrl},${created}`);
  }

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="email-signups.csv"');
  return res.status(200).send(`${lines.join("\n")}\n`);
}