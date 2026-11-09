// 강경근대거리 건물 미니어처 — 1920~30년대 근대 거리의 전형적인 건축 특징을 살린 창작 모델
//  · 한옥: 팔작지붕(곡선 처마 + 기와골 + 흰 용마루), 기단, 나무 기둥, 창호
//  · 붉은 벽돌 근대 건물: 아치 창, 흰 테두리 돌림띠, 박공 장식 (근대 은행·관공서 풍)
//  · 2층 근대 상가: 회벽 + 맞배 기와지붕 + 2층 난간 + 큰 간판
//  · 목조 상점(적산가옥 풍): 비늘판 벽 + 맞배 기와지붕 + 처마 차양 + 간판
// 각 건물에는 장소 이름을 쓴 간판을 답니다. 실제 개별 건물의 외관을 그대로 재현한 것은 아닙니다.
import * as THREE from "three";
import { flock, canvasTex, mesh } from "./models.js";

// ── 기와 ─────────────────────────────
const GIWA = "#55606A";
function giwaTex(color = GIWA) {
  return canvasTex(`giwa-${color}`, 256, 256, (c, w, h) => {
    c.fillStyle = color; c.fillRect(0, 0, w, h);
    // 기와골: 세로로 볼록한 수키와 줄
    for (let x = 0; x < w; x += 16) {
      const g = c.createLinearGradient(x, 0, x + 16, 0);
      g.addColorStop(0, "rgba(0,0,0,.35)"); g.addColorStop(0.35, "rgba(255,255,255,.18)"); g.addColorStop(0.6, "rgba(255,255,255,.05)"); g.addColorStop(1, "rgba(0,0,0,.4)");
      c.fillStyle = g; c.fillRect(x, 0, 16, h);
    }
    // 기와 단 (가로 줄)
    c.fillStyle = "rgba(0,0,0,.22)"; for (let y = 0; y < h; y += 20) c.fillRect(0, y, w, 2);
  });
}

/** 팔작지붕: 오목하게 휘고 네 귀가 들린 기와지붕 */
function paljakRoof(W, D, H, color = GIWA) {
  const seg = 28, geo = new THREE.PlaneGeometry(2, 2, seg, seg);
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i), v = pos.getY(i);
    const m = Math.max(Math.abs(u) * 0.72, Math.abs(v)); // 앞뒤로 긴 용마루
    const y = H * Math.pow(Math.max(0, 1 - m), 1.7) + H * 0.32 * Math.pow(Math.abs(u * v), 3) + H * 0.08 * Math.pow(m, 6);
    pos.setXYZ(i, (u * W) / 2, y, (-v * D) / 2);
    uv.setXY(i, (u * W) / 40, m * 6);
  }
  geo.computeVertexNormals();
  const t = giwaTex(color).clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true;
  const roof = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: t, roughness: 0.75, side: THREE.DoubleSide }));
  roof.castShadow = roof.receiveShadow = true;
  const g = new THREE.Group(); g.add(roof);
  // 용마루(흰 회 + 기와 덮개)와 양 끝 망와
  const rl = W * 0.28;
  mesh(new THREE.BoxGeometry(rl * 2, H * 0.12, 4), flock("#F1EEE6"), [0, H * 1.0, 0], [0, 0, 0], g);
  mesh(new THREE.BoxGeometry(rl * 2 + 2, 2.4, 5), flock("#3E464D"), [0, H * 1.06 + 1, 0], [0, 0, 0], g);
  for (const s of [-1, 1]) mesh(new THREE.ConeGeometry(3.2, 8, 8), flock("#3E464D"), [s * (rl + 1), H * 1.08 + 3, 0], [0, 0, -s * 0.5], g);
  // 처마 끝 서까래 그림자 띠
  return g;
}

