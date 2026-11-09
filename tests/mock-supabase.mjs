// 테스트 전용 Supabase 대역 서버 (운영에 사용 금지)
// ─────────────────────────────────────────────────────────────
// 앱이 실제로 호출하는 Supabase API의 일부만 흉내 냅니다.
//  - /auth/v1 : 익명 가입(signup), 사용자 조회(user), 로그아웃, 관리자 사용자 삭제
//  - /rest/v1 : 테이블 select/insert/upsert/update/delete, rpc 호출 → 로컬 PostgreSQL 에 실제 SQL 실행
//  - /storage/v1 : 업로드·서명 URL·목록·삭제 (메모리 저장)
// RLS 는 적용하지 않습니다 (Service Role 경로 시험용). RLS 자체는 supabase/tests/test_rpc.sql 에서 검증합니다.
// 실행: PGHOST=/var/tmp/gtwpg PGPORT=5433 PGDATABASE=gtw_e2e node tests/mock-supabase.mjs
import http from "node:http";
import { randomUUID } from "node:crypto";
import pg from "pg";

const pool = new pg.Pool({ user: "postgres" });
const PORT = Number(process.env.MOCK_PORT ?? 54321);
const files = new Map(); // `${bucket}/${path}` -> { body, type }
const ident = (s) => { if (!/^[a-z_][a-z0-9_]*$/.test(s)) throw Object.assign(new Error(`bad identifier ${s}`), { status: 400 }); return `"${s}"`; };

const colTypes = new Map();
async function types(table) {
  if (!colTypes.has(table)) {
    const r = await pool.query("select column_name, data_type from information_schema.columns where table_schema='public' and table_name=$1", [table]);
    colTypes.set(table, Object.fromEntries(r.rows.map((x) => [x.column_name, x.data_type])));
  }
  return colTypes.get(table);
}
const enc = (t, v) => (t === "jsonb" || t === "json") && v !== null && typeof v === "object" ? JSON.stringify(v) : v;

function filters(url, params) {
  const where = [];
  for (const [k, v] of url.searchParams) {
    if (["select", "order", "limit", "on_conflict", "offset"].includes(k)) continue;
    const m = v.match(/^(eq|neq|gt|lt|gte|lte|is)\.(.*)$/);
    if (!m) throw Object.assign(new Error(`unsupported filter ${k}=${v}`), { status: 400 });
    const op = { eq: "=", neq: "<>", gt: ">", lt: "<", gte: ">=", lte: "<=" }[m[1]];
    if (m[1] === "is") where.push(`${ident(k)} is ${m[2] === "null" ? "null" : "not null"}`);
    else { params.push(m[2]); where.push(`${ident(k)} ${op} $${params.length}`); }
  }
  return where.length ? ` where ${where.join(" and ")}` : "";
}
const selectCols = (url) => { const s = url.searchParams.get("select"); return !s || s === "*" ? "*" : s.split(",").map((c) => ident(c.trim())).join(","); };

function send(res, status, body, headers = {}) {
  res.writeHead(status, { "content-type": "application/json", "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*", ...headers });
  res.end(body === undefined ? "" : JSON.stringify(body));
}
const readBody = (req) => new Promise((r) => { const c = []; req.on("data", (d) => c.push(d)); req.on("end", () => r(Buffer.concat(c))); });

async function userFromToken(req) {
  const tok = (req.headers.authorization ?? "").replace(/^Bearer /, "");
  const m = tok.match(/^test-token-([0-9a-f-]{36})$/);
  if (!m) return null;
  const r = await pool.query("select id, email, is_anonymous, created_at from auth.users where id = $1", [m[1]]);
  return r.rows[0] ?? null;
}
const userJson = (u) => ({ id: u.id, aud: "authenticated", role: "authenticated", email: u.email ?? "", is_anonymous: !!u.is_anonymous, app_metadata: { provider: u.is_anonymous ? "anonymous" : "email" }, user_metadata: {}, created_at: u.created_at, updated_at: u.created_at });
const session = (u) => ({ access_token: `test-token-${u.id}`, token_type: "bearer", expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: `refresh-${u.id}`, user: userJson(u) });

