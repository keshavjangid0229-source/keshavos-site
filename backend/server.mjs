import { createServer } from "node:http";
import { appendFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { join } from "node:path";

const directory = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.env.DATA_DIR || ".data";
const origins = new Set((process.env.FRONTEND_ORIGINS || "https://keshavos-site.vercel.app").split(",").map(value => value.trim()));

createServer(async (req, res) => {
  const reply = (status, body) => {
    res.writeHead(status, { "Content-Type":"application/json", "Cache-Control":"no-store" });
    res.end(JSON.stringify(body));
  };
  if (req.url === "/health" && req.method === "GET") return reply(200, { ok:true });
  if (req.url !== "/guestbook") return reply(404, { error:"Not found" });
  const origin = req.headers.origin;
  if (origin && !origins.has(origin)) return reply(403, { error:"Origin is not allowed" });
  if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  if (req.method === "OPTIONS") {
    res.writeHead(204, { "Access-Control-Allow-Methods":"POST", "Access-Control-Allow-Headers":"Content-Type" });
    return res.end();
  }
  if (req.method !== "POST") return reply(405, { error:"Method not allowed" });
  if (req.headers["content-type"]?.split(";")[0] !== "application/json") return reply(415, { error:"JSON required" });
  try {
    let size = 0;
    const chunks = [];
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 4096) return reply(413, { error:"Entry is too long" });
      chunks.push(chunk);
    }
    let input;
    try { input = JSON.parse(Buffer.concat(chunks)); }
    catch { return reply(400, { error:"Invalid JSON" }); }
    const name = typeof input?.name === "string" ? input.name.trim() : "";
    const message = typeof input?.message === "string" ? input.message.trim() : "";
    if (!name || name.length > 40 || !message || message.length > 280) {
      return reply(400, { error:"Enter a name and a message within the limits." });
    }
    const entry = { id:randomUUID(), name, message, status:"pending", ts:Date.now() };
    await mkdir(directory, { recursive:true });
    await appendFile(join(directory, "guestbook.jsonl"), JSON.stringify(entry) + "\n");
    return reply(201, { id:entry.id, status:entry.status });
  } catch {
    if (!res.headersSent) reply(500, { error:"Could not save entry" });
  }
}).listen(Number(process.env.PORT || 3018), process.env.PORT ? "0.0.0.0" : "127.0.0.1");
