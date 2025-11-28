import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { id, hostName } = req.body || {};
  if (!id || !hostName) return res.status(400).json({ error: "id & hostName required" });

  const raw = await redis.get(`room:${id}`);
  if (!raw) return res.json({ ok: true });

  const room = JSON.parse(raw);

  if (room.host !== hostName)
    return res.status(403).json({ error: "only host can delete" });

  await redis.del(`room:${id}`);

  return res.json({ ok: true });
}
