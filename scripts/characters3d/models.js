// 강경 타임워커 3D 피규어 모델 (Three.js 기본 도형으로 빚은 자체 제작 모델)
// 플록(벨벳) 질감 + 부드러운 조명으로 '손바닥만 한 인형' 느낌을 냅니다.
// 이 파일은 빌드 때가 아니라 scripts/characters3d/render.mjs 로 이미지를 미리 구울 때만 쓰입니다.
import * as THREE from "three";

// ── 재질 ─────────────────────────────
const texCache = new Map();
export function flock(color, opts = {}) {
  return new THREE.MeshPhysicalMaterial({
    color, roughness: opts.roughness ?? 0.82, metalness: 0,
    sheen: opts.sheen ?? 0.8, sheenRoughness: 0.6, sheenColor: new THREE.Color(opts.sheenColor ?? "#ffffff").lerp(new THREE.Color(color), 0.75),
    clearcoat: opts.clearcoat ?? 0, clearcoatRoughness: 0.35, map: opts.map ?? null,
    transparent: opts.opacity !== undefined, opacity: opts.opacity ?? 1, depthWrite: opts.opacity === undefined,
  });
}
export const gloss = (color) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 });

/** 구(球) UV 위에 그리는 무늬 텍스처: u=0.25가 정면 */
export function canvasTex(key, w, h, draw) {
  if (texCache.has(key)) return texCache.get(key);
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  texCache.set(key, t); return t;
}

// ── 도형 도우미 ─────────────────────────────
const SPH = new THREE.SphereGeometry(1, 64, 48);
export function blob(mat, [sx, sy, sz], [x, y, z], rot = [0, 0, 0], parent) {
  const m = new THREE.Mesh(SPH, mat);
  m.scale.set(sx, sy, sz); m.position.set(x, y, z); m.rotation.set(...rot);
  m.castShadow = true; m.receiveShadow = true;
  parent?.add(m); return m;
}
export function mesh(geo, mat, [x, y, z] = [0, 0, 0], rot = [0, 0, 0], parent) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(...rot);
  m.castShadow = true; m.receiveShadow = true; parent?.add(m); return m;
}
/** 타원체 표면 위의 z (얼굴 위에 눈·코를 붙일 때) */
export const surfZ = (x, y, [cx, cy, cz], [rx, ry, rz], lift = 0) => cz + rz * Math.sqrt(Math.max(0, 1 - (x - cx) ** 2 / rx ** 2 - (y - cy) ** 2 / ry ** 2)) + lift;

