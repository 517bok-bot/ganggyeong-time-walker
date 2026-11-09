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

/** 글자 간판 (가로/세로, 전구 테두리 선택) */
function plate(text, w, h, { bg = "#F1D66A", fg = "#1F3C88", border = "#7A5A2A", bulbs = false, vertical = false, sub = "", subColor = "#C0392B", font = "'Nanum Myeongjo', serif", night = false } = {}) {
  const PW = vertical ? 128 : 512, PH = vertical ? 512 : Math.round(512 * (h / w));
  const t = canvasTex(`plate-${text}-${bg}-${w}-${h}-${bulbs}`, PW, PH, (c, W, H) => {
    c.fillStyle = bg; c.fillRect(0, 0, W, H); c.strokeStyle = border; c.lineWidth = 10; c.strokeRect(5, 5, W - 10, H - 10);
    if (bulbs) { c.fillStyle = "#FFF6D0"; const n = vertical ? 8 : 16; for (let i = 0; i <= n; i++) { for (const y of [10, H - 10]) { c.beginPath(); c.arc(10 + (i * (W - 20)) / n, y, 6, 0, 7); c.fill(); } } }
    c.fillStyle = fg; c.textAlign = "center"; c.textBaseline = "middle";
    if (vertical) { const n = [...text].length; const sz = Math.min(96, (H - 30) / n); c.font = `700 ${sz}px ${font}`; [...text].forEach((ch, i) => c.fillText(ch, W / 2, 20 + sz / 2 + i * sz)); }
    else if (sub) { c.font = `700 ${H * 0.36}px ${font}`; c.fillText(text, W / 2, H * 0.36); c.fillStyle = subColor; c.font = `800 ${H * 0.26}px sans-serif`; c.fillText(sub, W / 2, H * 0.74); }
    else { const sz = Math.min(H * 0.62, (W - 40) / Math.max(2, [...text].length) * 1.1); c.font = `700 ${sz}px ${font}`; c.fillText(text, W / 2, H / 2 + 3); }
  });
  const face = new THREE.MeshStandardMaterial({ map: t, roughness: 0.6, emissiveMap: t, emissive: night && bulbs ? "#FFFFFF" : "#000", emissiveIntensity: night && bulbs ? 0.5 : 0 });
  const side = flock(border);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.2), [side, side, side, side, face, side]); m.castShadow = true; return m;
}


/** 회녹색 금속 판 지붕(모임지붕) — 강경구락부 건물들 */
function metalHip(Wr, Dr, Hr, color = "#7D8C86") {
  const t = canvasTex(`seam-${color}`, 256, 64, (c, w, h) => { c.fillStyle = color; c.fillRect(0, 0, w, h); c.fillStyle = "rgba(255,255,255,.25)"; for (let x = 0; x < w; x += 16) c.fillRect(x, 0, 2, h); c.fillStyle = "rgba(0,0,0,.15)"; for (let x = 8; x < w; x += 16) c.fillRect(x, 0, 1, h); });
  const tt = t.clone(); tt.wrapS = THREE.RepeatWrapping; tt.repeat.set(Wr / 30, 1); tt.needsUpdate = true;
  const r = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 4, 1), new THREE.MeshStandardMaterial({ map: tt, roughness: 0.45, metalness: 0.35 }));
  r.rotation.y = Math.PI / 4; r.scale.set(Wr * 0.72, Hr, Dr * 0.72); r.castShadow = r.receiveShadow = true; return r;
}
function brickMat(key, cols, rows, { frame = "#2E3B3A", arch = false, night = false } = {}) { return wallMat(facade(key, { wall: "#8E4A3A", cols, rows, kind: "brick", frame, arch }), night); }

/** 클래식카 (강경모던상회 포토존) */
function classicCar() {
  const g = new THREE.Group();
  const body = new THREE.MeshPhysicalMaterial({ color: "#1E1E22", roughness: 0.3, clearcoat: 1 });
  const chrome = new THREE.MeshPhysicalMaterial({ color: "#D8D8D8", metalness: 1, roughness: 0.2 });
  mesh(new THREE.BoxGeometry(26, 6, 11), body, [0, 6, 0], [0, 0, 0], g);
  mesh(new THREE.BoxGeometry(13, 8, 10.5), body, [-3, 13, 0], [0, 0, 0], g);
  mesh(new THREE.BoxGeometry(12.6, 5, 10.8), new THREE.MeshPhysicalMaterial({ color: "#9FC4D6", roughness: 0.1, transmission: 0.3 }), [-3, 13.5, 0], [0, 0, 0], g);
  mesh(new THREE.BoxGeometry(7, 5, 9), body, [10, 9, 0], [0, 0, 0], g);
  mesh(new THREE.BoxGeometry(1, 5, 8), chrome, [13.6, 8.5, 0], [0, 0, 0], g);
  for (const sz of [-1, 1]) for (const sx of [-8.5, 8.5]) { mesh(new THREE.CylinderGeometry(3.6, 3.6, 2.4, 20), flock("#151515"), [sx, 3.6, sz * 6], [Math.PI / 2, 0, 0], g); mesh(new THREE.CylinderGeometry(1.8, 1.8, 2.6, 16), chrome, [sx, 3.6, sz * 6], [Math.PI / 2, 0, 0], g); }
  for (const sz of [-1, 1]) mesh(new THREE.BoxGeometry(22, 0.8, 2.5), body, [0, 4.5, sz * 6.6], [0, 0, 0], g);
  for (const sz of [-1, 1]) mesh(new THREE.SphereGeometry(1.3, 12, 10), new THREE.MeshStandardMaterial({ color: "#FFF4C8", emissive: "#FFE9A0", emissiveIntensity: 0.6 }), [14, 10, sz * 3.2], [0, 0, 0], g);
  return g;
}

// 현장 사진으로 확인한 건물은 전용 모양으로
const REAL = { "welcome-center": "welcome", "music-library": "musichall", "ganggyeong-gwan": "theater", cinema: "cinema", gallery: "gallerygg", "dance-hall": "dancehall", "coffee-interview": "coffeehouse", "hotel-west": "hotel", "hotel-east": "clubround", "hotel-family": "clubpavilion", "hana-donkatsu": "hana", "modern-store": "modernstore", milmyeon: "taechang", tailor: "tailor", gwangshin: "gasoil", daecheong: "daeseong", "photo-studio": "photo" };

