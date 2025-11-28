import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: "missing id" });

  const raw = await redis.get(`room:${id}`);
  if (!raw) return res.status(404).json({ error: "room not found" });

  return res.json({ ok: true, room: JSON.parse(raw) });
}
