// 강경근대거리 3D 미니어처(디오라마) — 탐험 지도 배경, 첫 화면, 이야기 장면 배경을 굽습니다.
// 지도용은 비스듬히 내려다보는 정사영 카메라를 써서 '지도 좌표(mapX, mapY)'가 그림의 픽셀과 그대로 맞습니다.
// 건물은 안내도 장소의 분위기를 옮긴 창작 미니어처이며 실제 외관과 다를 수 있습니다.
import * as THREE from "three";
import { flock, gloss, canvasTex, blob, mesh } from "./models.js";
import { building as building2, hipRoof } from "./buildings.js";
import { makeCat } from "./models.js";

export const BOX = { x: 230, y: 40, w: 1120, h: 1100 };
export const PITCH = (42 * Math.PI) / 180;
const S = Math.sin(PITCH);
/** 지도 좌표 → 3D 바닥 좌표 */
export const P = (mx, my) => new THREE.Vector3(mx, 0, my / S);

function rnd(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ── 벽 텍스처 (창문 줄) ─────────────────────────────
function wallTex(key, wall, cols, rows, { brick = false, frame = "#5A3A2A", lit = false } = {}) {
  return canvasTex(`wall-${key}`, 256, 256, (c, w, h) => {
    c.fillStyle = wall; c.fillRect(0, 0, w, h);
    if (brick) { c.strokeStyle = "rgba(0,0,0,.18)"; c.lineWidth = 2; for (let y = 0; y < h; y += 14) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); for (let x = (y / 14) % 2 ? 0 : 14; x < w; x += 28) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 14); c.stroke(); } } }
    const cw = w / cols, rh = h / rows;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const x = i * cw + cw * 0.25, y = j * rh + rh * 0.22, ww = cw * 0.5, hh = rh * 0.5;
      c.fillStyle = frame; c.fillRect(x - 3, y - 3, ww + 6, hh + 6);
      c.fillStyle = lit ? "#F6D27A" : "#9FC1C6"; c.fillRect(x, y, ww, hh);
      c.fillStyle = "rgba(255,255,255,.35)"; c.fillRect(x, y, ww * 0.35, hh);
      c.fillStyle = frame; c.fillRect(x + ww / 2 - 1.5, y, 3, hh);
    }
  });
}

/** 기와 지붕 (모임지붕 + 살짝 들린 처마) */
function hanokRoof(g, w, d, y, color) {
  const roof = mesh(new THREE.ConeGeometry(1, 1, 4, 1), flock(color, { sheen: 0.3, roughness: 0.7 }), [0, y, 0], [0, Math.PI / 4, 0], g);
  roof.scale.set(w * 0.78, d * 0.5, d * 0.78);
  const eave = mesh(new THREE.BoxGeometry(w * 1.18, 3, d * 1.25), flock(color), [0, y - d * 0.25 + 1, 0], [0, 0, 0], g);
  for (const s of [-1, 1]) mesh(new THREE.ConeGeometry(4, 9, 8), flock(color), [s * w * 0.6, y - d * 0.22 + 4, 0], [0, 0, -s * 1.1], g);
  mesh(new THREE.BoxGeometry(w * 0.55, 3, 3), flock("#F2EFE6"), [0, y + d * 0.24, 0], [0, 0, 0], g);
  return eave;
}