async function auth(req, res, path, url) {
  if (path === "/signup" && req.method === "POST") {
    const b = JSON.parse((await readBody(req)).toString() || "{}");
    const r = await pool.query("insert into auth.users(email, is_anonymous) values ($1, $2) returning id, email, is_anonymous, created_at", [b.email ?? null, !b.email]);
    return send(res, 200, session(r.rows[0]));
  }
  if (path === "/token" && url.searchParams.get("grant_type") === "refresh_token") {
    const b = JSON.parse((await readBody(req)).toString() || "{}");
    const id = String(b.refresh_token ?? "").replace("refresh-", "");
    const r = await pool.query("select id, email, is_anonymous, created_at from auth.users where id::text = $1", [id]);
    return r.rows[0] ? send(res, 200, session(r.rows[0])) : send(res, 400, { error: "invalid_grant" });
  }
  if (path === "/user" && req.method === "GET") {
    const u = await userFromToken(req);
    return u ? send(res, 200, userJson(u)) : send(res, 401, { code: 401, msg: "invalid JWT" });
  }
  if (path === "/logout") return send(res, 204);
  const del = path.match(/^\/admin\/users\/([0-9a-f-]{36})$/);
  if (del && req.method === "GET") {
    const r = await pool.query("select id, email, is_anonymous, created_at from auth.users where id = $1", [del[1]]);
    return r.rows[0] ? send(res, 200, userJson(r.rows[0])) : send(res, 404, { msg: "User not found" });
  }
  if (del && req.method === "DELETE") { await pool.query("delete from auth.users where id = $1", [del[1]]); return send(res, 200, {}); }
  return send(res, 404, { msg: `auth ${req.method} ${path} not mocked` });
}

async function rest(req, res, path, url) {
  const rpc = path.match(/^\/rpc\/([a-z_]+)$/);
  if (rpc) {
    const args = JSON.parse((await readBody(req)).toString() || "{}");
    const keys = Object.keys(args);
    const sql = `select ${ident(rpc[1])}(${keys.map((k, i) => `${ident(k)} => $${i + 1}`).join(", ")}) as r`;
    try {
      const r = await pool.query(sql, keys.map((k) => (typeof args[k] === "object" && args[k] !== null ? JSON.stringify(args[k]) : args[k])));
      return send(res, 200, r.rows[0].r);
    } catch (e) { return send(res, 400, { code: e.code, message: e.message, details: null, hint: null }); }
  }
  const table = path.slice(1);
  ident(table);
  const params = [];
  const single = (req.headers.accept ?? "").includes("vnd.pgrst.object");
  const prefer = req.headers.prefer ?? "";
  let rows;
  try {
    if (req.method === "GET" || req.method === "HEAD") {
      let sql = `select ${selectCols(url)} from public.${ident(table)}${filters(url, params)}`;
      const order = url.searchParams.get("order");
      if (order) sql += " order by " + order.split(",").map((o) => { const [c, d] = o.split("."); return `${ident(c)} ${d === "desc" ? "desc" : "asc"}`; }).join(",");
      const limit = url.searchParams.get("limit");
      if (limit) sql += ` limit ${Number(limit)}`;
      rows = (await pool.query(sql, params)).rows;
    } else if (req.method === "POST") {
      const b = JSON.parse((await readBody(req)).toString());
      const list = Array.isArray(b) ? b : [b];
      const t = await types(table);
      const cols = Object.keys(list[0]);
      const vals = list.map((row) => `(${cols.map((c) => { params.push(enc(t[c], row[c] ?? null)); return `$${params.length}`; }).join(",")})`);
      let sql = `insert into public.${ident(table)} (${cols.map(ident).join(",")}) values ${vals.join(",")}`;
      const oc = url.searchParams.get("on_conflict");
      if (prefer.includes("resolution=ignore-duplicates")) sql += ` on conflict${oc ? ` (${oc.split(",").map(ident).join(",")})` : ""} do nothing`;
      else if (prefer.includes("resolution=merge-duplicates")) sql += ` on conflict (${(oc ?? "id").split(",").map(ident).join(",")}) do update set ${cols.map((c) => `${ident(c)} = excluded.${ident(c)}`).join(",")}`;
      sql += ` returning ${selectCols(url)}`;
      rows = (await pool.query(sql, params)).rows;
    } else if (req.method === "PATCH") {
      const b = JSON.parse((await readBody(req)).toString());
      const t = await types(table);
      const sets = Object.keys(b).map((c) => { params.push(enc(t[c], b[c])); return `${ident(c)} = $${params.length}`; });
      rows = (await pool.query(`update public.${ident(table)} set ${sets.join(",")}${filters(url, params)} returning *`, params)).rows;
    } else if (req.method === "DELETE") {
      rows = (await pool.query(`delete from public.${ident(table)}${filters(url, params)} returning *`, params)).rows;
    } else return send(res, 405, {});
  } catch (e) { return send(res, e.status ?? 400, { code: e.code, message: e.message, details: null, hint: null }); }
  if (single) return rows.length === 1 ? send(res, 200, rows[0]) : send(res, 406, { code: "PGRST116", message: "JSON object requested, multiple (or no) rows returned", details: `${rows.length} rows`, hint: null });
  if (prefer.includes("return=minimal")) return send(res, 201);
  return send(res, 200, rows);
}