// ── 얼굴 부품 ─────────────────────────────
const INK = "#2B2220";
export function eyes(g, { y, dx, head, mood, wink = false, size = 1 }) {
  const ink = gloss(INK), white = new THREE.MeshBasicMaterial({ color: "#ffffff" });
  for (const side of [-1, 1]) {
    const x = side * dx;
    const z = surfZ(x, y, head.c, head.r, -0.02);
    const closed = mood === "happy" || (wink && side === -1 && mood !== "surprised");
    if (closed) {
      const arc = mesh(new THREE.TorusGeometry(0.085 * size, 0.024 * size, 10, 24, Math.PI), ink, [x, y - 0.03, z + 0.01], [0, 0, 0], g);
      arc.lookAt(arc.position.clone().add(new THREE.Vector3(x * 0.25, 0, 1)));
      continue;
    }
    const s = (mood === "surprised" ? 1.2 : 1) * size;
    const e = blob(ink, [0.085 * s, 0.11 * s, 0.05], [x, y, z], [0, 0, 0], g);
    e.lookAt(e.position.clone().add(new THREE.Vector3(x * 0.35, 0, 1))); e.scale.set(0.085 * s, 0.11 * s, 0.05);
    blob(white, [0.03 * s, 0.035 * s, 0.02], [x + 0.03 * s, y + 0.045 * s, z + 0.045], [0, 0, 0], g);
    blob(white, [0.013 * s, 0.013 * s, 0.01], [x - 0.035 * s, y - 0.04 * s, z + 0.04], [0, 0, 0], g);
  }
}
export function blush(g, { y, dx, head, color = "#F3A3A0", size = 1 }) {
  const m = flock(color, { opacity: 0.55 });
  for (const s of [-1, 1]) { const x = s * dx; const b = blob(m, [0.13 * size, 0.075 * size, 0.03], [x, y, surfZ(x, y, head.c, head.r, -0.005)], [0, 0, 0], g); b.lookAt(b.position.clone().add(new THREE.Vector3(x * 0.6, 0, 1))); b.scale.set(0.13 * size, 0.075 * size, 0.03); }
}
export function mouth(g, { y, head, mood, kind = "w", x = 0 }) {
  const ink = gloss(INK);
  const z = surfZ(x, y, head.c, head.r, 0);
  if (mood === "surprised") { blob(gloss("#7A3A33"), [0.055, 0.07, 0.03], [x, y - 0.03, z - 0.01], [0, 0, 0], g); return; }
  if (mood === "happy" || mood === "wave" || kind === "open") {
    const shape = new THREE.Shape(); shape.moveTo(-0.1, 0); shape.quadraticCurveTo(0, -0.16, 0.1, 0); shape.quadraticCurveTo(0, -0.03, -0.1, 0);
    const m = mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 3 }), gloss("#8C3A33"), [x, y, z - 0.02], [0, 0, 0], g);
    blob(flock("#F08C86"), [0.045, 0.025, 0.01], [x, y - 0.075, z + 0.005], [0, 0, 0], g);
    return m;
  }
  // ω 입
  for (const s of [-1, 1]) {
    const t = mesh(new THREE.TorusGeometry(0.045, 0.014, 8, 20, Math.PI), ink, [x + s * 0.045, y, z], [0, 0, Math.PI], g);
    t.position.z = z + 0.005;
  }
}

// ── 고양이 ─────────────────────────────
const CAT = {
  kangi: { base: "#A9A49F", light: "#F3EEE6", ear: "#E5ABA2", patch: null, tail: "#A9A49F", stripes: "#6F6A66" },
  kaengi: { base: "#FBEBD3", light: "#FFFBF3", ear: "#EFA58C", patch: "#E98A3E", tail: "#E98A3E", stripes: null },
  kongi: { base: "#FBDDB0", light: "#FFF8EC", ear: "#EE9384", patch: "#E7705F", tail: "#FBDDB0", stripes: null },
};
function catHeadTex(v) {
  const p = CAT[v];
  return canvasTex(`cathead-${v}`, 1024, 512, (g, w, h) => {
    g.fillStyle = p.base; g.fillRect(0, 0, w, h);
    // 아래쪽 얼굴(주둥이 둘레)은 밝게
    const gr = g.createRadialGradient(w * 0.25, h * 0.68, 10, w * 0.25, h * 0.68, w * 0.14);
    gr.addColorStop(0, p.light); gr.addColorStop(1, p.light + "00"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    if (p.stripes) { // 이마 줄무늬 + 볼 줄무늬
      g.strokeStyle = p.stripes; g.lineCap = "round";
      for (const [x, len, wd] of [[0.25, 0.13, 16], [0.225, 0.1, 12], [0.275, 0.1, 12]]) { g.lineWidth = wd; g.beginPath(); g.moveTo(w * x, h * 0.08); g.lineTo(w * x, h * (0.08 + len)); g.stroke(); }
      for (const s of [-1, 1]) for (const k of [0, 1]) { g.lineWidth = 10; g.beginPath(); g.moveTo(w * (0.25 + s * 0.13), h * (0.5 + k * 0.07)); g.lineTo(w * (0.25 + s * 0.17), h * (0.49 + k * 0.07)); g.stroke(); }
      for (let i = 0; i < 6; i++) { g.lineWidth = 14; g.beginPath(); g.moveTo(w * (0.55 + i * 0.05), h * 0.15); g.lineTo(w * (0.56 + i * 0.05), h * 0.4); g.stroke(); }
    }
    if (p.patch) { // 왼쪽(보는 사람 기준) 머리 얼룩
      g.fillStyle = p.patch; g.beginPath(); g.ellipse(w * 0.16, h * 0.22, w * 0.11, h * 0.2, -0.3, 0, Math.PI * 2); g.fill();
      if (v === "kaengi") { g.beginPath(); g.ellipse(w * 0.6, h * 0.3, w * 0.15, h * 0.22, 0.2, 0, Math.PI * 2); g.fill(); }
    }
  });
}
function catBodyTex(v) {
  const p = CAT[v];
  return canvasTex(`catbody-${v}`, 512, 256, (g, w, h) => {
    g.fillStyle = p.base; g.fillRect(0, 0, w, h);
    g.fillStyle = v === "kaengi" ? "#FFE9CF" : p.light; g.beginPath(); g.ellipse(w * 0.25, h * 0.62, w * 0.1, h * 0.3, 0, 0, Math.PI * 2); g.fill();
    if (p.stripes) { g.strokeStyle = p.stripes; g.lineWidth = 9; g.lineCap = "round"; for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(w * (0.45 + i * 0.06), h * 0.15); g.lineTo(w * (0.46 + i * 0.06), h * 0.55); g.stroke(); } }
    if (p.patch && v === "kaengi") { g.fillStyle = p.patch; g.beginPath(); g.ellipse(w * 0.7, h * 0.35, w * 0.16, h * 0.3, 0, 0, Math.PI * 2); g.fill(); }
  });
}