export function building(a, rand) {
  const g = new THREE.Group();
  const W = Math.max(60, a.w * 0.56), D = W * 0.72, Hh = a.h * 0.5;
  const wall = a.wall ?? "#E8DCC0", roof = a.roof ?? "#3E4B4D";
  const fb = (m, size, pos, rot) => { const b = mesh(new THREE.BoxGeometry(...size), m, pos, rot ?? [0, 0, 0], g); return b; };
  switch (a.style) {
    case "hanok": {
      fb(flock("#CFC6B5"), [W * 1.05, 5, D * 1.05], [0, 2.5, 0]); // 기단
      fb(flock("#ffffff", { map: wallTex(`hanok-${wall}`, wall, 3, 1, { frame: "#6B4A36" }) }), [W, Hh * 0.75, D], [0, 5 + Hh * 0.375, 0]);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) fb(flock("#7A4A30"), [3, Hh * 0.75, 3], [sx * W / 2, 5 + Hh * 0.375, sz * D / 2]);
      hanokRoof(g, W, D * 1.3, 5 + Hh * 0.75 + D * 0.3, "#3F4E58");
      break;
    }
    case "brick": {
      fb(flock("#ffffff", { map: wallTex(`brick-${wall}`, wall, 3, 2, { brick: true, frame: "#E8DCC0" }) }), [W, Hh, D], [0, Hh / 2, 0]);
      fb(flock("#E8DCC0"), [W + 4, 4, D + 4], [0, Hh + 2, 0]);
      fb(flock(roof), [W - 6, 6, D - 6], [0, Hh + 5, 0]);
      fb(flock("#5A3A2A"), [W * 0.22, Hh * 0.35, 2], [0, Hh * 0.17, D / 2 + 1]);
      break;
    }
    case "western": {
      fb(flock("#ffffff", { map: wallTex(`west-${wall}`, wall, 4, 2, { frame: "#3E4B4D" }) }), [W, Hh, D], [0, Hh / 2, 0]);
      const roofM = flock(roof, { sheen: 0.3 });
      const pr = mesh(new THREE.CylinderGeometry(0.01, 1, 1, 4, 1), roofM, [0, Hh + D * 0.22, 0], [0, Math.PI / 4, 0], g);
      pr.scale.set(W * 0.74, D * 0.44, D * 0.74);
      for (const s of [-1, 1]) fb(flock("#F4EFE4"), [3, Hh * 0.45, 3], [s * W * 0.14, Hh * 0.22, D / 2 + 4]);
      fb(flock("#F4EFE4"), [W * 0.36, 3, 8], [0, Hh * 0.46, D / 2 + 3]);
      fb(flock("#5A3A2A"), [W * 0.16, Hh * 0.32, 2], [0, Hh * 0.16, D / 2 + 1]);
      break;
    }
    case "tower": {
      fb(flock("#ffffff", { map: wallTex(`tower-${wall}`, wall, 3, 2, { frame: "#5A3A2A" }) }), [W, Hh * 0.8, D], [0, Hh * 0.4, 0]);
      fb(flock(wall), [W * 0.34, Hh * 0.45, D * 0.4], [0, Hh * 0.8 + Hh * 0.22, 0]);
      const cl = mesh(new THREE.CylinderGeometry(W * 0.11, W * 0.11, 2, 24), flock("#F7F2E8"), [0, Hh * 1.02, D * 0.2 + 1], [Math.PI / 2, 0, 0], g);
      cl.castShadow = false;
      const cap = mesh(new THREE.ConeGeometry(W * 0.3, Hh * 0.28, 4), flock(roof), [0, Hh * 1.25 + Hh * 0.14, 0], [0, Math.PI / 4, 0], g);
      fb(flock(roof), [W + 4, 4, D + 4], [0, Hh * 0.8 + 2, 0]);
      break;
    }
    case "shop": {
      fb(flock("#ffffff", { map: wallTex(`shop-${wall}`, wall, 2, 1, { frame: "#5A3A2A" }) }), [W, Hh * 0.75, D], [0, Hh * 0.375, 0]);
      fb(flock(roof), [W + 6, 5, D + 6], [0, Hh * 0.75 + 2.5, 0]);
      fb(flock("#ffffff", { map: canvasTex(`awn-${roof}`, 64, 16, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? "#F4EFE4" : roof; c.fillRect(i * 8, 0, 8, h); } }) }), [W * 0.9, 2, 12], [0, Hh * 0.5, D / 2 + 6], [0.45, 0, 0]);
      fb(flock("#3E4B4D"), [W * 0.6, 7, 1.5], [0, Hh * 0.75 + 9, D / 2]);
      break;
    }
    case "station": {
      fb(flock("#ffffff", { map: wallTex(`st-${wall}`, wall, 2, 1, { frame: "#5A3A2A" }) }), [W * 0.45, Hh * 0.6, D * 0.6], [-W * 0.3, Hh * 0.3, -D * 0.1]);
      fb(flock(roof), [W * 1.15, 5, D * 0.95], [W * 0.05, Hh * 0.8, 0]);
      for (const sx of [-0.1, 0.5]) for (const sz of [-0.3, 0.3]) fb(flock("#F4EFE4"), [3, Hh * 0.8, 3], [W * sx, Hh * 0.4, D * sz]);
      fb(flock("#C9463D"), [6, 14, 6], [W * 0.2, 7, D * 0.1]);
      break;
    }
    case "lighthouse": {
      const t = mesh(new THREE.CylinderGeometry(W * 0.2, W * 0.28, Hh * 1.4, 32), flock("#ffffff", { map: canvasTex("lh", 64, 128, (c, w, h) => { for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? "#C9463D" : "#F7F2E8"; c.fillRect(0, (i * h) / 6, w, h / 6); } }) }), [0, Hh * 0.7, 0], [0, 0, 0], g);
      mesh(new THREE.CylinderGeometry(W * 0.24, W * 0.24, 4, 32), flock("#3E4B4D"), [0, Hh * 1.42, 0], [0, 0, 0], g);
      mesh(new THREE.CylinderGeometry(W * 0.15, W * 0.15, 10, 24), new THREE.MeshStandardMaterial({ color: "#F6D27A", emissive: "#F6C25A", emissiveIntensity: 0.9 }), [0, Hh * 1.49, 0], [0, 0, 0], g);
      mesh(new THREE.ConeGeometry(W * 0.2, 10, 24), flock("#C9463D"), [0, Hh * 1.6, 0], [0, 0, 0], g);
      fb(flock("#CFC6B5"), [W * 0.8, 4, W * 0.8], [0, 2, 0]);
      break;
    }
  }
  g.rotation.y = (rand() - 0.5) * 0.12;
  return g;
}