export function building(a, rand, { night = false } = {}) {
  const g = new THREE.Group();
  const W = Math.max(64, a.w * 0.58), D = W * 0.7, H = a.h * 0.5;
  const wall = a.wall ?? "#E8DCC0", accent = a.roof ?? "#3E4B4D";
  const name = a.name ?? "";
  const stone = flock("#CFC6B5"), wood = flock("#6B4530");
  switch (REAL[a.id] ?? a.style) {
    case "coffeehouse": { // 커-피하우스(江景俱樂部): 크림 석재 + 붉은 벽돌 기둥, 회녹색 금속 모임지붕, 팔각 현관, 검은 격자 문, 오래된 나무 간판
      box(g, flock("#E6DFCF"), [W * 1.3, H * 0.55, D], [0, H * 0.275, 0]);
      for (const sx of [-0.5, -0.25, 0, 0.25, 0.5]) box(g, brickMat(`ch-${sx}`, 1, 1), [5, H * 0.55, 5], [sx * W * 1.2, H * 0.275, D / 2 + 2]);
      for (const sx of [-0.37, -0.12, 0.12, 0.37]) box(g, flock("#1E2422"), [W * 0.12, H * 0.42, 1], [sx * W * 1.2, H * 0.21, D / 2 + 1]);
      box(g, flock("#EDE7DA"), [W * 1.36, 3, D + 6], [0, H * 0.55 + 1.5, 0]);
      const r = metalHip(W * 1.4, D * 1.2, H * 0.36); r.position.y = H * 0.55 + 3 + H * 0.18; g.add(r);
      box(g, flock("#C9C6BE"), [W * 1.4, 2, 10], [0, 1, D / 2 + 6]);
      const sg = plate("커-피하우스", W * 0.42, 6, { bg: "#E8E1D0", fg: "#2B2220", border: "#6B5A48", font: "'Song Myung', serif" }); sg.position.set(-W * 0.3, H * 0.5, D / 2 + 3.2); g.add(sg);
      ["江", "景", "俱", "樂", "部"].forEach((ch, i) => { const d = plate(ch, 4, 4, { bg: "#F4F1EA", fg: "#6B2A26", border: "#6B2A26", font: "'Song Myung', serif" }); d.position.set(W * 0.05 + i * 6, H * 0.5, D / 2 + 1); g.add(d); });
      break;
    }
    case "hotel": { // 강경호텔: 붉은 벽돌 + 크림 석재 2층, 아치 창, 화려한 전구 마퀴 간판, 회색 금속 지붕
      const Wh = W * 1.25;
      box(g, brickMat(`hot-${a.id}`, 5, 2, { frame: "#E6DFCF", arch: true, night }), [Wh, H, D], [0, H / 2, 0]);
      for (const sx of [-0.35, -0.05, 0.25]) box(g, flock("#E6DFCF"), [Wh * 0.16, H, 1], [sx * Wh, H / 2, D / 2 + 0.6]);
      box(g, flock("#E6DFCF"), [Wh + 3, 4, D + 3], [0, H + 2, 0]);
      const r = metalHip(Wh + 4, D + 4, H * 0.22, "#6E7A80"); r.position.y = H + 4 + H * 0.11; g.add(r);
      const mq = plate("강경호텔", W * 0.42, 6, { bg: "#3A2E68", fg: "#F6E7A8", border: "#D9B25E", bulbs: true, night, font: "'Song Myung', serif" }); mq.position.set(0, H * 0.5, D / 2 + 4); g.add(mq);
      const top = plate("HOTEL", W * 0.24, 5, { bg: "#C8322B", fg: "#F6E7A8", border: "#3A2E68", font: "serif" }); top.position.set(0, H * 0.58, D / 2 + 4); g.add(top);
      for (const sx of [-1, 1]) box(g, flock("#E6DFCF"), [3, H * 0.48, 3], [sx * W * 0.2, H * 0.24, D / 2 + 4]);
      box(g, flock("#6B4530"), [W * 0.2, H * 0.36, 1.5], [0, H * 0.18, D / 2 + 1]);
      break;
    }
    case "clubround": { // 둥근 창이 있는 크림 석재 건물 + 기둥 포치 (강경구락부)
      box(g, flock("#E9E3D4"), [W, H * 1.05, D], [0, H * 0.525, 0]);
      for (const y of [H * 0.75, H * 0.3]) { mesh(new THREE.TorusGeometry(5, 1.2, 10, 24), flock("#CFC6B2"), [-W * 0.25, y, D / 2 + 0.6], [0, 0, 0], g); mesh(new THREE.CircleGeometry(4.5, 24), new THREE.MeshStandardMaterial({ color: "#2F4A50", emissive: night ? "#FFC873" : "#000", emissiveIntensity: night ? 0.8 : 0 }), [-W * 0.25, y, D / 2 + 0.7], [0, 0, 0], g); }
      box(g, brickMat(`cr-${a.id}`, 3, 1, { arch: true, night }), [W * 0.5, H * 0.45, 1], [W * 0.2, H * 0.25, D / 2 + 0.6]);
      box(g, flock("#E9E3D4"), [W * 0.8, 3, 18], [W * 0.05, H * 0.55, D / 2 + 9]);
      for (const sx of [-0.25, 0.35]) mesh(new THREE.CylinderGeometry(2.4, 2.6, H * 0.55, 16), flock("#D9D4C6"), [sx * W, H * 0.275, D / 2 + 16], [0, 0, 0], g);
      box(g, flock("#D9D4C6"), [W + 3, 3, D + 3], [0, H * 1.05 + 1.5, 0]);
      break;
    }
    case "clubpavilion": { // 검은 돔 지붕의 유리 정자 + 맞은편 벽돌 건물 (강경구락부)
      mesh(new THREE.CylinderGeometry(W * 0.36, W * 0.38, H * 0.5, 8), new THREE.MeshPhysicalMaterial({ color: "#2E4A4A", roughness: 0.15, transmission: 0.2, emissive: night ? "#FFC873" : "#000", emissiveIntensity: night ? 0.5 : 0 }), [0, H * 0.25, 0], [0, Math.PI / 8, 0], g);
      for (let i = 0; i < 8; i++) { const t0 = (i / 8) * Math.PI * 2; box(g, flock("#E9E3D4"), [2.4, H * 0.5, 2.4], [Math.cos(t0) * W * 0.37, H * 0.25, Math.sin(t0) * W * 0.37]); }
      mesh(new THREE.CylinderGeometry(W * 0.42, W * 0.42, 3, 8), flock("#E9E3D4"), [0, H * 0.52, 0], [0, Math.PI / 8, 0], g);
      mesh(new THREE.SphereGeometry(W * 0.38, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: "#26302E", roughness: 0.35, metalness: 0.4 }), [0, H * 0.54, 0], [0, 0, 0], g);
      break;
    }
    case "hana": { // 하나네 수제 돈-가스: 붉은 벽돌 + 회색 석재 처마, 회녹 금속 지붕과 높은 채광창, 청록 격자 문, 흰 간판
      box(g, brickMat(`hana-${a.id}`, 3, 1, { frame: "#2E4A50", night }), [W * 1.1, H * 0.6, D], [0, H * 0.3, 0]);
      box(g, flock("#CFCBC2"), [W * 1.14, 4, D + 3], [0, H * 0.6 + 2, 0]);
      const r = metalHip(W * 1.16, D * 1.05, H * 0.28); r.position.y = H * 0.6 + 4 + H * 0.14; g.add(r);
      box(g, flock("#2B2E30"), [W * 0.7, H * 0.16, D * 0.4], [0, H * 0.6 + 4 + H * 0.26, 0]);
      const sg = plate("하나네 돈-가스", W * 0.6, 8, { bg: "#F7F5F0", fg: "#1E1E20", border: "#2B2220", sub: "江景俱樂部 · 수제", subColor: "#7A2A26", font: "'Song Myung', serif" }); sg.position.set(0, H * 0.6 + 7, D / 2 + 2); g.add(sg);
      box(g, flock("#2E4A50"), [W * 0.32, H * 0.42, 1.5], [0, H * 0.21, D / 2 + 1]);
      break;
    }
    case "taechang": { // 太昌商會: 기와 맞배 단층 목조, 박공에 큰 현판, 흰 회벽 + 아래 나무 판벽, 園道食·元冷祖面 간판
      const Wt = W * 1.45;
      box(g, flock("#5A3A26"), [Wt, H * 0.28, D], [0, H * 0.14, 0]);
      const f = facade(`tc-${a.id}`, { wall: "#EEE8DA", cols: 5, rows: 1, kind: "hanok", frame: "#7A4A30" });
      box(g, wallMat(f, night), [Wt, H * 0.32, D], [0, H * 0.28 + H * 0.16, 0]);
      const eave = gableRoof(Wt + 12, D + 16, H * 0.14, "#5E6A66"); eave.position.y = H * 0.6; g.add(eave);
      // 정면 가운데 박공(맞배 지붕창) + 큰 현판
      const r = gableRoof(D * 0.7, Wt * 0.36, H * 0.3, "#5E6A66"); r.rotation.y = Math.PI / 2; r.position.set(0, H * 0.66, D * 0.18); g.add(r);
      const tri = new THREE.Shape(); tri.moveTo(-Wt * 0.17, 0); tri.lineTo(Wt * 0.17, 0); tri.lineTo(0, H * 0.27); tri.closePath();
      const tm = new THREE.Mesh(new THREE.ShapeGeometry(tri), flock("#EEE8DA")); tm.position.set(0, H * 0.66, D * 0.18 + D * 0.35 - 1); g.add(tm);
      const sg = plate("太昌商會", Wt * 0.26, 8, { bg: "#F4F1EA", fg: "#1E1E20", border: "#5A3A26", sub: "태창상회", subColor: "#5A3A26", font: "'Song Myung', serif" }); sg.position.set(0, H * 0.72, D * 0.53); g.add(sg);
      const s2 = plate("園道食", Wt * 0.3, 5, { bg: "#F4F1EA", fg: "#1E1E20", border: "#5A3A26", font: "'Song Myung', serif" }); s2.position.set(Wt * 0.25, H * 0.54, D / 2 + 1); g.add(s2);
      break;
    }
    case "modernstore": { // 강경모던상회(江景商會): 위층 크림 미장 + 江景商會 현판·청록 창, 아래층 회색 화강석, 큰 '강경모던상회' 간판, 세로 '포토존' 간판
      const granite = canvasTex("granite", 256, 128, (c, w, h) => { c.fillStyle = "#A9ABAD"; c.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { c.fillStyle = Math.random() < 0.5 ? "rgba(255,255,255,.25)" : "rgba(0,0,0,.18)"; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); } c.strokeStyle = "rgba(60,60,60,.35)"; c.lineWidth = 2; for (let y = 0; y < h; y += 42) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } for (let x = 0; x < w; x += 64) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } });
      const Wm = W * 1.3;
      box(g, new THREE.MeshStandardMaterial({ map: granite, roughness: 0.8 }), [Wm, H * 0.48, D], [0, H * 0.24, 0]);
      const up = facade(`ms-${a.id}`, { wall: "#EAD3A6", cols: 3, rows: 1, kind: "plain", frame: "#3F8A7A" });
      box(g, wallMat(up, night), [Wm * 0.55, H * 0.55, D * 0.9], [-Wm * 0.22, H * 0.48 + H * 0.275, -D * 0.04]);
      box(g, flock("#E3D9C4"), [Wm * 0.57, 3, D * 0.95], [-Wm * 0.22, H * 1.04, -D * 0.04]);
      box(g, flock("#3A3A3C"), [Wm * 0.57, 1.5, D * 0.95], [-Wm * 0.22, H * 1.07, -D * 0.04]);
      const pl = plate("江景商會", Wm * 0.3, 6, { bg: "#EFE6D2", fg: "#2B2220", border: "#A08C6A", font: "'Song Myung', serif" }); pl.position.set(-Wm * 0.22, H * 0.92, D * 0.42); g.add(pl);
      const big = plate("강경모던상회", Wm * 0.42, 9, { bg: "#E6D2B8", fg: "#1E1E20", border: "#3A2A20", sub: "", font: "'Song Myung', serif" }); big.position.set(Wm * 0.25, H * 0.58, D / 2 + 1); g.add(big);
      const ph = plate("포토존", 4, 11, { vertical: true, bg: "#EFE6D2", fg: "#2B2220", border: "#6B4530", font: "'Song Myung', serif" }); ph.position.set(Wm * 0.05, H * 0.24, D / 2 + 1); g.add(ph);
      box(g, flock("#3F8A7A"), [Wm * 0.14, H * 0.22, 1], [-Wm * 0.18, H * 0.25, D / 2 + 0.6]);
      box(g, flock("#2B2220"), [Wm * 0.14, H * 0.34, 1.2], [Wm * 0.28, H * 0.17, D / 2 + 0.7]);
      break;
    }
    case "gallerygg": { // 강경화랑: 올리브빛 미장 2층, 곡선 박공에 和 문장 + '和信商會', 회색 발코니 띠 'GALLERY GG', 청록 문·창, 타일 기둥
      const f = facade(`gg-${a.id}`, { wall: "#BDB06A", cols: 4, rows: 2, kind: "plain", frame: "#2F7A72" });
      box(g, wallMat(f, night), [W, H, D], [0, H / 2, 0]);
      box(g, flock("#C9C9C4"), [W + 2, 3, D + 2], [0, 1.5, 0]);
      box(g, flock("#C9C9C4"), [W + 2, 3, D + 2], [0, H + 1.5, 0]);
      const cg = new THREE.Shape(); const cw = W * 0.4; cg.moveTo(-cw, 0); cg.lineTo(cw, 0); cg.lineTo(cw, H * 0.08); cg.quadraticCurveTo(cw * 0.55, H * 0.1, cw * 0.4, H * 0.2); cg.quadraticCurveTo(cw * 0.15, H * 0.26, 0, H * 0.34); cg.quadraticCurveTo(-cw * 0.15, H * 0.26, -cw * 0.4, H * 0.2); cg.quadraticCurveTo(-cw * 0.55, H * 0.1, -cw, H * 0.08); cg.closePath();
      const cgm = new THREE.Mesh(new THREE.ExtrudeGeometry(cg, { depth: 4, bevelEnabled: true, bevelSize: 0.8, bevelThickness: 0.8 }), flock("#D4D4CF")); cgm.position.set(0, H + 3, D / 2 - 4); cgm.castShadow = true; g.add(cgm);
      mesh(new THREE.TorusGeometry(3, 0.6, 8, 20), flock("#2B2B2E"), [0, H + 3 + H * 0.2, D / 2 + 1.2], [0, 0, 0], g);
      const t = plate("和信商會", W * 0.6, 6, { bg: "#D4D4CF", fg: "#2B2B2E", border: "#D4D4CF", font: "'Song Myung', serif" }); t.position.set(0, H + 6, D / 2 + 1.2); g.add(t);
      box(g, flock("#BEBEB9"), [W * 0.62, H * 0.16, 10], [0, H * 0.5, D / 2 + 5]);
      const gg = plate("GALLERY GG", W * 0.55, 5, { bg: "#BEBEB9", fg: "#2B2B2E", border: "#BEBEB9", font: "sans-serif" }); gg.position.set(0, H * 0.5, D / 2 + 10.2); g.add(gg);
      for (const sx of [-1, 1]) { mesh(new THREE.CylinderGeometry(2.2, 2.4, H * 0.42, 14), flock("#4F8C86"), [sx * W * 0.24, H * 0.21, D / 2 + 8], [0, 0, 0], g); mesh(new THREE.CylinderGeometry(2.3, 2.3, H * 0.12, 14), flock("#6B2A26"), [sx * W * 0.24, H * 0.36, D / 2 + 8], [0, 0, 0], g); }
      box(g, flock("#3F9A90"), [W * 0.3, H * 0.34, 1.5], [0, H * 0.17, D / 2 + 1]);
      break;
    }
    case "cinema": { // 강경씨네마: 회색 석재 2층 + 검은 기와 맞배지붕, 나무 세로 간판 '江景シネマ', 1층 나무 판벽, 작은 처마 창
      const stoneT = canvasTex("greystone", 256, 256, (c, w, h) => { c.fillStyle = "#D2D0CB"; c.fillRect(0, 0, w, h); c.strokeStyle = "rgba(80,80,80,.3)"; c.lineWidth = 2; for (let y = 0; y < h; y += 40) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); for (let x = (y / 40) % 2 ? 0 : 40; x < w; x += 80) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 40); c.stroke(); } } });
      const st = new THREE.MeshStandardMaterial({ map: stoneT, roughness: 0.9, emissive: night ? "#2A2010" : "#000" });
      box(g, st, [W, H, D], [0, H / 2, 0]);
      const r = gableRoof(W + 8, D + 8, H * 0.3, "#2E2E30"); r.position.y = H; g.add(r);
      box(g, flock("#BDBAB4"), [W + 2, 2, D + 2], [0, H * 0.5, 0]);
      for (const sx of [-0.35, -0.15]) box(g, flock("#3A3A3C"), [W * 0.07, H * 0.2, 1], [sx * W, H * 0.72, D / 2 + 0.6]);
      box(g, flock("#4A3020"), [W * 0.42, H * 0.48, 1.6], [W * 0.25, H * 0.24, D / 2 + 0.8]);
      const vs = plate("江景シネマ", 9, 18, { vertical: true, bg: "#9A7448", fg: "#F4EFE4", border: "#3A2A1A", font: "'Song Myung', serif" }); vs.position.set(W * 0.08, H * 0.75, D / 2 + 1); g.add(vs);
      box(g, flock("#3A2A1A"), [W * 0.22, 2, 8], [W * 0.3, H * 0.92, D / 2 + 3], [0.4, 0, 0]);
      box(g, flock("#2E2A28"), [W * 0.18, H * 0.2, 1], [W * 0.3, H * 0.75, D / 2 + 0.6]);
      // 나무 팔각 매표소
      const kb = new THREE.Group(); kb.position.set(W * 0.62, 0, D / 2 + 8); g.add(kb);
      mesh(new THREE.CylinderGeometry(5, 5, 4, 8), flock("#7A4F33"), [0, 2, 0], [0, Math.PI / 8, 0], kb);
      mesh(new THREE.CylinderGeometry(4.6, 4.6, 9, 8), new THREE.MeshPhysicalMaterial({ color: "#B9CDD2", roughness: 0.1, transmission: 0.4, emissive: night ? "#FFC873" : "#000", emissiveIntensity: night ? 0.6 : 0 }), [0, 8.5, 0], [0, Math.PI / 8, 0], kb);
      mesh(new THREE.CylinderGeometry(5.8, 5.4, 2.5, 8), flock("#6B4530"), [0, 14, 0], [0, Math.PI / 8, 0], kb);
      const tk = plate("매표소", 6, 1.8, { bg: "#8A6040", fg: "#1E1E20", border: "#6B4530", font: "'Song Myung', serif" }); tk.position.set(0, 14, 5.6); kb.add(tk);
      const hs = plate("江景シネマ", W * 0.32, 5, { bg: "#9A7448", fg: "#F4EFE4", border: "#3A2A1A", font: "'Song Myung', serif" }); hs.position.set(-W * 0.22, H * 0.42, D / 2 + 1); g.add(hs);
      box(g, flock("#4A3020"), [W * 0.1, H * 0.3, 1.5], [-W * 0.25, H * 0.15, D / 2 + 1]);
      break;
    }
    case "dancehall": { // 딴스홀: 길고 낮은 회색 석재 단층, 위에 흰 난간 기둥 줄, 큰 돋을 한자 '韓敬美洋靴店'·'DANCEHALL', 쇠창살 창, 나무 문
      const Wd = W * 1.8;
      const stoneT = canvasTex("greystone2", 256, 256, (c, w, h) => { c.fillStyle = "#D4D3CE"; c.fillRect(0, 0, w, h); c.strokeStyle = "rgba(90,90,90,.28)"; c.lineWidth = 2; for (let y = 0; y < h; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); for (let x = (y / 32) % 2 ? 0 : 48; x < w; x += 96) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 32); c.stroke(); } } });
      const st = new THREE.MeshStandardMaterial({ map: stoneT, roughness: 0.9 });
      box(g, st, [Wd, H * 0.62, D], [0, H * 0.31, 0]);
      box(g, st, [Wd * 0.6, H * 0.3, D * 0.6], [0, H * 0.62 + H * 0.15, -D * 0.12]);
      box(g, flock("#E6E5E0"), [Wd + 2, 2.5, D + 2], [0, H * 0.62 + 1.2, 0]);
      for (let i = 0; i < 26; i++) { const x = -Wd / 2 + 2 + (i * (Wd - 4)) / 25; mesh(new THREE.CylinderGeometry(0.6, 0.9, 5, 8), flock("#F2F1EC"), [x, H * 0.62 + 5, D / 2 - 1], [0, 0, 0], g); }
      box(g, flock("#E6E5E0"), [Wd + 2, 1.5, 3], [0, H * 0.62 + 8, D / 2 - 1]);
      const t = plate("韓敬美洋靴店", Wd * 0.62, 8, { bg: "#D4D3CE", fg: "#4A5878", border: "#D4D3CE", font: "'Song Myung', serif" }); t.position.set(-Wd * 0.12, H * 0.5, D / 2 + 0.8); g.add(t);
      const dh = plate("DANCEHALL", Wd * 0.26, 4, { bg: "#D4D3CE", fg: "#4A5878", border: "#D4D3CE", font: "serif" }); dh.position.set(Wd * 0.36, H * 0.5, D / 2 + 0.8); g.add(dh);
      for (const sx of [-0.4, -0.25, -0.1]) box(g, flock("#3A2A24"), [Wd * 0.08, H * 0.22, 1], [sx * Wd, H * 0.2, D / 2 + 0.6]);
      box(g, flock("#6B3A26"), [Wd * 0.06, H * 0.3, 1.5], [Wd * 0.12, H * 0.15, D / 2 + 1]);
      for (const sx of [0.25, 0.35]) box(g, flock("#3A2A24"), [Wd * 0.05, H * 0.2, 1], [sx * Wd, H * 0.2, D / 2 + 0.6]);
      break;
    }
    case "tailor": { // 양장점: 베이지 석재 2단 벽, 위층에 마름모 한자 현판 '裕昌商會', 흰 격자 양문, 쇠창살 세로 창, 검은 홈통
      const stoneT = canvasTex("stoneblk", 256, 256, (c, w, h) => { c.fillStyle = "#CDBBA3"; c.fillRect(0, 0, w, h); c.strokeStyle = "rgba(90,70,50,.35)"; c.lineWidth = 2; for (let y = 0; y < h; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); for (let x = (y / 32) % 2 ? 0 : 32; x < w; x += 64) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 32); c.stroke(); } } });
      const st = new THREE.MeshStandardMaterial({ map: stoneT, roughness: 0.9 });
      box(g, st, [W * 1.3, H * 0.62, D], [0, H * 0.31, 0]);
      box(g, st, [W * 1.0, H * 0.42, D * 0.85], [W * 0.1, H * 0.62 + H * 0.21, -D * 0.05]);
      for (const y of [H * 0.4, H * 0.62, H * 1.04]) box(g, flock("#4A4A4E"), [W * 1.32, 1.6, D + 2], [y === H * 1.04 ? W * 0.1 : 0, y, 0]);
      ["裕", "昌", "商", "會"].forEach((ch, i) => { const d = plate(ch, 7, 7, { bg: "#5A6068", fg: "#F2F2F2", border: "#3A3E44", font: "'Song Myung', serif" }); d.rotation.z = Math.PI / 4; d.position.set(-W * 0.25 + i * W * 0.22, H * 0.92, D * 0.38); g.add(d); });
      const sg = plate("양장점", W * 0.42, 8, { bg: "#CDBBA3", fg: "#3A4048", border: "#CDBBA3", font: "'Song Myung', serif" }); sg.position.set(0, H * 0.52, D / 2 + 0.8); g.add(sg);
      const door = plate("", W * 0.22, H * 0.34, { bg: "#F4F4F0", fg: "#000", border: "#DADAD6" }); door.position.set(0, H * 0.17, D / 2 + 0.8); g.add(door);
      for (const sx of [-1, 1]) { box(g, flock("#2E3440"), [W * 0.1, H * 0.24, 1], [sx * W * 0.4, H * 0.2, D / 2 + 0.6]); box(g, flock("#C9C3B6"), [W * 0.14, 2, 2.4], [sx * W * 0.4, H * 0.07, D / 2 + 1]); box(g, flock("#2B2B2E"), [1.4, H * 0.62, 1.4], [sx * W * 0.24, H * 0.31, D / 2 + 1.2]); }
      break;
    }
    case "gasoil": { // 광신석유: 짙은 회목조 2층 + 1층 앞 기와 차양 지붕, '光信石油'·'江景石油'·Ford 간판, 빨강·청록 옛 주유기 둘
      const dark = canvasTex("darkwood", 256, 256, (c, w, h) => { c.fillStyle = "#4E4A48"; c.fillRect(0, 0, w, h); c.fillStyle = "#6E6A66"; for (let x = 0; x < w; x += 42) c.fillRect(x, 0, 6, h); c.fillStyle = "#2E2A28"; for (let x = 18; x < w; x += 42) { c.fillRect(x, 40, 18, 80); c.fillStyle = "#9FB4BC"; c.fillRect(x + 2, 42, 14, 76); c.fillStyle = "#2E2A28"; } });
      const Wg = W * 1.35;
      box(g, new THREE.MeshStandardMaterial({ map: dark, roughness: 0.9, emissive: night ? "#3A2A10" : "#000" }), [Wg, H, D], [0, H / 2, 0]);
      box(g, flock("#5A3A2A"), [Wg, H * 0.4, D + 0.5], [0, H * 0.2, 0]);
      box(g, flock("#3A3634"), [Wg + 6, 3, D + 6], [0, H + 1.5, 0]);
      const aw = gableRoof(Wg + 4, 22, 5); aw.position.set(0, H * 0.42, D / 2 + 1); aw.rotation.x = 0; g.add(aw);
      const s1 = plate("光信石油", 24, 6, { bg: "#1E1E20", fg: "#D9B25E", border: "#B08A3E", font: "'Song Myung', serif" }); s1.position.set(-Wg * 0.22, H * 0.86, D / 2 + 1); g.add(s1);
      const s2 = plate("江景石油", 22, 5, { bg: "#F4EFE4", fg: "#2B2220", border: "#2B2220", font: "'Song Myung', serif" }); s2.position.set(Wg * 0.12, H * 0.95, D / 2 + 1); g.add(s2);
      const s3 = plate("自動車", 18, 6, { bg: "#F4EFE4", fg: "#1F3C88", border: "#1F3C88", sub: "Ford", subColor: "#1F3C88", font: "'Song Myung', serif" }); s3.position.set(Wg * 0.38, H * 0.7, D / 2 + 1.5); g.add(s3);
      const s4 = plate("GAS STATION", 16, 3, { bg: "#F4EFE4", fg: "#C8322B", border: "#C8322B", font: "sans-serif" }); s4.position.set(Wg * 0.22, H * 0.36, D / 2 + 13); g.add(s4);
      for (const sx of [0.12, 0.32]) { const pump = new THREE.Group(); pump.position.set(Wg * sx, 0, D / 2 + 16); g.add(pump); mesh(new THREE.CylinderGeometry(1.6, 1.8, 10, 14), flock("#8E2A26"), [0, 5, 0], [0, 0, 0], pump); mesh(new THREE.CylinderGeometry(1.9, 1.9, 3, 14), flock("#2F6E7A"), [0, 11.5, 0], [0, 0, 0], pump); mesh(new THREE.CylinderGeometry(1.4, 1.9, 3, 14), new THREE.MeshPhysicalMaterial({ color: "#B8BCC0", metalness: 0.8, roughness: 0.3 }), [0, 14.5, 0], [0, 0, 0], pump); }
      break;
    }
    case "daeseong": { // 大成商會: 회청색 거친 미장 2층, 금테 한자 현판, 흰 테두리 세로 창 셋, 옆에 '典當舖' 간판
      const Wd = W * 0.85;
      const f = facade(`dae-${a.id}`, { wall: "#7E8A90", cols: 3, rows: 1, kind: "plain", frame: "#F2EFE6" });
      box(g, wallMat(f, night), [Wd, H * 0.55, D], [0, H * 0.55 + H * 0.275, 0]);
      box(g, flock("#6E7A80"), [Wd, H * 0.55, D], [0, H * 0.275, 0]);
      box(g, flock("#2E5E4E"), [Wd + 2, 1.5, 8], [0, H * 0.5, D / 2 + 4]);
      box(g, flock("#5A666C"), [Wd + 3, 3, D + 3], [0, H * 1.1 + 1.5, 0]);
      const sg = plate("大成商會", Wd * 0.78, 9, { bg: "#7E8A90", fg: "#E6D5A0", border: "#D9C48A", font: "'Song Myung', serif" }); sg.position.set(0, H * 1.0, D / 2 + 0.8); g.add(sg);
      const pw = plate("典當舖", 12, 4, { bg: "#F4EFE4", fg: "#8E2A26", border: "#5A3A2A", font: "'Song Myung', serif" }); pw.position.set(Wd * 0.4, H * 0.38, D / 2 + 1); g.add(pw);
      break;
    }
    case "photo": { // 美光寫眞館: 흰 석재 3층, 곡선 박공 + 둥근 문장, 'THE MAMMO HEORI' 검은 띠 간판, 초록 액자 한자 간판, 초록 문, 빨간 우체통
      const f = facade(`ph-${a.id}`, { wall: "#E9E6DF", cols: 3, rows: 2, kind: "plain", frame: "#6E7276" });
      const Hp = H * 1.15;
      box(g, wallMat(f, night), [W * 0.9, Hp, D], [0, Hp / 2, 0]);
      const cg = new THREE.Shape(); const cw = W * 0.45; cg.moveTo(-cw, 0); cg.lineTo(cw, 0); cg.lineTo(cw, H * 0.06); cg.quadraticCurveTo(cw * 0.6, H * 0.12, cw * 0.3, H * 0.16); cg.quadraticCurveTo(0, H * 0.22, -cw * 0.3, H * 0.16); cg.quadraticCurveTo(-cw * 0.6, H * 0.12, -cw, H * 0.06); cg.closePath();
      const cgm = new THREE.Mesh(new THREE.ExtrudeGeometry(cg, { depth: 4, bevelEnabled: true, bevelSize: 0.8, bevelThickness: 0.8 }), flock("#E9E6DF")); cgm.position.set(0, Hp, D / 2 - 4); cgm.castShadow = true; g.add(cgm);
      mesh(new THREE.TorusGeometry(3, 0.6, 8, 24), flock("#7E8286"), [0, Hp + H * 0.1, D / 2 + 1], [0, 0, 0], g);
      const band = plate("THE MAMMO HEORI CO.LTD.", W * 0.88, 5, { bg: "#2E3236", fg: "#E9E6DF", border: "#2E3236", font: "serif" }); band.position.set(0, H * 0.5, D / 2 + 1.5); g.add(band);
      const sg = plate("美光寫眞館", W * 0.7, 8, { bg: "#F4EFE4", fg: "#1E4A36", border: "#2E6E4E", font: "'Song Myung', serif" }); sg.position.set(0, H * 0.4, D / 2 + 3); sg.rotation.x = -0.15; g.add(sg);
      box(g, flock("#2E7A50"), [W * 0.14, H * 0.3, 1.5], [W * 0.12, H * 0.15, D / 2 + 1]);
      box(g, flock("#A9B1B8"), [W * 0.18, H * 0.3, 1.5], [-W * 0.08, H * 0.15, D / 2 + 1]);
      const post = new THREE.Group(); post.position.set(W * 0.4, 0, D / 2 + 8); g.add(post);
      mesh(new THREE.CylinderGeometry(2.2, 2.2, 9, 16), flock("#C8322B"), [0, 4.5, 0], [0, 0, 0], post);
      mesh(new THREE.SphereGeometry(2.4, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), flock("#C8322B"), [0, 9, 0], [0, 0, 0], post);
      break;
    }
    case "welcome": { // 웰컴센터(案內所): 단층 붉은 벽돌, 가운데 계단식 박공 + 회색 돌림띠, 노란 전구 간판, 철제 차양, 빨간 우체통
      const Wl = W * 1.5;
      const f = facade(`wel-${a.id}`, { wall: "#7E4A38", cols: 5, rows: 1, kind: "brick", frame: "#6E7680" });
      box(g, wallMat(f, night), [Wl, H * 0.62, D], [0, H * 0.31, 0]);
      box(g, flock("#9AA0A6"), [Wl + 3, 3, D + 3], [0, H * 0.62 + 1.5, 0]);
      box(g, flock("#BFC3C6"), [Wl + 2, 3, D + 2], [0, 1.5, 0]);
      const gab = new THREE.Shape(); gab.moveTo(-W * 0.32, 0); gab.lineTo(W * 0.32, 0); gab.lineTo(W * 0.32, H * 0.12); gab.lineTo(0, H * 0.3); gab.lineTo(-W * 0.32, H * 0.12); gab.closePath();
      const gm = new THREE.Mesh(new THREE.ExtrudeGeometry(gab, { depth: 4, bevelEnabled: false }), flock("#7E4A38")); gm.position.set(0, H * 0.62, D / 2 - 3); gm.castShadow = true; g.add(gm);
      for (const sx of [-1, 1]) { box(g, flock("#7E4A38"), [6, H * 0.84, 6], [sx * W * 0.32, H * 0.42, D / 2], [0, 0, 0]); box(g, flock("#9AA0A6"), [7.5, 2, 7.5], [sx * W * 0.32, H * 0.84 + 1, D / 2]); mesh(new THREE.ConeGeometry(4.6, 3, 4), flock("#9AA0A6"), [sx * W * 0.32, H * 0.84 + 3.4, D / 2], [0, Math.PI / 4, 0], g); }
      const sg = plate("案內所", W * 0.5, W * 0.17, { sub: "Welcome Center", subColor: "#1F3C88", bulbs: true, night }); sg.position.set(0, H * 0.5, D / 2 + 1.2); g.add(sg);
      box(g, flock("#6E7680"), [W * 0.22, H * 0.34, 2], [0, H * 0.17, D / 2 + 1]);
      for (const sx of [-0.55, -0.32, 0.32, 0.55]) box(g, flock("#2B2B2E"), [W * 0.18, 1.2, 6], [sx * Wl, H * 0.4, D / 2 + 3], [0.35, 0, 0]);
      const ur = plate("우리상점", W * 0.3, 7, { bg: "#F4EAD0", fg: "#1E1E20", border: "#B08A3E", font: "'Song Myung', serif" }); ur.position.set(-Wl * 0.38, H * 0.48, D / 2 + 1); g.add(ur);
      const post = new THREE.Group(); post.position.set(-W * 0.45, 0, D / 2 + 10); g.add(post);
      mesh(new THREE.CylinderGeometry(2.4, 2.4, 9, 16), flock("#C8322B"), [0, 4.5, 0], [0, 0, 0], post);
      mesh(new THREE.SphereGeometry(2.6, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), flock("#C8322B"), [0, 9, 0], [0, 0, 0], post);
      break;
    }
    case "musichall": { // 강경음악도서관(江景音樂圖書館): 2층 붉은 벽돌, 모서리 곡선 박공 + 둥근 창, 흰 아치 출입문, 흰 창, 세로 한자 간판, LP 레코-드 간판
      const f = facade(`mus-${a.id}`, { wall: "#8E3F31", cols: 5, rows: 2, kind: "brick", frame: "#F4F1EA" });
      box(g, wallMat(f, night), [W * 1.15, H, D], [0, H / 2, 0]);
      box(g, flock("#BFC3C6"), [W * 1.15 + 2, 4, D + 2], [0, 2, 0]);
      box(g, flock("#E8E2D6"), [W * 1.15 + 2, 2, D + 2], [0, H + 1, 0]);
      box(g, flock("#3A3A3E"), [W * 1.15, 3, D - 2], [0, H + 3, 0]);
      // 모서리 출입 탑 + 곡선 박공
      const bx = -W * 0.5;
      box(g, flock("#8E3F31"), [W * 0.3, H * 1.12, D * 0.5], [bx, H * 0.56, D * 0.3]);
      const cg = new THREE.Shape(); const cw = W * 0.17; cg.moveTo(-cw, 0); cg.lineTo(cw, 0); cg.quadraticCurveTo(cw, H * 0.1, cw * 0.45, H * 0.12); cg.quadraticCurveTo(cw * 0.3, H * 0.22, 0, H * 0.24); cg.quadraticCurveTo(-cw * 0.3, H * 0.22, -cw * 0.45, H * 0.12); cg.quadraticCurveTo(-cw, H * 0.1, -cw, 0);
      const cgm = new THREE.Mesh(new THREE.ExtrudeGeometry(cg, { depth: 3, bevelEnabled: true, bevelSize: 1, bevelThickness: 1 }), flock("#D9D4CA")); cgm.position.set(bx, H * 1.12, D * 0.55 - 2); cgm.castShadow = true; g.add(cgm);
      mesh(new THREE.CylinderGeometry(2.6, 2.6, 1, 20), flock("#F4F1EA"), [bx, H * 1.2, D * 0.55 + 1.6], [Math.PI / 2, 0, 0], g);
      const door = new THREE.Shape(); door.moveTo(-6, 0); door.lineTo(6, 0); door.lineTo(6, 12); door.absarc(0, 12, 6, 0, Math.PI, false); door.closePath();
      const dm = new THREE.Mesh(new THREE.ExtrudeGeometry(door, { depth: 1, bevelEnabled: false }), flock("#F4F1EA")); dm.position.set(bx, 3, D * 0.55); g.add(dm);
      box(g, flock("#BFC3C6"), [W * 0.32, 2, 6], [bx, 1, D * 0.55 + 4]);
      const vs = plate("江景音樂圖書館", 6, 30, { vertical: true, bg: "#F1E3B5", fg: "#2B2220", border: "#B08A3E" }); vs.position.set(-W * 0.12, H * 0.55, D / 2 + 1); g.add(vs);
      const lp = plate("LP 레코-드", 20, 8, { bg: "#C8322B", fg: "#FFFFFF", border: "#E8D9A8", bulbs: true, night, font: "sans-serif" }); lp.position.set(W * 0.12, H * 0.62, D / 2 + 1); g.add(lp);
      ["江", "景", "金", "融", "組", "合"].forEach((ch, i) => { const d = plate(ch, 3.4, 3.4, { bg: "#F1EDE2", fg: "#2B2220", border: "#C9C3B6", font: "'Song Myung', serif" }); d.position.set(bx - 9 + i * 3.6, H * 0.62, D * 0.55 + 1.5); g.add(d); });
      const dc = plate("드-코레 아비럼콜", 18, 5, { bg: "#F4F1EA", fg: "#1F3C88", border: "#1F3C88", font: "sans-serif" }); dc.position.set(W * 0.38, H * 0.6, D / 2 + 1); g.add(dc);
      break;
    }
    case "theater": { // 강경관(江景舘): 회색 석재풍 2층, 청록 창틀 + 아르데코 기둥, 큰 차양, 손그림 영화 간판, 밤색 나무문
      const f = facade(`th-${a.id}`, { wall: "#C9C7C1", cols: 4, rows: 2, kind: "plain", frame: "#2F8C86" });
      box(g, wallMat(f, night), [W, H, D], [0, H / 2, 0]);
      box(g, flock("#EDE6D4"), [W + 1, H * 0.4, D + 1], [0, H * 0.2, 0]);
      for (let i = 0; i < 4; i++) box(g, flock("#B9B5AC"), [2.6, H * 0.34, 2.4], [-W * 0.3 + i * W * 0.2, H * 0.72, D / 2 + 1.2]);
      box(g, flock("#BDB9B1"), [W + 6, 3, 14], [0, H * 0.48, D / 2 + 6]);
      const posters = canvasTex(`posters-${a.id}`, 1024, 192, (c, w, h) => {
        const cols = [["#F4E3C0", "#C0392B", "戰爭과 平和"], ["#D9E6F2", "#B03A2E", "冬柏아가씨"], ["#F7D9C4", "#8E44AD", "비는 온다"], ["#EADBC8", "#2C3E50", "春香傳"]];
        cols.forEach(([bg, fg, t], i) => { const x = (i * w) / 4; c.fillStyle = bg; c.fillRect(x + 4, 4, w / 4 - 8, h - 8); c.fillStyle = "#E3B08A"; c.beginPath(); c.arc(x + 60, h / 2 + 10, 40, 0, 7); c.fill(); c.fillStyle = "#2B2220"; c.beginPath(); c.arc(x + 60, h / 2 - 15, 40, Math.PI, 0); c.fill(); c.fillStyle = fg; c.font = "900 46px serif"; c.textAlign = "center"; c.fillText(t, x + w / 8 + 40, h / 2 + 16); });
      });
      const pm = new THREE.Mesh(new THREE.BoxGeometry(W * 0.95, H * 0.16, 1), [flock("#6B4530"), flock("#6B4530"), flock("#6B4530"), flock("#6B4530"), new THREE.MeshStandardMaterial({ map: posters, emissiveMap: posters, emissive: night ? "#FFFFFF" : "#000", emissiveIntensity: night ? 0.35 : 0 }), flock("#6B4530")]);
      pm.position.set(0, H * 0.4, D / 2 + 13); pm.rotation.x = -0.25; pm.castShadow = true; g.add(pm);
      for (const sx of [-0.3, -0.1, 0.1, 0.3]) box(g, flock("#5A2A20"), [W * 0.16, H * 0.3, 1.5], [sx * W, H * 0.15, D / 2 + 1]);
      const t = plate(a.id === "cinema" ? "江景씨네마" : "江景舘", W * 0.5, 9, { bg: "#C9C7C1", fg: "#2B2B2E", border: "#C9C7C1", font: "'Song Myung', serif" }); t.position.set(0, H * 0.9, D / 2 + 1); g.add(t);
      box(g, flock("#A9A59D"), [W + 2, 3, D + 2], [0, H + 1.5, 0]);
      if (a.id === "ganggyeong-gwan") { mesh(new THREE.CylinderGeometry(D * 0.38, D * 0.38, H * 1.1, 24), flock("#D2C9B6"), [W / 2 + D * 0.2, H * 0.55, 0], [0, 0, 0], g); for (const y of [0.35, 0.7]) box(g, flock("#C9C0AC"), [D * 0.8, 1.5, D * 0.8], [W / 2 + D * 0.2, H * y, 0]); }
      break;
    }
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
  if (a.id === "modern-store") { const car = classicCar(); car.position.set(W * 0.75, 0, D / 2 + 14); car.rotation.y = -0.5; g.add(car); }
  if (night && a.style !== "lighthouse") { const l = new THREE.PointLight("#FFC879", 700, 110, 2); l.position.set(0, H * 0.4, D / 2 + 14); g.add(l); }
  g.rotation.y = (rand() - 0.5) * 0.1;
  return g;
}