export function makeCat(v, mood) {
  const p = CAT[v];
  const g = new THREE.Group();
  const fur = flock(p.base);
  const head = { c: [0, 1.62, 0.02], r: [1.0, 0.82, 0.86] };
  // 몸
  blob(flock("#ffffff", { map: catBodyTex(v) }), [0.6, 0.6, 0.54], [0, 0.6, 0], [0, -Math.PI / 2 + Math.PI / 2, 0], g);
  // 발
  for (const s of [-1, 1]) blob(flock(p.light), [0.2, 0.13, 0.25], [s * 0.26, 0.1, 0.24], [0, 0, 0], g);
  // 팔
  for (const s of [-1, 1]) {
    const up = mood === "wave" && s === 1;
    blob(fur, [0.16, 0.27, 0.16], up ? [0.76, 0.98, 0.22] : [s * 0.52, 0.66, 0.2], [0, 0, up ? -0.9 : s * 0.5], g);
    if (up) blob(flock(p.light), [0.15, 0.14, 0.14], [0.98, 1.2, 0.24], [0, 0, 0], g);
  }
  // 꼬리
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.3, 0.3, -0.4), new THREE.Vector3(0.75, 0.45, -0.5), new THREE.Vector3(0.85, 0.9, -0.45), new THREE.Vector3(0.7, 1.15, -0.4)]);
  mesh(new THREE.TubeGeometry(curve, 40, 0.11, 16, false), flock(p.tail), [0, 0, 0], [0, 0, 0], g);
  blob(flock(p.tail), [0.11, 0.11, 0.11], [0.7, 1.15, -0.4], [0, 0, 0], g);
  // 머리
  blob(flock("#ffffff", { map: catHeadTex(v) }), head.r, head.c, [0, 0, 0], g);
  // 귀
  for (const s of [-1, 1]) {
    const earCol = v !== "kangi" && s === -1 && p.patch ? p.patch : p.base;
    const e = mesh(new THREE.ConeGeometry(0.3, 0.5, 32), flock(earCol), [s * 0.58, 2.28, -0.02], [0, 0, -s * 0.42], g);
    e.scale.z = 0.62;
    const i = mesh(new THREE.ConeGeometry(0.17, 0.32, 32), flock(p.ear), [s * 0.56, 2.25, 0.1], [0, 0, -s * 0.42], g);
    i.scale.z = 0.4;
  }
  // 주둥이·코
  for (const s of [-1, 1]) blob(flock(p.light), [0.17, 0.13, 0.1], [s * 0.11, 1.4, surfZ(s * 0.11, 1.4, head.c, head.r, -0.04)], [0, 0, 0], g);
  blob(gloss("#E98A8A"), [0.075, 0.05, 0.05], [0, 1.5, surfZ(0, 1.5, head.c, head.r, 0.02)], [0, 0, 0], g);
  eyes(g, { y: 1.66, dx: 0.34, head, mood, wink: v === "kaengi" });
  blush(g, { y: 1.47, dx: 0.52, head });
  mouth(g, { y: 1.36, head, mood: mood === "wave" && v !== "kongi" ? "idle" : mood, kind: v === "kongi" ? "open" : "w" });
  // 수염(짧게)
  const wm = new THREE.MeshBasicMaterial({ color: "#7d716b" });
  for (const s of [-1, 1]) for (const k of [0, 1]) { const w = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.28, 6), wm, [s * 0.5, 1.42 + k * 0.07, 0.72], [0, 0, Math.PI / 2 + s * (k ? -0.12 : 0.1)], g); w.castShadow = false; }
  // 소품
  if (v === "kangi") { // 청록 매듭 노리개
    mesh(new THREE.TorusGeometry(0.5, 0.05, 12, 48), flock("#2F5E5E"), [0, 0.88, 0.04], [Math.PI / 2 - 0.25, 0, 0], g);
    const knot = mesh(new THREE.TorusKnotGeometry(0.07, 0.025, 64, 8), flock("#2F5E5E"), [0, 0.78, 0.56], [0, 0, 0], g);
    knot.scale.set(1, 1, 0.6);
    blob(gloss("#C8A24A"), [0.05, 0.05, 0.05], [0, 0.67, 0.57], [0, 0, 0], g);
    mesh(new THREE.ConeGeometry(0.07, 0.26, 16), flock("#B8463E"), [0, 0.5, 0.55], [Math.PI - 0.15, 0, 0], g);
  }
  if (v === "kaengi") { // 붉은 홀치기 목도리
    const scarf = flock("#C54A3E", { map: canvasTex("hol", 256, 64, (c, w, h) => { c.fillStyle = "#C54A3E"; c.fillRect(0, 0, w, h); c.fillStyle = "#F6E2D2"; for (let i = 0; i < 16; i++) { c.beginPath(); c.arc(i * 16 + 8, h / 2 + ((i % 2) - 0.5) * 18, 4, 0, 7); c.fill(); } }) });
    mesh(new THREE.TorusGeometry(0.5, 0.11, 16, 48), scarf, [0, 0.9, 0.03], [Math.PI / 2 - 0.25, 0, 0], g);
    blob(scarf, [0.13, 0.24, 0.09], [-0.22, 0.66, 0.55], [0, 0, 0.3], g);
    blob(scarf, [0.1, 0.2, 0.08], [-0.08, 0.62, 0.58], [0, 0, -0.2], g);
  }
  if (v === "kongi") { // 색동 깃 + 방울
    ["#D9534F", "#F0C04A", "#5FA36B", "#4A7FB8", "#F2F0EA"].forEach((c, i) => mesh(new THREE.TorusGeometry(0.5 + i * 0.01, 0.035, 10, 48), flock(c), [0, 0.96 - i * 0.05, 0.03], [Math.PI / 2 - 0.25, 0, 0], g));
    blob(gloss("#E3B33E"), [0.1, 0.1, 0.1], [0, 0.66, 0.58], [0, 0, 0], g);
    mesh(new THREE.TorusGeometry(0.1, 0.014, 8, 24), gloss("#9C7330"), [0, 0.66, 0.58], [Math.PI / 2, 0, 0], g);
  }
  return g;
}