// ── 바닥·길·강·나무·산 ─────────────────────────────
const ROADS = [
  { pts: [[508, 40], [482, 1140]], w: 34 },
  { pts: [[482, 1060], [1340, 600]], w: 26 },
  { pts: [[650, 410], [870, 590], [1340, 440]], w: 26 },
];
function ground(scene) {
  const tex = canvasTex("ground", 1024, 1024, (c, w, h) => {
    const k = w / BOX.w;
    c.fillStyle = "#BFD58F"; c.fillRect(0, 0, w, h);
    const r = rnd(7);
    for (let i = 0; i < 3500; i++) { c.fillStyle = r() < 0.5 ? "rgba(120,150,90,.10)" : "rgba(255,250,220,.12)"; c.beginPath(); c.arc(r() * w, r() * h, 2 + r() * 10, 0, 7); c.fill(); }
    // 근대거리·구락부 구역: 따뜻한 흙빛
    c.fillStyle = "rgba(233,214,166,.92)";
    c.beginPath(); [[345, 105], [705, 105], [718, 600], [770, 780], [705, 1078], [345, 1078]].forEach(([x, y], i) => { const X = (x - BOX.x) * k, Y = (y - BOX.y) * k; i ? c.lineTo(X, Y) : c.moveTo(X, Y); }); c.closePath(); c.fill();
    c.beginPath(); [[860, 615], [1290, 500], [1320, 830], [1010, 985]].forEach(([x, y], i) => { const X = (x - BOX.x) * k, Y = (y - BOX.y) * k; i ? c.lineTo(X, Y) : c.moveTo(X, Y); }); c.closePath(); c.fill();
    // 길
    for (const rd of ROADS) {
      c.lineCap = "round"; c.lineJoin = "round";
      c.strokeStyle = "#B9A57E"; c.lineWidth = (rd.w + 8) * k; c.beginPath(); rd.pts.forEach(([x, y], i) => { const X = (x - BOX.x) * k, Y = (y - BOX.y) * k; i ? c.lineTo(X, Y) : c.moveTo(X, Y); }); c.stroke();
      c.strokeStyle = "#E9DEC4"; c.lineWidth = rd.w * k; c.stroke();
      c.strokeStyle = "rgba(160,140,110,.35)"; c.lineWidth = 1.5; c.setLineDash([6, 8]); c.stroke(); c.setLineDash([]);
    }
    // 산책로 (돌길)
    c.fillStyle = "#E1D4B6";
    for (let t = 0; t < 1; t += 0.012) { const y = 1010 - t * 780, x = 315 + Math.sin(t * 9) * 12; c.beginPath(); c.ellipse((x - BOX.x) * k, (y - BOX.y) * k, 5, 3.5, 0, 0, 7); c.fill(); }
  });
  tex.anisotropy = 8;
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(BOX.w + 1200, (BOX.h + 1200) / S), flock("#ffffff", { map: null }));
  plane.material = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 });
  // 텍스처는 지도 범위에만 맞추고 바깥은 같은 풀빛으로
  const inner = new THREE.Mesh(new THREE.PlaneGeometry(BOX.w, BOX.h / S), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }));
  inner.rotation.x = -Math.PI / 2; inner.position.set(BOX.x + BOX.w / 2, 0.2, (BOX.y + BOX.h / 2) / S); inner.receiveShadow = true;
  plane.material = new THREE.MeshStandardMaterial({ color: "#BFD58F", roughness: 0.95 });
  plane.rotation.x = -Math.PI / 2; plane.position.copy(inner.position).setY(0); plane.receiveShadow = true;
  scene.add(plane, inner);
}
function river(scene) {
  const shape = new THREE.Shape();
  const pts = [[1700, 700], [1350, 880], [1250, 960], [1150, 1010], [1040, 1070], [960, 1140], [880, 1400], [1700, 1400]];
  pts.forEach(([x, y], i) => { const v = [x, y / S]; i ? shape.lineTo(...v) : shape.moveTo(...v); });
  const geo = new THREE.ShapeGeometry(shape);
  const water = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: "#5E9DA6", roughness: 0.15, clearcoat: 1, side: THREE.DoubleSide }));
  water.rotation.x = Math.PI / 2; water.position.y = 0.6; water.receiveShadow = true; scene.add(water);
  // 둑
  const bank = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: "#E6D8B0", side: THREE.DoubleSide })); bank.rotation.x = Math.PI / 2; bank.position.y = 0.4; bank.scale.set(1, 1, 1); scene.add(bank);
  // 돛단배
  const boat = new THREE.Group(); boat.position.copy(P(1230, 1060)).setY(1);
  mesh(new THREE.BoxGeometry(34, 5, 12), flock("#7A4A30"), [0, 2, 0], [0, 0, 0], boat);
  const sail = mesh(new THREE.ConeGeometry(12, 30, 3), flock("#F4EFE4"), [0, 20, 0], [0, 0, 0], boat); sail.scale.z = 0.15;
  boat.rotation.y = 0.4; scene.add(boat);
}
function tree(scene, x, y, s = 1, kind = "round") {
  const g = new THREE.Group(); g.position.copy(P(x, y));
  mesh(new THREE.CylinderGeometry(2.2 * s, 3 * s, 12 * s, 8), flock("#7A5038"), [0, 6 * s, 0], [0, 0, 0], g);
  if (kind === "pine") { for (let i = 0; i < 3; i++) mesh(new THREE.ConeGeometry((13 - i * 3) * s, 14 * s, 10), flock("#4E7A52"), [0, (14 + i * 8) * s, 0], [0, 0, 0], g); }
  else { const c = ["#6FA85A", "#88BC64", "#5E9A50", "#E9A7A0"][Math.floor((x * 7 + y) % 4)]; blob(flock(c), [12 * s, 11 * s, 12 * s], [0, 20 * s, 0], [0, 0, 0], g); blob(flock(c), [8 * s, 8 * s, 8 * s], [6 * s, 26 * s, 3 * s], [0, 0, 0], g); }
  scene.add(g);
}
function mountain(scene, x, y, s) {
  const m = mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), flock("#8FAE7C"), [0, 0, 0], [0, 0, 0]);
  m.scale.set(60 * s, 55 * s, 40 * s); m.position.copy(P(x, y)); scene.add(m);
  const cap = mesh(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), flock("#A9C08F"), [0, 0, 0], [0, 0, 0]);
  cap.scale.set(30 * s, 30 * s, 22 * s); cap.position.copy(P(x - 10 * s, y + 4)).setY(20 * s); scene.add(cap);
}
function lamp(scene, x, y, lit) {
  const g = new THREE.Group(); g.position.copy(P(x, y));
  if (lit) {
    const pl = new THREE.PointLight("#FFC879", 1400, 170, 2); pl.position.set(12, 32, 0); g.add(pl);
    // 고보 조명: 길바닥에 비치는 무늬 빛 (강경근대거리의 밤 풍경)
    const gobo = canvasTex("gobo", 256, 256, (c, w, h) => {
      c.clearRect(0, 0, w, h); c.translate(w / 2, h / 2);
      const gr = c.createRadialGradient(0, 0, 10, 0, 0, w / 2); gr.addColorStop(0, "rgba(255,214,150,.9)"); gr.addColorStop(1, "rgba(255,214,150,0)");
      c.fillStyle = gr; c.beginPath(); c.arc(0, 0, w / 2, 0, 7); c.fill();
      c.fillStyle = "rgba(255,245,220,.95)";
      for (let k = 0; k < 8; k++) { c.rotate(Math.PI / 4); c.beginPath(); c.ellipse(0, 46, 14, 34, 0, 0, 7); c.fill(); }
      c.beginPath(); c.arc(0, 0, 16, 0, 7); c.fill();
    });
    const disc = new THREE.Mesh(new THREE.CircleGeometry(16, 32), new THREE.MeshBasicMaterial({ map: gobo, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    disc.rotation.x = -Math.PI / 2; disc.position.set(12, 0.8, 4); g.add(disc);
  }
  // 강경근대거리 가로등: 검은 주물 기둥 + 덩굴무늬 곡선 팔 + 줄지어 매달린 둥근 유리등
  const iron = flock("#2B2E30");
  mesh(new THREE.CylinderGeometry(1.1, 1.9, 34, 10), iron, [0, 17, 0], [0, 0, 0], g);
  mesh(new THREE.CylinderGeometry(2.2, 2.4, 3, 10), iron, [0, 1.5, 0], [0, 0, 0], g);
  const arm = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 30, 0), new THREE.Vector3(6, 34, 0), new THREE.Vector3(14, 36, 0), new THREE.Vector3(22, 37, 0)]);
  mesh(new THREE.TubeGeometry(arm, 16, 0.6, 6), iron, [0, 0, 0], [0, 0, 0], g);
  for (let k = 0; k < 2; k++) mesh(new THREE.TorusGeometry(2.4, 0.35, 6, 14, Math.PI * 1.5), iron, [4 + k * 5, 31.5 + k * 1.5, 0], [0, 0, k * 1.2], g);
  for (let i = 0; i < 5; i++) {
    const x = 5 + i * 4.3, y = 34.6 + i * 0.6;
    mesh(new THREE.CylinderGeometry(0.15, 0.15, 2, 4), iron, [x, y - 1, 0], [0, 0, 0], g);
    mesh(new THREE.SphereGeometry(1.8, 14, 10), new THREE.MeshStandardMaterial({ color: "#FAF6EE", emissive: "#FFDCA0", emissiveIntensity: lit ? 2.2 : 0.1, roughness: 0.3 }), [x, y - 3, 0], [0, 0, 0], g);
  }
  scene.add(g);
}