async function storage(req, res, path, url) {
  let m;
  if ((m = path.match(/^\/object\/sign\/([^/]+)$/)) && req.method === "POST") {
    const b = JSON.parse((await readBody(req)).toString());
    return send(res, 200, b.paths.map((p) => ({ path: p, signedURL: `/object/sign/${m[1]}/${p}?token=t`, error: null })));
  }
  if ((m = path.match(/^\/object\/sign\/([^/]+)\/(.+)$/)) && req.method === "GET") {
    const f = files.get(`${m[1]}/${m[2]}`);
    if (!f) return send(res, 404, {});
    res.writeHead(200, { "content-type": f.type }); return res.end(f.body);
  }
  if ((m = path.match(/^\/object\/public\/([^/]+)\/(.+)$/)) && req.method === "GET") {
    const f = files.get(`${m[1]}/${m[2]}`);
    if (!f) return send(res, 404, {});
    res.writeHead(200, { "content-type": f.type, "access-control-allow-origin": "*" }); return res.end(f.body);
  }
  if ((m = path.match(/^\/object\/list\/([^/]+)$/)) && req.method === "POST") {
    const b = JSON.parse((await readBody(req)).toString());
    const pre = `${m[1]}/${b.prefix}/`;
    return send(res, 200, [...files.keys()].filter((k) => k.startsWith(pre)).map((k) => ({ name: k.slice(pre.length) })));
  }
  if ((m = path.match(/^\/object\/([^/]+)$/)) && req.method === "DELETE") {
    const b = JSON.parse((await readBody(req)).toString());
    b.prefixes.forEach((p) => files.delete(`${m[1]}/${p}`));
    return send(res, 200, b.prefixes.map((name) => ({ name })));
  }
  if ((m = path.match(/^\/object\/([^/]+)\/(.+)$/)) && req.method === "POST") {
    const body = await readBody(req);
    files.set(`${m[1]}/${decodeURIComponent(m[2])}`, { body, type: req.headers["content-type"] ?? "application/octet-stream" });
    return send(res, 200, { Key: `${m[1]}/${m[2]}`, Id: randomUUID() });
  }
  return send(res, 404, { msg: `storage ${req.method} ${path} not mocked` });
}

http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204);
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (url.pathname.startsWith("/auth/v1")) return await auth(req, res, url.pathname.slice(8), url);
    if (url.pathname.startsWith("/rest/v1")) return await rest(req, res, url.pathname.slice(8), url);
    if (url.pathname.startsWith("/storage/v1")) return await storage(req, res, url.pathname.slice(11), url);
    send(res, 404, { msg: "not mocked" });
  } catch (e) { console.error(e); send(res, 500, { message: String(e.message) }); }
}).listen(PORT, () => console.log(`mock supabase on :${PORT}`));