// ── 베리쥬 (딸기) ─────────────────────────────
function seeds(g, radiusAt, yFrom, yTo, avoid) {
  const m = gloss("#F2CE5A");
  for (let y = yFrom; y < yTo; y += 0.17) for (let a = 0; a < Math.PI * 2; a += 0.42) {
    const aa = a + (Math.round(y * 10) % 2) * 0.21;
    const r = radiusAt(y); const x = Math.sin(aa) * r, z = Math.cos(aa) * r;
    if (avoid(x, y, z)) continue;
    const s = blob(m, [0.028, 0.045, 0.02], [x * 1.01, y, z * 1.01], [0, 0, 0], g);
    s.lookAt(new THREE.Vector3(x * 2, y, z * 2)); s.scale.set(0.028, 0.045, 0.02);
  }
}
export function makeBerry(mood) {
  const g = new THREE.Group();
  const prof = [[0, 0.05], [0.3, 0.12], [0.62, 0.36], [0.86, 0.75], [0.97, 1.15], [0.95, 1.5], [0.8, 1.8], [0.5, 2.0], [0, 2.06]];
  const pts = prof.map(([r, y]) => new THREE.Vector2(r, y));
  const spline = new THREE.SplineCurve(pts).getPoints(60);
  const body = mesh(new THREE.LatheGeometry(spline, 64), flock("#D9443F", { clearcoat: 0.35, sheen: 0.6 }), [0, 0.12, 0], [0, 0, 0], g);
  body.castShadow = true;
  const rAt = (y) => { const yy = y - 0.12; for (let i = 1; i < spline.length; i++) if (spline[i].y >= yy) return spline[i].x; return 0; };
  const face = { c: [0, 1.25, 0.74], r: [0.56, 0.48, 0.3] };
  seeds(g, rAt, 0.35, 2.0, (x, y, z) => (z > 0.2 && Math.abs(x) < 0.68 && y > 0.75 && y < 1.78));
  blob(flock("#FFF8EE"), face.r, face.c, [0, 0, 0], g);
  // 잎 왕관
  const leaf = flock("#5E9E54");
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const l = blob(leaf, [0.3, 0.06, 0.14], [Math.sin(a) * 0.32, 2.16, Math.cos(a) * 0.32], [0, a + Math.PI / 2, -0.35], g); l.rotation.order = "YXZ"; l.rotation.set(0.35 * Math.cos(a) * 0, a + Math.PI / 2, 0.35); }
  mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.28, 12), leaf, [0.04, 2.3, 0], [0, 0, -0.3], g);
  eyes(g, { y: 1.3, dx: 0.2, head: face, mood, size: 0.95 });
  blush(g, { y: 1.12, dx: 0.33, head: face, size: 0.85 });
  mouth(g, { y: 1.1, head: face, mood, kind: "open" });
  for (const s of [-1, 1]) {
    const up = mood === "wave" && s === 1;
    blob(flock("#FFF8EE"), [0.15, 0.15, 0.15], up ? [0.95, 1.55, 0.2] : [s * 0.98, 1.0, 0.15], [0, 0, 0], g);
    blob(flock("#FFF8EE"), [0.18, 0.12, 0.24], [s * 0.3, 0.1, 0.18], [0, 0, 0], g);
  }
  return g;
}