/** 강경구락부(江景俱樂部) 광장: 돌바닥 + 원형 분수 + 파라솔 테이블 + 아치 정문 */
function clubSquare(scene, night) {
  const c = P(1085, 765);
  const cob = canvasTex("clubcob", 256, 256, (cx, w, h) => { cx.fillStyle = "#BDBAB2"; cx.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 12) for (let x = ((y / 12) % 2) * 6; x < w; x += 12) { cx.fillStyle = ["#CBC8C0", "#AFACA4", "#C2BFB7"][(x * 7 + y) % 3]; cx.fillRect(x + 1, y + 1, 10, 10); } });
  const ct = cob.clone(); ct.wrapS = ct.wrapT = THREE.RepeatWrapping; ct.repeat.set(10, 10); ct.needsUpdate = true;
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(115, 48), new THREE.MeshStandardMaterial({ map: ct, roughness: 0.95 })); plaza.rotation.x = -Math.PI / 2; plaza.position.copy(c).setY(0.6); plaza.receiveShadow = true; scene.add(plaza);
  const lawn = new THREE.Mesh(new THREE.CircleGeometry(34, 8), flock("#9FB46A")); lawn.rotation.x = -Math.PI / 2; lawn.position.copy(c).setY(0.8); scene.add(lawn);
  const stone = flock("#C9BFA8");
  const f = new THREE.Group(); f.position.copy(c); scene.add(f);
  mesh(new THREE.CylinderGeometry(16, 17, 5, 8), stone, [0, 2.5, 0], [0, Math.PI / 8, 0], f);
  mesh(new THREE.CylinderGeometry(14.5, 14.5, 0.8, 8), new THREE.MeshPhysicalMaterial({ color: "#7FB2BC", roughness: 0.1, clearcoat: 1 }), [0, 4.6, 0], [0, Math.PI / 8, 0], f);
  mesh(new THREE.CylinderGeometry(1.6, 2.6, 12, 12), stone, [0, 9, 0], [0, 0, 0], f);
  mesh(new THREE.CylinderGeometry(7, 3, 2.5, 20), stone, [0, 15, 0], [0, 0, 0], f);
  mesh(new THREE.ConeGeometry(2.2, 6, 10), new THREE.MeshPhysicalMaterial({ color: "#DDF0F4", roughness: 0.05, transmission: 0.5, emissive: night ? "#9FD0E0" : "#000", emissiveIntensity: night ? 0.5 : 0 }), [0, 19, 0], [0, 0, 0], f);
  for (const [dx, dz, col] of [[-50, 30, "#5E6E86"], [-28, 44, "#5E6E86"], [-6, 52, "#2E5E4E"], [40, -38, "#5E6E86"]]) {
    const u = new THREE.Group(); u.position.copy(c).add(new THREE.Vector3(dx, 0, dz)); scene.add(u);
    mesh(new THREE.CylinderGeometry(0.5, 0.5, 18, 6), flock("#E6E6E2"), [0, 9, 0], [0, 0, 0], u);
    mesh(new THREE.ConeGeometry(11, 4, 8), flock(col), [0, 18, 0], [0, 0, 0], u);
    mesh(new THREE.CylinderGeometry(4, 4, 0.8, 16), flock("#4A4F52"), [0, 6, 0], [0, 0, 0], u);
    for (let k = 0; k < 3; k++) { const a0 = (k / 3) * Math.PI * 2; mesh(new THREE.BoxGeometry(3.4, 6, 3.4), flock("#8FA8A0"), [Math.cos(a0) * 6.5, 3, Math.sin(a0) * 6.5], [0, -a0, 0], u); }
  }
  // 아치 정문 '강경구락부': 붉은 벽돌 기둥 + 철제 아치 + 마름모 글자판
  const gt = new THREE.Group(); gt.position.copy(P(965, 905)); gt.rotation.y = 0.5; scene.add(gt);
  for (const sx of [-1, 1]) { mesh(new THREE.BoxGeometry(6, 26, 6), flock("#8E4A3A"), [sx * 22, 13, 0], [0, 0, 0], gt); mesh(new THREE.BoxGeometry(7.5, 2, 7.5), flock("#BFBAB0"), [sx * 22, 27, 0], [0, 0, 0], gt); }
  mesh(new THREE.TorusGeometry(19, 0.8, 8, 32, Math.PI), flock("#3E4448"), [0, 26, 0], [0, 0, 0], gt);
  mesh(new THREE.BoxGeometry(46, 0.8, 0.8), flock("#3E4448"), [0, 44, 0], [0, 0, 0], gt);
  ["강", "경", "구", "락", "부"].forEach((ch, i) => { const t = canvasTex(`club-${ch}`, 64, 64, (cx, w, h) => { cx.fillStyle = "#4A5054"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#F2F2F2"; cx.font = "bold 40px sans-serif"; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText(ch, w / 2, h / 2 + 2); }); const d = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshStandardMaterial({ map: t, side: THREE.DoubleSide })); d.rotation.z = Math.PI / 4; d.position.set(-14 + i * 7, 37 + Math.sin((i / 4) * Math.PI) * 4, 0.6); gt.add(d); });
}

/** 옛 한일은행 강경지점(강경역사관, 국가등록문화유산) — 현장 사진 기준
 *  붉은 벽돌 단층(높은 층고) · 모서리 석재 귀돌 · 벽기둥 4개와 석재 기둥머리 · 패널 돌림띠(엔타블레이처)
 *  · 쇠창살 높은 창 2개 · 석재 문틀 정문과 현판 · 짙은 슬레이트 우진각 지붕과 환기 지붕창 2개 · 돌계단 */
function oldBank(scene, night) {
  const g = new THREE.Group(); g.position.copy(P(925, 945)); g.rotation.y = 0.45; scene.add(g);
  const W = 76, H = 40, D = 50, F = D / 2; // F: 정면 z
  const brick = canvasTex("bankbrick2", 256, 256, (c, w, h) => {
    c.fillStyle = "#A2493A"; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 8) for (let x = (y / 8) % 2 ? -8 : 0; x < w; x += 16) { c.fillStyle = `hsl(${8 + ((x * 7 + y * 3) % 6)}, ${46 + ((x + y) % 9)}%, ${36 + ((x * 3 + y) % 7)}%)`; c.fillRect(x + 1, y + 1, 14, 6); }
  });
  brick.wrapS = brick.wrapT = THREE.RepeatWrapping;
  const brickMat = (rx, ry) => { const t = brick.clone(); t.repeat.set(rx, ry); t.needsUpdate = true; return new THREE.MeshStandardMaterial({ map: t, roughness: 0.92 }); };
  const stone = flock("#CFC9BC"), stoneDark = flock("#B9B2A4");
  // 몸체
  mesh(new THREE.BoxGeometry(W, H, D), brickMat(5, 3), [0, H / 2, 0], [0, 0, 0], g);
  // 화강석 기단
  mesh(new THREE.BoxGeometry(W + 2, 4, D + 2), stoneDark, [0, 2, 0], [0, 0, 0], g);
  mesh(new THREE.BoxGeometry(W + 2.6, 1, D + 2.6), stone, [0, 4.2, 0], [0, 0, 0], g);
  // 모서리 귀돌 (긴 돌·짧은 돌 번갈아)
  for (const sx of [-1, 1]) for (let y = 6, i = 0; y < H - 6; y += 4.2, i++) {
    const long = i % 2 === 0;
    mesh(new THREE.BoxGeometry(long ? 6 : 3.6, 2.6, 1.2), stone, [sx * (W / 2 - (long ? 3 : 1.8)), y, F + 0.5], [0, 0, 0], g);
    mesh(new THREE.BoxGeometry(1.2, 2.6, long ? 3.6 : 6), stone, [sx * (W / 2 + 0.5), y, F - (long ? 1.8 : 3)], [0, 0, 0], g);
  }
  // 벽기둥 4개 + 석재 기둥머리
  for (const x of [-0.37, -0.12, 0.12, 0.37]) {
    mesh(new THREE.BoxGeometry(5.5, H - 10, 1.6), brickMat(0.4, 2.2), [x * W, (H - 10) / 2 + 4.5, F + 0.8], [0, 0, 0], g);
    mesh(new THREE.BoxGeometry(7.5, 2.4, 2.8), stone, [x * W, H - 5.2, F + 1.2], [0, 0, 0], g);
    mesh(new THREE.BoxGeometry(6.5, 1.2, 2.4), stone, [x * W, H - 6.8, F + 1.1], [0, 0, 0], g);
  }
  // 엔타블레이처: 아래 띠 · 패널 띠 · 처마돌림
  mesh(new THREE.BoxGeometry(W + 1.4, 1.4, D + 1.4), stone, [0, H - 3.9, 0], [0, 0, 0], g);
  const frieze = canvasTex("bankfrieze", 512, 32, (c, w, h) => { c.fillStyle = "#D6D0C3"; c.fillRect(0, 0, w, h); c.strokeStyle = "#A9A193"; c.lineWidth = 2; for (let x = 6; x < w - 20; x += 34) c.strokeRect(x, 6, 28, h - 12); });
  mesh(new THREE.BoxGeometry(W + 1.6, 3.6, D + 1.6), new THREE.MeshStandardMaterial({ map: frieze, roughness: 0.8 }), [0, H - 1.4, 0], [0, 0, 0], g);
  mesh(new THREE.BoxGeometry(W + 3.6, 1.4, D + 3.6), stone, [0, H + 1, 0], [0, 0, 0], g);
  // 쇠창살 높은 창
  const grille = canvasTex(`bankgrille-${night ? "n" : "d"}`, 64, 160, (c, w, h) => {
    c.fillStyle = night ? "#E8B865" : "#2F3B44"; c.fillRect(0, 0, w, h);
    c.strokeStyle = "#E4E2DC"; c.lineWidth = 1.6;
    for (let x = 6; x < w; x += 13) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
    for (let y = 10; y < h; y += 30) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); for (let x = 12; x < w; x += 13) { c.beginPath(); c.moveTo(x - 6, y + 8); c.lineTo(x, y + 2); c.lineTo(x + 6, y + 8); c.lineTo(x, y + 14); c.closePath(); c.stroke(); } }
  });
  for (const sx of [-1, 1]) {
    const x = sx * 0.245 * W;
    mesh(new THREE.BoxGeometry(11, 25, 0.6), new THREE.MeshStandardMaterial({ map: grille, emissive: night ? "#FFB55A" : "#000", emissiveIntensity: night ? 0.45 : 0, roughness: 0.5 }), [x, 19.5, F + 0.35], [0, 0, 0], g);
    mesh(new THREE.BoxGeometry(12.5, 1.2, 1.8), stone, [x, 6.6, F + 0.7], [0, 0, 0], g); // 창턱
    // 창 위 벽돌 쐐기 아치(석재 쐐기돌 셋)
    mesh(new THREE.BoxGeometry(2.4, 3.6, 1.4), stone, [x, 33.6, F + 0.7], [0, 0, 0], g);
    for (const d of [-1, 1]) mesh(new THREE.BoxGeometry(2.2, 3.2, 1.3), stone, [x + d * 4.2, 33.2, F + 0.65], [0, 0, d * 0.35], g);
  }
  // 정문: 석재 문틀(위가 둥근 상인방) + 크림색 나무문 + 위 채광창 + 현판
  mesh(new THREE.BoxGeometry(14, 2.2, 2.2), stone, [0, 26.5, F + 1.1], [0, 0, 0], g);
  const lintel = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 6.5, 2, 24, 1, false, -Math.PI / 2, Math.PI), stone); lintel.rotation.x = Math.PI / 2; lintel.rotation.z = 0; lintel.position.set(0, 27.4, F + 1.1); lintel.scale.set(1, 1, 0.5); g.add(lintel);
  for (const sx of [-1, 1]) mesh(new THREE.BoxGeometry(2.2, 21, 2), stone, [sx * 6, 15, F + 1], [0, 0, 0], g);
  mesh(new THREE.BoxGeometry(9.6, 15, 0.8), flock("#E2C9A8"), [0, 12, F + 0.5], [0, 0, 0], g);
  mesh(new THREE.BoxGeometry(9.6, 4.6, 0.6), new THREE.MeshStandardMaterial({ color: night ? "#F2C77B" : "#3A4650", emissive: night ? "#FFB55A" : "#000", emissiveIntensity: night ? 0.6 : 0 }), [0, 22, F + 0.5], [0, 0, 0], g);
  const plaque = canvasTex("bankplaque", 256, 96, (c, w, h) => { c.fillStyle = "#EEEBE4"; c.fillRect(0, 0, w, h); c.strokeStyle = "#8C877C"; c.lineWidth = 6; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = "#3A3632"; c.textAlign = "center"; c.font = "bold 30px serif"; c.fillText("舊 韓一銀行", w / 2, 46); c.font = "16px sans-serif"; c.fillText("THE HANIL BANK", w / 2, 74); });
  mesh(new THREE.BoxGeometry(13, 5, 0.6), new THREE.MeshStandardMaterial({ map: plaque }), [0, 31.5, F + 0.4], [0, 0, 0], g);
  const sign = canvasTex("banksign", 48, 192, (c, w, h) => { c.fillStyle = "#3D3027"; c.fillRect(0, 0, w, h); c.fillStyle = "#EFE6D2"; c.font = "bold 30px sans-serif"; c.textAlign = "center"; "강경역사관".split("").forEach((ch, i) => c.fillText(ch, w / 2, 34 + i * 36)); });
  mesh(new THREE.BoxGeometry(2.4, 10, 0.4), new THREE.MeshStandardMaterial({ map: sign }), [8.6, 12, F + 1.3], [0, 0, 0], g);
  // 돌계단 셋
  for (let i = 0; i < 3; i++) mesh(new THREE.BoxGeometry(16 - i * 2, 1.4, 3), stone, [0, 0.7 + i * 1.4, F + 6.5 - i * 2.4], [0, 0, 0], g);
  // 태극기 깃대
  mesh(new THREE.CylinderGeometry(0.25, 0.25, 22, 6), flock("#D9D6CF"), [-15, 22, F + 2.2], [0, 0, 0.35], g);
  const flag = canvasTex("taegeuk", 96, 64, (c, w, h) => { c.fillStyle = "#FFFFFF"; c.fillRect(0, 0, w, h); c.fillStyle = "#C8102E"; c.beginPath(); c.arc(w / 2, h / 2, 14, Math.PI, 0); c.fill(); c.fillStyle = "#0047A0"; c.beginPath(); c.arc(w / 2, h / 2, 14, 0, Math.PI); c.fill(); c.fillStyle = "#111"; for (const [x, y] of [[14, 12], [w - 14, 12], [14, h - 12], [w - 14, h - 12]]) c.fillRect(x - 6, y - 4, 12, 8); });
  mesh(new THREE.PlaneGeometry(7, 4.6), new THREE.MeshStandardMaterial({ map: flag, side: THREE.DoubleSide }), [-20.5, 30.5, F + 2.4], [0, 0.2, 0.05], g);
  // 옆면 창 (작게)
  for (const sx of [-1, 1]) for (const z of [-0.2, 0.2]) mesh(new THREE.BoxGeometry(0.6, 18, 8), new THREE.MeshStandardMaterial({ map: grille, emissive: night ? "#FFB55A" : "#000", emissiveIntensity: night ? 0.35 : 0 }), [sx * (W / 2 + 0.3), 18, z * D], [0, 0, 0], g);
  // 짙은 슬레이트 우진각 지붕 + 환기 지붕창 둘
  const roof = hipRoof(W + 1, D + 1, 20, "#4A4E55"); roof.position.y = H + 1.7; g.add(roof);
  for (const sx of [-1, 1]) {
    const dg = new THREE.Group(); dg.position.set(sx * 0.26 * W, H + 7.5, F * 0.66); g.add(dg);
    mesh(new THREE.BoxGeometry(7.5, 6.5, 7), flock("#565A61"), [0, 0, 0], [0, 0, 0], dg);
    const gab = new THREE.Mesh(new THREE.ConeGeometry(6, 4.5, 4, 1), flock("#3E4248")); gab.rotation.y = Math.PI / 4; gab.scale.set(1, 1, 0.85); gab.position.y = 5.4; dg.add(gab);
    mesh(new THREE.BoxGeometry(5.6, 4.6, 0.4), flock("#2A2C30"), [0, -0.2, 3.55], [0, 0, 0], dg);
    for (let i = 0; i < 4; i++) mesh(new THREE.BoxGeometry(5.4, 0.45, 0.7), flock("#6A6E75"), [0, -2 + i * 1.25, 3.8], [-0.4, 0, 0], dg);
  }
}
/** 나무 전봇대 (애자가 달린 가로대 셋) */
function pole(scene, x, y) {
  const g = new THREE.Group(); g.position.copy(P(x, y)); scene.add(g);
  const wood = flock("#4A3A30");
  mesh(new THREE.CylinderGeometry(0.9, 1.2, 50, 8), wood, [0, 25, 0], [0, 0, 0], g);
  for (const yy of [46, 42, 38]) { mesh(new THREE.BoxGeometry(14, 1, 1.2), wood, [0, yy, 0], [0, 0, 0], g); for (const sx of [-6, -2, 2, 6]) mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.4, 6), flock("#E9E6E0"), [sx, yy + 1.1, 0], [0, 0, 0], g); }
}
/** 나무 육각 공중전화 부스 'TELEPHONE' */
function phoneBooth(scene, x, y) {
  const g = new THREE.Group(); g.position.copy(P(x, y)); g.rotation.y = 0.3; scene.add(g);
  mesh(new THREE.CylinderGeometry(5.5, 5.5, 5, 6), flock("#5A3A26"), [0, 2.5, 0], [0, 0, 0], g);
  mesh(new THREE.CylinderGeometry(5.2, 5.2, 12, 6), new THREE.MeshPhysicalMaterial({ color: "#C4D4D8", roughness: 0.1, transmission: 0.4 }), [0, 11, 0], [0, 0, 0], g);
  for (let i = 0; i < 6; i++) { const t = (i / 6) * Math.PI * 2; mesh(new THREE.BoxGeometry(1, 12, 1), flock("#5A3A26"), [Math.cos(t) * 5.3, 11, Math.sin(t) * 5.3], [0, 0, 0], g); }
  mesh(new THREE.ConeGeometry(7.5, 6, 6), flock("#6B4530"), [0, 20, 0], [0, 0, 0], g);
  mesh(new THREE.SphereGeometry(1, 8, 6), flock("#6B4530"), [0, 23.5, 0], [0, 0, 0], g);
}

