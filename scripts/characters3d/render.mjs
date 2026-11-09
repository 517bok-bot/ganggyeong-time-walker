// 3D 피규어를 이미지로 굽기: node scripts/characters3d/render.mjs [chars|player|all]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const types = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript" };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const f = u.startsWith("/node_modules/") ? path.join(root, u) : path.join(root, "scripts/characters3d", u);
  if (!f.startsWith(root) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": types[path.extname(f)] ?? "application/octet-stream" }); fs.createReadStream(f).pipe(res);
}).listen(0);
const port = server.address().port;
const what = process.argv[2] ?? "all";
const only = process.argv[3];

const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const p = await b.newPage();
p.on("pageerror", (e) => console.error("pageerror", e.message));
p.on("console", (m) => { if (m.type() === "error") console.error(m.text()); });
await p.goto(`http://localhost:${port}/stage.html`);
await p.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
const save = (rel, dataUrl) => { const f = path.join(root, "public", rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, Buffer.from(dataUrl.split(",")[1], "base64")); };

if (what === "chars" || what === "all") {
  const ids = only ? [only] : ["kangi", "kaengi", "kongi", "berijyu", "daechu-1", "daechu-2", "daechu-3", "sweetpo"];
  for (const id of ids) for (const mood of ["idle", "happy", "wave", "surprised"]) {
    save(`characters/${id}-${mood}.webp`, await p.evaluate(([i, m]) => window.renderChar(i, m), [id, mood]));
    process.stdout.write(".");
  }
}
if (what === "player" || what === "all") {
  const jobs = JSON.parse(fs.readFileSync(path.join(root, "scripts/characters3d/player-jobs.json"), "utf8"));
  for (const j of jobs) { if (only && !j.file.includes(only)) continue; save(j.file, await p.evaluate((o) => window.renderPlayer(o), j.opts)); process.stdout.write("+"); }
}
if (what === "npc" || what === "all") {
  for (const id of ["guide", "artisan", "photographer", "merchant", "postman"]) { save(`npc/${id}.webp`, await p.evaluate((i) => window.renderNpc(i), id)); process.stdout.write("*"); }
}
console.log("\ndone");
await b.close(); server.close();