// ── 대추삼형제 ─────────────────────────────
export function makeDaechu(n, mood) {
  const g = new THREE.Group();
  const dried = n === 1, young = n === 3;
  const tex = canvasTex(`daechu-${n}`, 512, 256, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, 0, h);
    if (young) { gr.addColorStop(0, "#B2363F"); gr.addColorStop(0.55, "#B2363F"); gr.addColorStop(0.7, "#9DBA62"); gr.addColorStop(1, "#8DB257"); }
    else { gr.addColorStop(0, dried ? "#6E2430" : "#A8303A"); gr.addColorStop(1, dried ? "#4B1520" : "#7E2230"); }
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    if (dried) { c.strokeStyle = "#3A0E16"; c.lineWidth = 4; for (let i = 0; i < 40; i++) { c.beginPath(); const x = Math.random() * w, y = Math.random() * h; c.moveTo(x, y); c.quadraticCurveTo(x + 20, y + 10, x + 10, y + 30); c.stroke(); } }
  });
  const body = { c: [0, 1.15, 0], r: [0.86, 1.08, 0.8] };
  blob(flock("#ffffff", { map: tex, clearcoat: dried ? 0.1 : 0.7, sheen: 0.4, roughness: dried ? 0.9 : 0.45 }), body.r, body.c, [0, 0, 0], g);
  // 구름 얼굴
  const face = { c: [0, 1.2, 0.6], r: [0.46, 0.38, 0.28] };
  const cream = flock("#FBF5E8");
  blob(cream, face.r, face.c, [0, 0, 0], g);
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; const x = Math.cos(a) * 0.4, y = 1.2 + Math.sin(a) * 0.32; blob(cream, [0.15, 0.14, 0.12], [x, y, surfZ(x, y, body.c, body.r, -0.08)], [0, 0, 0], g); }
  eyes(g, { y: 1.27, dx: 0.17, head: face, mood: dried && mood === "idle" ? "happy" : mood, wink: n === 3, size: 0.85 });
  blush(g, { y: 1.1, dx: 0.29, head: face, size: 0.7 });
  mouth(g, { y: 1.08, head: face, mood, kind: young ? "open" : "w" });
  // 꼭지와 잎
  mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.3, 12), flock("#6E8F45"), [0.03, 2.3, 0], [0, 0, -0.3], g);
  if (dried || n === 2) blob(flock("#6FA052"), [0.22, 0.05, 0.11], [0.22, 2.38, 0], [0, 0, 0.4], g);
  const limb = flock(young || n === 2 ? "#8FB55E" : "#5E1F27");
  for (const s of [-1, 1]) {
    const up = mood === "wave" && s === 1;
    blob(cream, [0.14, 0.14, 0.14], up ? [0.86, 1.6, 0.2] : [s * 0.88, 1.0, 0.15], [0, 0, 0], g);
    blob(limb, [0.18, 0.12, 0.24], [s * 0.3, 0.1, 0.18], [0, 0, 0], g);
  }
  return g;
}