/** 디오라마 전체 */
export function buildDiorama(scene, locs, { night = false, only = null } = {}) {
  ground(scene); river(scene);
  const r = rnd(42);
  for (const a of locs) { if (only && a.id !== only) continue; const b = building2(a, r, { night }); b.position.copy(P(a.x, a.y - 4)); scene.add(b); }
  // 산 (지도 위쪽 가장자리)
  for (let x = 250; x < 1360; x += 85) mountain(scene, x + r() * 30, 52 + r() * 18, 0.8 + r() * 0.5);
  for (let x = -20; x < 1600; x += 95) mountain(scene, x + r() * 30, -40 + r() * 30, 1 + r() * 0.6);
  // 나무: 장소·길을 피해서
  const free = (x, y) => locs.every((l) => Math.hypot(l.x - x, l.y - y) > 70) && Math.abs(x - (508 - (y - 40) * 0.0236)) > 34 && !(x > 950 && y > 900);
  for (let i = 0; i < 520; i++) { const x = 20 + r() * 1540, y = -120 + r() * 1440; const outside = x < 240 || x > 1340 || y < 50 || y > 1130; if ((outside && !(x > 900 && y > 900)) || (!outside && free(x, y))) tree(scene, x, y, 0.7 + r() * 0.5, r() < 0.3 ? "pine" : "round"); }
  // 감성산책로: 옛 포구 장터의 고양이 이야기 — 산책로 곳곳의 고양이 가족 조형물
  if (!only) for (const [v, y, ry] of [["kangi", 330, 0.9], ["kaengi", 640, 0.6], ["kongi", 905, 1.1]]) { const c = makeCat(v, "idle"); c.scale.setScalar(7); c.position.copy(P(332, y)); c.rotation.y = ry; scene.add(c); }
  if (!only || ["coffee-interview", "hotel-west", "hotel-east", "hotel-family", "hana-donkatsu"].includes(only)) clubSquare(scene, night);
  if (!only || only === "old-bank") oldBank(scene, night);
  if (!only) { for (let y = 160; y < 1100; y += 190) pole(scene, 460 - (y - 40) * 0.0236, y); for (const [px, py] of [[700, 670], [820, 820], [1000, 690]]) pole(scene, px, py); phoneBooth(scene, 540, 860); phoneBooth(scene, 470, 1010); }
  // 길가 가로등
  for (let y = 120; y < 1100; y += 95) lamp(scene, 530 - (y - 40) * 0.0236, y, night);
}

