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
    case "lighthouse": { // 기억의 등대: 짙은 초록 주물 기둥 + 비늘무늬 양파 돔 + 금빛 글씨 띠 + LED 화면 + 돌 받침
      const GREEN = "#1F4A3A";
      const iron = new THREE.MeshPhysicalMaterial({ color: GREEN, roughness: 0.35, metalness: 0.25, clearcoat: 0.6 });
      const R = 9; // 기둥 반지름
      // 바닥: 둥근 모자이크 돌바닥
      const mosaic = canvasTex("mosaic", 512, 512, (c, w, h) => {
        c.fillStyle = "#E3E1DC"; c.fillRect(0, 0, w, h);
        for (let r = 20; r < w * 0.7; r += 14) for (let t = 0; t < Math.PI * 2; t += 10 / r) {
          const x = w / 2 + Math.cos(t) * r, y = h / 2 + Math.sin(t) * r;
          c.fillStyle = ((r / 14) | 0) % 3 === 0 ? "#3E4148" : (Math.random() < 0.5 ? "#C9C7C2" : "#F2F1EE"); c.fillRect(x - 3, y - 3, 6, 6);
        }
      });
      const plaza = mesh(new THREE.CylinderGeometry(W * 0.62, W * 0.62, 0.8, 48), new THREE.MeshStandardMaterial({ map: mosaic, roughness: 0.9 }), [0, 0.4, 0], [0, 0, 0], g); plaza.receiveShadow = true;
      // 돌 받침 2단
      const cobble = canvasTex("cobble", 256, 64, (c, w, h) => { c.fillStyle = "#8C8A86"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) for (let x = ((y / 16) % 2) * 12; x < w; x += 24) { c.fillStyle = ["#A29F99", "#7E7B76", "#96938C"][(x + y) % 3]; c.fillRect(x + 1, y + 1, 22, 14); } });
      const ct = cobble.clone(); ct.wrapS = THREE.RepeatWrapping; ct.repeat.set(4, 1); ct.needsUpdate = true;
      mesh(new THREE.CylinderGeometry(R * 2.3, R * 2.4, 5, 40), new THREE.MeshStandardMaterial({ map: ct, roughness: 0.95 }), [0, 3.2, 0], [0, 0, 0], g);
      mesh(new THREE.CylinderGeometry(R * 1.65, R * 1.7, 3, 40), new THREE.MeshStandardMaterial({ map: ct, roughness: 0.95 }), [0, 7, 0], [0, 0, 0], g);
      // 주물 받침대와 아래 장식 고리
      mesh(new THREE.CylinderGeometry(R * 1.12, R * 1.2, 4, 40), iron, [0, 10.5, 0], [0, 0, 0], g);
      mesh(new THREE.TorusGeometry(R * 1.1, 0.8, 8, 40), iron, [0, 12.5, 0], [Math.PI / 2, 0, 0], g);
      // LED 화면 기둥 (밤에는 노을빛 화면이 빛남)
      const led = canvasTex("led", 512, 256, (c, w, h) => {
        const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#C9A9D8"); gr.addColorStop(0.35, "#E26C5C"); gr.addColorStop(0.6, "#2B2E44"); gr.addColorStop(1, "#1B1D2A");
        c.fillStyle = gr; c.fillRect(0, 0, w, h);
        c.fillStyle = "rgba(255,255,255,.85)"; c.font = "bold 18px sans-serif";
        for (let i = 0; i < 4; i++) c.fillText(["기억의 등대", "1846", "강경의 내일", "MEMORY"][i], 30 + i * 120, 80 + (i % 2) * 70);
        c.fillStyle = "#1F4A3A"; for (let i = 0; i < 4; i++) c.fillRect((i * w) / 4, 0, 10, h);
      });
      const colH = 30;
      mesh(new THREE.CylinderGeometry(R, R, colH, 40), new THREE.MeshStandardMaterial({ map: led, emissiveMap: led, emissive: night ? "#FFFFFF" : "#000000", emissiveIntensity: night ? 0.9 : 0, roughness: 0.4 }), [0, 13 + colH / 2, 0], [0, 0, 0], g);
      for (let i = 0; i < 2; i++) mesh(new THREE.BoxGeometry(1.8, colH, 1.8), iron, [Math.cos(i * Math.PI + 0.3) * R, 13 + colH / 2, Math.sin(i * Math.PI + 0.3) * R], [0, 0, 0], g);
      // 금빛 글씨 띠 (처마)
      const band = canvasTex("lhband", 1024, 64, (c, w, h) => { c.fillStyle = GREEN; c.fillRect(0, 0, w, h); c.fillStyle = "#D9B25E"; c.font = "bold 40px serif"; c.textBaseline = "middle"; c.fillText("THE LIGHTHOUSE OF MEMORY · 기억의 등대 · THE LIGHTHOUSE OF MEMORY", 10, h / 2 + 2); });
      const bandT = band.clone(); bandT.needsUpdate = true;
      mesh(new THREE.CylinderGeometry(R * 1.4, R * 1.3, 4.5, 48), new THREE.MeshPhysicalMaterial({ map: bandT, roughness: 0.35, metalness: 0.25, clearcoat: 0.6 }), [0, 13 + colH + 2.2, 0], [0, 0, 0], g);
      mesh(new THREE.CylinderGeometry(R * 1.42, R * 1.42, 0.8, 48), iron, [0, 13 + colH + 4.8, 0], [0, 0, 0], g);
      mesh(new THREE.CylinderGeometry(R * 0.85, R * 0.9, 2.5, 8), iron, [0, 13 + colH + 6.3, 0], [0, 0, 0], g);
      // 비늘무늬 양파 돔
      const scales = canvasTex("scales", 256, 256, (c, w, h) => { c.fillStyle = "#173A2D"; c.fillRect(0, 0, w, h); for (let y = 0; y < h + 20; y += 18) for (let x = ((y / 18) % 2) * 12; x < w + 24; x += 24) { const gr = c.createRadialGradient(x, y - 4, 2, x, y, 14); gr.addColorStop(0, "#3C7A60"); gr.addColorStop(1, "#173A2D"); c.fillStyle = gr; c.beginPath(); c.arc(x, y, 12, 0, Math.PI); c.fill(); c.strokeStyle = "rgba(0,0,0,.4)"; c.lineWidth = 1.5; c.stroke(); } });
      const sc = scales.clone(); sc.wrapS = sc.wrapT = THREE.RepeatWrapping; sc.repeat.set(3, 2); sc.needsUpdate = true;
      const prof = [[0, 0], [R * 0.95, 0], [R * 1.12, 3], [R * 1.08, 7], [R * 0.8, 11], [R * 0.42, 14], [R * 0.22, 15.5], [0, 16]].map(([r, y]) => new THREE.Vector2(r, y));
      mesh(new THREE.LatheGeometry(new THREE.SplineCurve(prof).getPoints(30), 40), new THREE.MeshPhysicalMaterial({ map: sc, roughness: 0.4, metalness: 0.2, clearcoat: 0.7 }), [0, 13 + colH + 7.5, 0], [0, 0, 0], g);
      // 꼭대기 장식
      const fin = [[0, 0], [2.4, 0], [2.6, 1], [1, 2], [1.6, 3.5], [0.6, 5], [1.1, 6.5], [0.3, 9], [0, 9.5]].map(([r, y]) => new THREE.Vector2(r, y));
      mesh(new THREE.LatheGeometry(fin, 20), iron, [0, 13 + colH + 23, 0], [0, 0, 0], g);
      // 초록 볼라드 + 쇠사슬
      const n = 10, br = W * 0.5;
      for (let i = 0; i < n; i++) {
        const t0 = (i / n) * Math.PI * 2, x = Math.cos(t0) * br, z = Math.sin(t0) * br;
        mesh(new THREE.CylinderGeometry(0.9, 1.1, 9, 12), iron, [x, 4.5, z], [0, 0, 0], g);
        mesh(new THREE.SphereGeometry(1.2, 12, 8), iron, [x, 9.4, z], [0, 0, 0], g);
        const t1 = ((i + 1) / n) * Math.PI * 2, x1 = Math.cos(t1) * br, z1 = Math.sin(t1) * br;
        const chain = new THREE.CatmullRomCurve3([new THREE.Vector3(x, 8, z), new THREE.Vector3((x + x1) / 2 * 0.98, 5.5, (z + z1) / 2 * 0.98), new THREE.Vector3(x1, 8, z1)]);
        mesh(new THREE.TubeGeometry(chain, 10, 0.25, 4), new THREE.MeshStandardMaterial({ color: "#4A3A30", roughness: 0.6, metalness: 0.5 }), [0, 0, 0], [0, 0, 0], g);
      }
      // 뒤쪽 나무 울타리 + 측백나무 줄
      const fence = canvasTex("fence", 256, 64, (c, w, h) => { c.fillStyle = "#B4552A"; c.fillRect(0, 0, w, h); c.strokeStyle = "rgba(60,20,5,.35)"; for (let x = 0; x < w; x += 8) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } });
      mesh(new THREE.BoxGeometry(W * 1.5, 22, 2), new THREE.MeshStandardMaterial({ map: fence, roughness: 0.8 }), [0, 11, -W * 0.72], [0, 0, 0], g);
      for (let i = 0; i < 9; i++) mesh(new THREE.ConeGeometry(3.2, 15, 10), flock(i % 3 === 1 ? "#9A9A4A" : "#3F6B3A"), [-W * 0.62 + i * W * 0.155, 7.5, -W * 0.62], [0, 0, 0], g);
      if (night) { const l = new THREE.PointLight("#E9A9C8", 1800, 160, 2); l.position.set(0, 30, R * 2.2); g.add(l); }
      g.scale.setScalar(1.5);
      break;
    }
  }
  if (night && a.style !== "lighthouse") { const l = new THREE.PointLight("#FFC879", 700, 110, 2); l.position.set(0, H * 0.4, D / 2 + 14); g.add(l); }
  g.rotation.y = (rand() - 0.5) * 0.1;
  return g;
}