/** 맞배지붕: 두 경사면 + 기와 + 용마루 */
function gableRoof(W, D, H, color = GIWA) {
  const g = new THREE.Group();
  const slope = Math.hypot(D / 2, H);
  const t = giwaTex(color).clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(W / 40, slope / 24); t.needsUpdate = true;
  const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.75, side: THREE.DoubleSide });
  for (const s of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(W, slope), m);
    p.position.set(0, H / 2, (s * D) / 4);
    p.rotation.set(-s * Math.atan2(D / 2, H), 0, 0);
    p.castShadow = p.receiveShadow = true; g.add(p);
  }
  mesh(new THREE.BoxGeometry(W + 2, 3, 4), flock("#F1EEE6"), [0, H + 0.5, 0], [0, 0, 0], g);
  mesh(new THREE.BoxGeometry(W + 3, 2, 5), flock("#3E464D"), [0, H + 2.5, 0], [0, 0, 0], g);
  // 박공 벽 (삼각형)
  const tri = new THREE.Shape(); tri.moveTo(-D / 2 + 2, 0); tri.lineTo(D / 2 - 2, 0); tri.lineTo(0, H - 2); tri.closePath();
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.ShapeGeometry(tri), flock("#E9E1CF")); w.rotation.y = Math.PI / 2; w.position.set((s * (W - 4)) / 2, 0, 0); w.castShadow = true; g.add(w); }
  return g;
}

// ── 벽·창·간판 ─────────────────────────────
/** 벽 텍스처와 밤에 빛나는 창문 텍스처를 함께 만듦 */
function facade(key, { wall, cols, rows, kind = "plain", frame = "#4A3426", arch = false }) {
  const draw = (lit) => (c, w, h) => {
    c.fillStyle = lit ? "#000" : wall; c.fillRect(0, 0, w, h);
    if (!lit && kind === "brick") { c.strokeStyle = "rgba(60,20,10,.28)"; c.lineWidth = 2; for (let y = 0; y < h; y += 12) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); for (let x = (y / 12) % 2 ? 0 : 12; x < w; x += 24) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 12); c.stroke(); } } c.fillStyle = "#EDE6D6"; c.fillRect(0, h / rows - 6, w, 6); }
    if (!lit && kind === "board") { c.strokeStyle = "rgba(0,0,0,.25)"; c.lineWidth = 2; for (let y = 0; y < h; y += 10) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } }
    if (!lit && kind === "hanok") { c.fillStyle = "#7A4A30"; for (let x = 0; x <= w; x += w / cols) c.fillRect(x - 4, 0, 8, h); c.fillRect(0, h - 10, w, 10); }
    const cw = w / cols, rh = h / rows;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const x = i * cw + cw * 0.22, y = j * rh + rh * 0.2, ww = cw * 0.56, hh = rh * 0.55;
      if (lit) { c.fillStyle = (i + j * 3) % 4 === 1 ? "#000" : "#FFC873"; }
      else {
        c.fillStyle = frame; c.beginPath(); arch ? (c.rect(x - 3, y + ww / 2, ww + 6, hh - ww / 2 + 3), c.arc(x + ww / 2, y + ww / 2, ww / 2 + 3, Math.PI, 0)) : c.rect(x - 3, y - 3, ww + 6, hh + 6); c.fill();
        c.fillStyle = kind === "hanok" ? "#F4EAD2" : "#A9C6CB";
      }
      c.beginPath(); arch ? (c.rect(x, y + ww / 2, ww, hh - ww / 2), c.arc(x + ww / 2, y + ww / 2, ww / 2, Math.PI, 0)) : c.rect(x, y, ww, hh); c.fill();
      if (!lit) { c.strokeStyle = kind === "hanok" ? "#7A4A30" : frame; c.lineWidth = kind === "hanok" ? 2 : 3; c.beginPath(); c.moveTo(x + ww / 2, y); c.lineTo(x + ww / 2, y + hh); if (kind === "hanok") { for (let k = 1; k < 4; k++) { c.moveTo(x, y + (hh * k) / 4); c.lineTo(x + ww, y + (hh * k) / 4); } } else { c.moveTo(x, y + hh * 0.45); c.lineTo(x + ww, y + hh * 0.45); } c.stroke(); }
    }
  };
  return { map: canvasTex(`fa-${key}`, 256, 256, draw(false)), emi: canvasTex(`fe-${key}`, 256, 256, draw(true)) };
}
function wallMat(f, night) {
  return new THREE.MeshStandardMaterial({ map: f.map, roughness: 0.85, emissiveMap: f.emi, emissive: night ? new THREE.Color("#FFD38A") : new THREE.Color("#000"), emissiveIntensity: night ? 1.1 : 0 });
}
/** 간판: 장소 이름을 붓글씨풍으로 */
function signboard(name, w, color = "#2E3B3D", text = "#F1E6C8") {
  const t = canvasTex(`sign-${name}-${color}`, 512, 128, (c, W, H) => {
    c.fillStyle = color; c.fillRect(0, 0, W, H);
    c.strokeStyle = "#C7A25A"; c.lineWidth = 8; c.strokeRect(6, 6, W - 12, H - 12);
    c.fillStyle = text; c.textAlign = "center"; c.textBaseline = "middle";
    const size = Math.min(84, (W - 40) / Math.max(2, name.length) * 1.05);
    c.font = `700 ${size}px 'Nanum Myeongjo', 'Song Myung', serif`; c.fillText(name, W / 2, H / 2 + 4);
  });
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, w / 4, 1.5), [flock(color), flock(color), flock(color), flock(color), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 }), flock(color)]);
  m.castShadow = true; return m;
}

