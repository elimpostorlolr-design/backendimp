import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { id, name } = req.body || {};
  if (!id || !name) return res.status(400).json({ error: "id and name required" });

  const raw = await redis.get(`room:${id}`);
  if (!raw) return res.status(404).json({ error: "room not found" });

  const room = JSON.parse(raw);

  if (room.players.includes(name)) return res.json({ ok: true, room });
  if (room.players.length >= 6) return res.status(403).json({ error: "room full" });

  room.players.push(name);

  await redis.set(`room:${id}`, JSON.stringify(room), { ex: 3600 });

  return res.json({ ok: true, room });
}
