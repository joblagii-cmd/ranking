// api/trigger.js - Manually trigger a specific batch (for testing or catch-up)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { secret, batchIndex, dateStr } = req.body || {};

  // Auth check
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Invalid secret" });
  }

  const targetBatch = batchIndex ?? new Date().getUTCHours();
  const targetDate = dateStr ?? new Date().toISOString().split("T")[0];

  // Forward to the cron handler logic
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const response = await fetch(`${baseUrl}/api/cron/generate`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.CRON_SECRET}`,
      "x-batch-override": String(targetBatch),
      "x-date-override": targetDate
    }
  });

  const data = await response.json();
  return res.status(response.status).json(data);
}