const box = (g, mat, size, pos, rot = [0, 0, 0]) => mesh(new THREE.BoxGeometry(...size), mat, pos, rot, g);

export function building(a, rand, { night = false } = {}) {
  const g = new THREE.Group();
  const W = Math.max(64, a.w * 0.58), D = W * 0.7, H = a.h * 0.5;
  const wall = a.wall ?? "#E8DCC0", accent = a.roof ?? "#3E4B4D";
  const name = a.name ?? "";
  const stone = flock("#CFC6B5"), wood = flock("#6B4530");
  switch (a.style) {
    case "hanok": { // 팔작지붕 한옥
      box(g, stone, [W * 1.08, 6, D * 1.1], [0, 3, 0]);
      const f = facade(`hanok-${a.id}`, { wall: "#EFE6D2", cols: 4, rows: 1, kind: "hanok" });
      box(g, wallMat(f, night), [W, H * 0.62, D], [0, 6 + H * 0.31, 0]);
      for (const sx of [-0.5, -0.17, 0.17, 0.5]) box(g, wood, [3.4, H * 0.66, 3.4], [sx * W, 6 + H * 0.33, D / 2 + 1]);
      box(g, wood, [W + 4, 4, D + 4], [0, 6 + H * 0.64, 0]);
      const r = paljakRoof(W * 1.42, D * 1.55, H * 0.62); r.position.y = 6 + H * 0.64; g.add(r);
      const s = signboard(name, Math.min(W * 0.55, 46), "#3B2A20"); s.position.set(0, 6 + H * 0.56, D / 2 + 2.6); g.add(s);
      break;
    }
    case "brick": { // 붉은 벽돌 근대 건물 (아치 창, 흰 돌림띠, 박공)
      const f = facade(`brick-${a.id}`, { wall: a.wall ?? "#9A4B3A", cols: 3, rows: 2, kind: "brick", frame: "#EDE6D6", arch: true });
      box(g, wallMat(f, night), [W, H, D], [0, H / 2, 0]);
      box(g, flock("#EDE6D6"), [W + 4, 4, D + 4], [0, H + 2, 0]);
      for (const sx of [-1, 1]) box(g, flock("#EDE6D6"), [4, H, 4], [(sx * W) / 2, H / 2, D / 2]);
      const ped = new THREE.Shape(); ped.moveTo(-W * 0.3, 0); ped.lineTo(W * 0.3, 0); ped.lineTo(0, H * 0.22); ped.closePath();
      const p = new THREE.Mesh(new THREE.ExtrudeGeometry(ped, { depth: 3, bevelEnabled: false }), flock("#EDE6D6")); p.position.set(0, H + 4, D / 2 - 2); p.castShadow = true; g.add(p);
      box(g, flock("#5A3A2A"), [W * 0.2, H * 0.32, 2], [0, H * 0.16, D / 2 + 1]);
      box(g, flock("#8E8578"), [W - 6, 4, D - 6], [0, H + 5, 0]);
      const s = signboard(name, Math.min(W * 0.6, 50), "#2E3B3D"); s.position.set(0, H * 0.43, D / 2 + 2); g.add(s);
      break;
    }
    case "western": { // 2층 근대 상가: 회벽 + 맞배 기와 + 2층 난간 + 큰 간판
      const f = facade(`mod-${a.id}`, { wall, cols: 4, rows: 2, kind: "plain", frame: "#3E4B4D" });
      box(g, wallMat(f, night), [W, H, D], [0, H / 2, 0]);
      box(g, flock("#F4EFE4"), [W + 3, 3, D + 3], [0, H * 0.5, 0]);
      box(g, flock("#3E4B4D"), [W * 0.9, 1.5, 6], [0, H * 0.52, D / 2 + 3]);
      for (let i = 0; i <= 8; i++) box(g, flock("#3E4B4D"), [1, 5, 1], [-W * 0.45 + (i * W * 0.9) / 8, H * 0.52 + 3, D / 2 + 5.5]);
      box(g, flock("#3E4B4D"), [W * 0.9, 1.2, 1.2], [0, H * 0.52 + 6, D / 2 + 5.5]);
      const r = gableRoof(W + 8, D + 10, H * 0.36, a.roof === "#963F38" ? "#6B4A44" : GIWA); r.position.y = H; g.add(r);
      box(g, flock("#5A3A2A"), [W * 0.18, H * 0.34, 2], [0, H * 0.17, D / 2 + 1]);
      const s = signboard(name, Math.min(W * 0.75, 58), accent); s.position.set(0, H * 0.43, D / 2 + 2.5); g.add(s);
      break;
    }
    case "tower": { // 시계탑이 있는 근대 건물
      const f = facade(`tow-${a.id}`, { wall, cols: 3, rows: 2, kind: "plain", frame: "#5A3A2A", arch: true });
      box(g, wallMat(f, night), [W, H * 0.85, D], [0, H * 0.425, 0]);
      box(g, flock("#EDE6D6"), [W + 4, 4, D + 4], [0, H * 0.85 + 2, 0]);
      box(g, flock(wall), [W * 0.32, H * 0.42, D * 0.38], [0, H * 0.85 + H * 0.21, 0]);
      const face = mesh(new THREE.CylinderGeometry(W * 0.11, W * 0.11, 1.5, 24), new THREE.MeshStandardMaterial({ color: "#F7F2E8", emissive: night ? "#FFE3A8" : "#000", emissiveIntensity: night ? 0.8 : 0 }), [0, H * 1.08, D * 0.19 + 1], [Math.PI / 2, 0, 0], g); face.castShadow = false;
      box(g, flock("#2B2220"), [1, W * 0.08, 0.6], [0, H * 1.1, D * 0.19 + 2]);
      const cap = mesh(new THREE.ConeGeometry(W * 0.28, H * 0.28, 4), flock(accent), [0, H * 1.27 + H * 0.14, 0], [0, Math.PI / 4, 0], g); cap.castShadow = true;
      const s = signboard(name, Math.min(W * 0.7, 54), accent); s.position.set(0, H * 0.4, D / 2 + 2); g.add(s);
      break;
    }
    case "shop": { // 목조 상점 (비늘판 벽 + 맞배 기와 + 차양 + 간판)
      const f = facade(`shop-${a.id}`, { wall: "#B9875E", cols: 3, rows: 1, kind: "board", frame: "#3A2418" });
      box(g, wallMat(f, night), [W, H * 0.7, D], [0, H * 0.35, 0]);
      const r = gableRoof(W + 8, D + 10, H * 0.32); r.position.y = H * 0.7; g.add(r);
      const aw = canvasTex(`awn-${accent}`, 64, 16, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? "#F4EFE4" : accent; c.fillRect(i * 8, 0, 8, h); } });
      box(g, new THREE.MeshStandardMaterial({ map: aw }), [W * 0.92, 1.6, 12], [0, H * 0.42, D / 2 + 6], [0.4, 0, 0]);
      const s = signboard(name, Math.min(W * 0.8, 54), accent); s.position.set(0, H * 0.6, D / 2 + 2); g.add(s);
      break;
    }
    case "station": { // 옛 주유소: 차양 지붕 + 작은 사무실 + 주유기
      const f = facade(`st-${a.id}`, { wall: "#EDE3CC", cols: 2, rows: 1, kind: "plain" });
      box(g, wallMat(f, night), [W * 0.45, H * 0.62, D * 0.6], [-W * 0.3, H * 0.31, -D * 0.1]);
      box(g, flock(accent), [W * 1.15, 4, D * 0.95], [W * 0.05, H * 0.82, 0]);
      box(g, flock("#F4EFE4"), [W * 1.17, 2, D * 0.97], [W * 0.05, H * 0.82 - 3, 0]);
      for (const sx of [-0.1, 0.5]) for (const sz of [-0.3, 0.3]) box(g, flock("#F4EFE4"), [3, H * 0.8, 3], [W * sx, H * 0.4, D * sz]);
      for (const sx of [0.12, 0.3]) { box(g, flock("#C9463D"), [6, 14, 5], [W * sx, 7, D * 0.05]); box(g, flock("#F4EFE4"), [4, 4, 5.2], [W * sx, 11, D * 0.05]); }
      const s = signboard(name, Math.min(W * 0.75, 54), accent); s.position.set(W * 0.05, H * 0.82 + 7, D * 0.48); g.add(s);
      break;
    }
    case "lighthouse": {
      const t = mesh(new THREE.CylinderGeometry(W * 0.2, W * 0.28, H * 1.4, 32), flock("#ffffff", { map: canvasTex("lh", 64, 128, (c, w, h) => { for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? "#C9463D" : "#F7F2E8"; c.fillRect(0, (i * h) / 6, w, h / 6); } }) }), [0, H * 0.7, 0], [0, 0, 0], g);
      mesh(new THREE.CylinderGeometry(W * 0.24, W * 0.24, 4, 32), flock("#3E4B4D"), [0, H * 1.42, 0], [0, 0, 0], g);
      mesh(new THREE.CylinderGeometry(W * 0.15, W * 0.15, 10, 24), new THREE.MeshStandardMaterial({ color: "#F6D27A", emissive: "#F6C25A", emissiveIntensity: night ? 2.2 : 0.6 }), [0, H * 1.49, 0], [0, 0, 0], g);
      mesh(new THREE.ConeGeometry(W * 0.2, 10, 24), flock("#C9463D"), [0, H * 1.6, 0], [0, 0, 0], g);
      box(g, stone, [W * 0.8, 4, W * 0.8], [0, 2, 0]);
      if (night) { const l = new THREE.PointLight("#FFD58A", 4000, 300, 2); l.position.set(0, H * 1.5, 0); g.add(l); }
      break;
    }
  }
  if (night && a.style !== "lighthouse") { const l = new THREE.PointLight("#FFC879", 700, 110, 2); l.position.set(0, H * 0.4, D / 2 + 14); g.add(l); }
  g.rotation.y = (rand() - 0.5) * 0.1;
  return g;
}