// ── 스윗포 (고구마) ─────────────────────────────
export function makeSweetpo(mood) {
  const g = new THREE.Group();
  const tex = canvasTex("sweetpo", 512, 256, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#9B3D63"); gr.addColorStop(1, "#6E2546"); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.strokeStyle = "#4A1530"; c.lineWidth = 3; c.lineCap = "round";
    for (let i = 0; i < 26; i++) { const x = (i * 97) % w, y = (i * 53) % h; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 14, y + 3); c.stroke(); c.fillStyle = "#4A1530"; c.beginPath(); c.arc(x + 30, y + 12, 3, 0, 7); c.fill(); }
  });
  blob(flock("#ffffff", { map: tex, sheen: 0.7 }), [0.92, 1.12, 0.84], [0, 1.18, 0], [0, 0, 0.06], g);
  const face = { c: [0, 1.24, 0.66], r: [0.54, 0.46, 0.28] };
  const yel = flock("#F6CE58");
  blob(yel, face.r, face.c, [0, 0, 0], g);
  eyes(g, { y: 1.3, dx: 0.2, head: face, mood, size: 0.95 });
  blush(g, { y: 1.12, dx: 0.34, head: face, color: "#EE8E6A", size: 0.85 });
  mouth(g, { y: 1.1, head: face, mood, kind: "w" });
  // 새싹
  for (const s of [-1, 1]) blob(flock("#8DBB4E"), [0.24, 0.06, 0.12], [s * 0.18, 2.36, 0], [0, 0, s * -0.6], g);
  mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.22, 10), flock("#6E9A3C"), [0, 2.26, 0], [0, 0, 0], g);
  for (const s of [-1, 1]) {
    const up = mood === "wave" && s === 1;
    blob(yel, [0.15, 0.15, 0.15], up ? [0.98, 1.65, 0.2] : [s * 0.96, 1.0, 0.15], [0, 0, 0], g);
    blob(yel, [0.19, 0.12, 0.25], [s * 0.3, 0.1, 0.18], [0, 0, 0], g);
  }
  return g;
}

export function makeCharacter(id, mood) {
  if (id === "kangi" || id === "kaengi" || id === "kongi") return makeCat(id, mood);
  if (id === "berijyu") return makeBerry(mood);
  if (id.startsWith("daechu")) return makeDaechu(Number(id.split("-")[1]), mood);
  if (id === "sweetpo") return makeSweetpo(mood);
  throw new Error("unknown " + id);
}
