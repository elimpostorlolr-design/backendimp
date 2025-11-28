import { Redis } from "@upstash/redis";
import { customAlphabet } from "nanoid";

const nano = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 4);
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { hostName, word, mode } = req.body || {};
  if (!hostName) return res.status(400).json({ error: "hostName required" });

  const id = nano();
  const room = {
    id,
    host: hostName,
    players: [hostName],
    mode: mode || "random",
    word: word || null,
    started: false,
    impostorIndex: null,
    createdAt: Date.now()
  };

  await redis.set(`room:${id}`, JSON.stringify(room), { ex: 3600 });

  return res.json({ ok: true, id, room });
}
