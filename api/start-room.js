import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

function pickImpostor(n) {
  return Math.floor(Math.random() * n);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { id, hostName, word } = req.body || {};
  if (!id || !hostName) return res.status(400).json({ error: "id & hostName required" });

  const raw = await redis.get(`room:${id}`);
  if (!raw) return res.status(404).json({ error: "room not found" });

  const room = JSON.parse(raw);

  if (room.host !== hostName)
    return res.status(403).json({ error: "only host can start" });

  if (room.players.length < 2)
    return res.status(400).json({ error: "need at least 2 players" });

  room.started = true;
  room.word = word || room.word || "???";
  room.impostorIndex = pickImpostor(room.players.length);

  await redis.set(`room:${id}`, JSON.stringify(room), { ex: 3600 });

  return res.json({ ok: true, room });
}