// ── 조명 ─────────────────────────────
export function lights(scene, mode = "day", target = new THREE.Vector3(790, 0, 590 / S)) {
  // 시간대별 빛: 새벽(동쪽 분홍빛) · 낮 · 해 질 녘(서쪽 주황빛, 긴 그림자) · 밤(달빛 + 가로등)
  const L = {
    dawn: { hemi: ["#D9DDF5", "#8C7E92", 0.55], sun: ["#FFC9B0", 1.25], dir: [800, 300, 250] },
    day: { hemi: ["#FFF6E4", "#B6A57E", 0.85], sun: ["#FFF0D8", 2.4], dir: [-650, 700, 300] },
    dusk: { hemi: ["#F2B48C", "#3E3658", 0.42], sun: ["#FF9A55", 1.35], dir: [-900, 260, 150] },
    night: { hemi: ["#6E84B8", "#141A26", 0.22], sun: ["#A9BCF0", 0.38], dir: [-500, 900, 400] },
    fog: { hemi: ["#F1F1EA", "#B6B0A0", 0.95], sun: ["#FFFFFF", 1.2], dir: [-650, 700, 300] },
  }[mode === "festival" ? "night" : mode] ?? null;
  const c = L ?? { hemi: ["#FFF6E4", "#B6A57E", 0.85], sun: ["#FFF0D8", 2.4], dir: [-650, 700, 300] };
  scene.add(new THREE.HemisphereLight(c.hemi[0], c.hemi[1], c.hemi[2]));
  const sun = new THREE.DirectionalLight(c.sun[0], c.sun[1]);
  sun.position.copy(target).add(new THREE.Vector3(...c.dir)); sun.target.position.copy(target);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.radius = 4;
  Object.assign(sun.shadow.camera, { left: -1100, right: 1100, top: 1100, bottom: -1100, near: 10, far: 4000 });
  scene.add(sun, sun.target);
  if (mode === "fog") scene.fog = new THREE.Fog("#D9DCD3", 200, 900);
}
export const isLit = (mode) => mode === "night" || mode === "festival" || mode === "dusk";
