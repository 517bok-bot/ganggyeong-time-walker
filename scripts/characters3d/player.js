// 플레이어 타임워커 3D 피규어 + 갈아입는 옷·모자·소품 (각각 따로 구워 겹쳐 씁니다)
// layer === "base" 이면 몸 전체를 그리고, 그 밖에는 몸을 '깊이만 있는 가림막'으로 두고 해당 소품만 그립니다.
// 그래서 소품 이미지를 몸 이미지 위에 그대로 겹치면 가려질 부분이 정확히 가려집니다.
import * as THREE from "three";
import { blob, mesh, flock, gloss, canvasTex, eyes, blush, mouth, surfZ } from "./models.js";

const SKIN = "#F7D9C2", HAIR = "#3E2C25";
export const COATS = { sage: "#3E6466", brick: "#A34A40", gold: "#C49A55", wood: "#6E5880" };

function occ(m) { return new THREE.MeshBasicMaterial({ colorWrite: false }); }

/** 몸 (두루마기 또는 갈아입은 옷) */
function body(g, { avatar = "sage", outfit = null, coatColor = null }, hide) {
  const M = (c, o) => (hide ? occ() : flock(c, o));
  const G = (c) => (hide ? occ() : gloss(c));
  const head = { c: [0, 1.86, 0.02], r: [0.8, 0.74, 0.74] };
  // 다리·신발
  for (const s of [-1, 1]) {
    mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.34, 16), M(outfit === "outfit-dress" || outfit === "outfit-hanbok" ? SKIN : "#3A3330"), [s * 0.17, 0.27, 0.02], [0, 0, 0], g);
    blob(G(outfit === "outfit-dress" ? "#7A2E2A" : "#2E2624"), [0.15, 0.1, 0.22], [s * 0.18, 0.08, 0.08], [0, 0, 0], g);
  }
  // 옷 몸통 (돌림체)
  const profile = {
    null: [[0.0, 1.32], [0.28, 1.3], [0.4, 1.12], [0.5, 0.7], [0.6, 0.36], [0.58, 0.32], [0, 0.32]],
    "outfit-suit": [[0, 1.32], [0.28, 1.3], [0.4, 1.12], [0.44, 0.75], [0.46, 0.5], [0, 0.5]],
    "outfit-dress": [[0, 1.32], [0.26, 1.3], [0.36, 1.12], [0.38, 0.95], [0.62, 0.42], [0, 0.42]],
    "outfit-hanbok": [[0, 1.32], [0.26, 1.3], [0.36, 1.18], [0.4, 1.08], [0.66, 0.24], [0, 0.24]],
    "outfit-academy": [[0, 1.32], [0.3, 1.3], [0.42, 1.1], [0.55, 0.6], [0.66, 0.24], [0, 0.24]],
  }[String(outfit)];
  const coat = outfit === "outfit-suit" ? "#3B3532" : outfit === "outfit-dress" ? "#2F3E5C" : outfit === "outfit-hanbok" ? "#E46F86" : outfit === "outfit-academy" ? "#24304A" : coatColor ?? COATS[avatar] ?? COATS.sage;
  const map = outfit === "outfit-academy" ? canvasTex("stars", 512, 256, (c, w, h) => { c.fillStyle = "#24304A"; c.fillRect(0, 0, w, h); c.fillStyle = "#E7C46A"; for (let i = 0; i < 40; i++) { const x = (i * 131) % w, y = (i * 71) % h; c.beginPath(); for (let k = 0; k < 5; k++) { const a = (k * 4 * Math.PI) / 5; c.lineTo(x + Math.cos(a) * 7, y + Math.sin(a) * 7); } c.fill(); } c.fillRect(0, h - 26, w, 10); })
    : outfit === "outfit-hanbok" ? canvasTex("chima", 256, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#E46F86"); gr.addColorStop(1, "#C9506C"); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = "#E9C46A"; c.fillRect(0, h - 22, w, 8); })
    : null;
  const pts = new THREE.SplineCurve(profile.map(([r, y]) => new THREE.Vector2(r, y))).getPoints(40);
  mesh(new THREE.LatheGeometry(pts, 48), hide ? occ() : flock(map ? "#ffffff" : coat, { map }), [0, 0, 0], [0, 0, 0], g);
  if (!hide) {
    if (!outfit) { // 동정(흰 깃) + 옷고름
      mesh(new THREE.TorusGeometry(0.29, 0.04, 10, 40, Math.PI * 1.2), flock("#F7F2E8"), [0, 1.27, 0.05], [Math.PI / 2 - 0.2, 0, Math.PI * 0.4 - Math.PI / 2 + 0.3], g);
      blob(flock("#C9463D"), [0.05, 0.05, 0.04], [0.14, 1.04, 0.43], [0, 0, 0], g);
      blob(flock("#C9463D"), [0.035, 0.13, 0.025], [0.1, 0.92, 0.46], [0.1, 0, 0.3], g);
      blob(flock("#C9463D"), [0.035, 0.11, 0.025], [0.2, 0.93, 0.45], [0.1, 0, -0.35], g);
    }
    if (outfit === "outfit-suit") {
      blob(flock("#F7F2E8"), [0.14, 0.2, 0.06], [0, 1.12, 0.36], [0.2, 0, 0], g);
      blob(flock("#9E3A33"), [0.05, 0.16, 0.03], [0, 1.06, 0.41], [0.2, 0, 0], g);
      for (const y of [0.95, 0.8]) blob(gloss("#C8A24A"), [0.03, 0.03, 0.02], [0.08, y, 0.44], [0, 0, 0], g);
    }
    if (outfit === "outfit-dress") { // 세일러 깃 + 리본
      const col = mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 40, 1, false, -0.9, 1.8), flock("#F7F2E8"), [0, 1.24, 0.02], [0.25, 0, 0], g);
      col.rotation.y = Math.PI;
      blob(flock("#B8423A"), [0.12, 0.07, 0.05], [0, 1.12, 0.38], [0, 0, 0], g);
    }
    if (outfit === "outfit-hanbok") { // 노란 저고리 + 붉은 고름
      mesh(new THREE.LatheGeometry(new THREE.SplineCurve([[0, 1.32], [0.28, 1.3], [0.42, 1.12], [0.45, 0.98], [0, 0.98]].map(([r, y]) => new THREE.Vector2(r, y))).getPoints(20), 40), flock("#F2CF5E"), [0, 0.02, 0], [0, 0, 0], g);
      blob(flock("#B8423A"), [0.05, 0.18, 0.03], [0.1, 0.96, 0.44], [0, 0, 0.1], g);
    }
    if (outfit === "outfit-academy") mesh(new THREE.TorusGeometry(0.3, 0.05, 10, 40), gloss("#D8B45E"), [0, 1.26, 0.02], [Math.PI / 2 - 0.15, 0, 0], g);
  }
  // 팔 (넓은 소매) + 손
  const sleeve = (s) => outfit === "outfit-hanbok" ? canvasTex("saekdong", 256, 64, (c, w, h) => { ["#D9534F", "#F0C04A", "#5FA36B", "#4A7FB8", "#F2F0EA", "#E46F86"].forEach((col, i) => { c.fillStyle = col; c.fillRect((i * w) / 6, 0, w / 6, h); }); }) : null;
  for (const s of [-1, 1]) {
    const tex = sleeve(s);
    blob(hide ? occ() : flock(tex ? "#ffffff" : outfit === "outfit-hanbok" ? "#F2CF5E" : coat, { map: tex }), [0.17, 0.3, 0.2], [s * 0.5, 0.98, 0.12], [0.3, 0, s * 0.45], g);
    blob(M(SKIN), [0.1, 0.1, 0.1], [s * 0.6, 0.72, 0.26], [0, 0, 0], g);
  }
  // 머리
  blob(M(SKIN), head.r, head.c, [0, 0, 0], g);
  // 귀
  for (const s of [-1, 1]) blob(M(SKIN), [0.1, 0.13, 0.07], [s * 0.78, 1.82, 0], [0, 0, 0], g);
  // 머리카락: 뒤통수 + 앞머리
  blob(M(HAIR), [0.84, 0.78, 0.78], [0, 1.95, -0.08], [0, 0, 0], g);
  for (const [x, y, rz] of [[-0.42, 2.18, 0.5], [-0.15, 2.26, 0.2], [0.15, 2.26, -0.2], [0.42, 2.18, -0.5]]) blob(M(HAIR), [0.26, 0.16, 0.14], [x, y, surfZ(x, y, head.c, head.r, -0.1)], [0.4, 0, rz], g);
  if (!hide) {
    eyes(g, { y: 1.8, dx: 0.26, head, mood: "idle", size: 0.9 });
    blush(g, { y: 1.64, dx: 0.42, head, size: 0.9 });
    mouth(g, { y: 1.6, head, mood: "happy" });
  }
  return head;
}

const head = { c: [0, 1.86, 0.02], r: [0.8, 0.74, 0.74] };

/** 소품 하나 */
function item(g, id) {
  const brown = flock("#4A3A32");
  switch (id) {
    case "hat-fedora": {
      mesh(new THREE.CylinderGeometry(0.98, 0.98, 0.05, 48), brown, [0, 2.38, 0], [-0.08, 0, 0.04], g);
      mesh(new THREE.CylinderGeometry(0.5, 0.62, 0.42, 40), brown, [0, 2.6, -0.02], [-0.08, 0, 0.04], g);
      mesh(new THREE.CylinderGeometry(0.625, 0.63, 0.1, 40), flock("#B8873E"), [0, 2.45, -0.01], [-0.08, 0, 0.04], g);
      break;
    }
    case "hat-straw": {
      const straw = flock("#E6C77E", { map: canvasTex("straw", 256, 256, (c, w, h) => { c.fillStyle = "#E6C77E"; c.fillRect(0, 0, w, h); c.strokeStyle = "#C9A55A"; c.lineWidth = 3; for (let i = 0; i < h; i += 8) { c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); } }) });
      mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.05, 56), straw, [0, 2.36, 0], [-0.1, 0, 0], g);
      blob(straw, [0.62, 0.36, 0.62], [0, 2.42, -0.02], [-0.1, 0, 0], g);
      mesh(new THREE.CylinderGeometry(0.63, 0.63, 0.1, 40), flock("#C54A3E"), [0, 2.46, -0.02], [-0.1, 0, 0], g);
      break;
    }
    case "hat-beret": {
      blob(flock("#A3383A"), [0.82, 0.24, 0.8], [0.12, 2.42, -0.04], [0, 0, -0.22], g);
      mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 8), flock("#A3383A"), [0.16, 2.66, -0.02], [0, 0, -0.2], g);
      break;
    }
    case "hat-cat": {
      const c = flock("#FBEBD3");
      blob(c, [0.93, 0.68, 0.9], [0, 2.08, -0.1], [0, 0, 0], g);
      mesh(new THREE.TorusGeometry(0.8, 0.07, 12, 48, Math.PI), c, [0, 1.86, 0.18], [0, 0, 0], g);
      for (const s of [-1, 1]) { const e = mesh(new THREE.ConeGeometry(0.24, 0.42, 32), s < 0 ? flock("#E98A3E") : c, [s * 0.5, 2.62, -0.04], [0, 0, -s * 0.38], g); e.scale.z = 0.6; const i = mesh(new THREE.ConeGeometry(0.13, 0.26, 24), flock("#EFA58C"), [s * 0.48, 2.6, 0.06], [0, 0, -s * 0.38], g); i.scale.z = 0.4; }
      break;
    }
    case "hat-cloche": {
      const rose = flock("#C77B8A");
      blob(rose, [0.86, 0.6, 0.84], [0, 2.12, -0.06], [0, 0, 0], g);
      mesh(new THREE.CylinderGeometry(0.95, 0.9, 0.06, 48), rose, [0, 2.06, 0.02], [0.18, 0, 0], g);
      for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; blob(flock("#F6E2D2"), [0.07, 0.07, 0.04], [0.55 + Math.cos(a) * 0.07, 2.32 + Math.sin(a) * 0.07, 0.55], [0, 0, 0], g); }
      blob(gloss("#E3B33E"), [0.04, 0.04, 0.04], [0.55, 2.32, 0.58], [0, 0, 0], g);
      break;
    }
    case "hat-gat": {
      const black = new THREE.MeshPhysicalMaterial({ color: "#1C1816", roughness: 0.4, transparent: true, opacity: 0.88, clearcoat: 0.5 });
      mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.03, 64), black, [0, 2.32, 0], [-0.06, 0, 0], g);
      mesh(new THREE.CylinderGeometry(0.4, 0.46, 0.6, 40), black, [0, 2.62, -0.02], [-0.06, 0, 0], g);
      for (let i = 0; i < 7; i++) blob(gloss(i % 2 ? "#E3B33E" : "#8C3A33"), [0.035, 0.035, 0.035], [0.72 - i * 0.02, 2.2 - i * 0.12, 0.42], [0, 0, 0], g);
      break;
    }
    case "neck-scarf": {
      const sc = flock("#B5473D");
      mesh(new THREE.TorusGeometry(0.42, 0.11, 16, 40), sc, [0, 1.16, 0.04], [Math.PI / 2 - 0.25, 0, 0], g);
      blob(sc, [0.12, 0.28, 0.07], [0.24, 0.92, 0.44], [0.2, 0, 0.15], g);
      break;
    }
    case "neck-bow": {
      for (const s of [-1, 1]) { const c = mesh(new THREE.ConeGeometry(0.1, 0.18, 24), flock("#2E2624"), [s * 0.09, 1.25, 0.34], [0, 0, s * Math.PI / 2], g); c.scale.z = 0.5; }
      blob(flock("#2E2624"), [0.05, 0.05, 0.04], [0, 1.25, 0.36], [0, 0, 0], g);
      break;
    }
    case "neck-apron": {
      const ap = flock("#F4EFE4");
      const shape = new THREE.Shape(); shape.moveTo(-0.28, 0); shape.lineTo(0.28, 0); shape.lineTo(0.42, -0.85); shape.quadraticCurveTo(0, -0.95, -0.42, -0.85); shape.closePath();
      mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 }), ap, [0, 1.18, 0.4], [-0.08, 0, 0], g);
      blob(flock("#C5A272"), [0.12, 0.08, 0.02], [0.12, 0.72, 0.5], [0, 0, 0], g);
      break;
    }
    case "face-glasses": {
      const gold = gloss("#B68A3C");
      for (const s of [-1, 1]) mesh(new THREE.TorusGeometry(0.15, 0.018, 10, 40), gold, [s * 0.26, 1.8, surfZ(s * 0.26, 1.8, head.c, head.r, 0.04)], [0, s * 0.25, 0], g);
      mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 8), gold, [0, 1.83, surfZ(0, 1.83, head.c, head.r, 0.03)], [0, 0, Math.PI / 2], g);
      break;
    }
    case "face-mono": {
      mesh(new THREE.TorusGeometry(0.16, 0.022, 10, 40), gloss("#D8B45E"), [0.26, 1.8, surfZ(0.26, 1.8, head.c, head.r, 0.05)], [0, 0.25, 0], g);
      const chain = new THREE.CatmullRomCurve3([new THREE.Vector3(0.4, 1.7, 0.6), new THREE.Vector3(0.5, 1.3, 0.5), new THREE.Vector3(0.3, 1.1, 0.45)]);
      mesh(new THREE.TubeGeometry(chain, 20, 0.008, 6), gloss("#D8B45E"), [0, 0, 0], [0, 0, 0], g);
      break;
    }
    case "prop-parasol": {
      mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.9, 8), flock("#6B4A36"), [0.66, 1.5, -0.1], [0.1, 0, -0.15], g);
      const lace = flock("#FBF4EA", { map: canvasTex("lace", 256, 64, (c, w, h) => { c.fillStyle = "#FBF4EA"; c.fillRect(0, 0, w, h); c.fillStyle = "#E7C1B6"; for (let i = 0; i < 24; i++) { c.beginPath(); c.arc(i * 11 + 5, h - 6, 5, 0, 7); c.fill(); } }) });
      const pts = [[0.02, 0.55], [0.4, 0.42], [0.75, 0.2], [0.9, 0.02], [0.86, 0]].map(([r, y]) => new THREE.Vector2(r, y));
      const m = mesh(new THREE.LatheGeometry(pts, 40), lace, [0.85, 2.35, -0.2], [0.1, 0, -0.15], g); m.material.side = THREE.DoubleSide;
      break;
    }
    case "prop-trunk": {
      mesh(new THREE.BoxGeometry(0.62, 0.46, 0.28, 2, 2, 2), flock("#7A4A30", { clearcoat: 0.3 }), [0.82, 0.24, 0.2], [0, -0.3, 0], g);
      mesh(new THREE.BoxGeometry(0.64, 0.06, 0.3), flock("#C8A24A"), [0.82, 0.3, 0.2], [0, -0.3, 0], g);
      mesh(new THREE.TorusGeometry(0.1, 0.025, 8, 20, Math.PI), flock("#4A2E20"), [0.82, 0.48, 0.2], [0, -0.3, 0], g);
      break;
    }
    case "prop-camera": {
      mesh(new THREE.BoxGeometry(0.42, 0.28, 0.2), flock("#2E2624"), [0, 0.86, 0.55], [0, 0, 0], g);
      mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.16, 24), gloss("#1C1816"), [0, 0.86, 0.7], [Math.PI / 2, 0, 0], g);
      blob(gloss("#9FC4D6"), [0.07, 0.07, 0.02], [0, 0.86, 0.79], [0, 0, 0], g);
      mesh(new THREE.BoxGeometry(0.1, 0.06, 0.06), gloss("#C8C2B8"), [-0.12, 1.03, 0.55], [0, 0, 0], g);
      break;
    }
    case "prop-fan": {
      const fan = flock("#ffffff", { map: canvasTex("taeguk", 256, 256, (c, w, h) => { c.fillStyle = "#F4EDE0"; c.fillRect(0, 0, w, h); c.fillStyle = "#C33B36"; c.beginPath(); c.arc(w / 2, h / 2, 90, Math.PI, 0); c.fill(); c.fillStyle = "#2E5C9A"; c.beginPath(); c.arc(w / 2, h / 2, 90, 0, Math.PI); c.fill(); c.fillStyle = "#C33B36"; c.beginPath(); c.arc(w / 2 + 45, h / 2, 45, 0, Math.PI * 2); c.fill(); c.fillStyle = "#2E5C9A"; c.beginPath(); c.arc(w / 2 - 45, h / 2, 45, 0, Math.PI * 2); c.fill(); }) });
      mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.02, 40), fan, [0.78, 1.12, 0.3], [Math.PI / 2, 0.3, 0], g);
      mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8), flock("#7A4A30"), [0.66, 0.82, 0.28], [0, 0, 0.3], g);
      break;
    }
    case "prop-lantern": {
      mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.9, 6), flock("#5A3A2A"), [0.72, 1.0, 0.3], [0, 0, -0.5], g);
      const lan = new THREE.Group(); lan.position.set(1.0, 1.2, 0.3); g.add(lan);
      mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.22, 24), new THREE.MeshStandardMaterial({ color: "#C83A35", emissive: "#E5683A", emissiveIntensity: 0.6, roughness: 0.6 }), [0, 0.12, 0], [0, 0, 0], lan);
      mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.18, 24), new THREE.MeshStandardMaterial({ color: "#2E5C9A", emissive: "#3D6FB0", emissiveIntensity: 0.4 }), [0, -0.08, 0], [0, 0, 0], lan);
      mesh(new THREE.CylinderGeometry(0.08, 0.2, 0.06, 24), flock("#2E2624"), [0, 0.26, 0], [0, 0, 0], lan);
      mesh(new THREE.CylinderGeometry(0.2, 0.1, 0.06, 24), flock("#2E2624"), [0, -0.2, 0], [0, 0, 0], lan);
      break;
    }
    case "prop-compass": {
      mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 40), gloss("#D8B45E"), [0, 0.82, 0.55], [Math.PI / 2 - 0.3, 0, 0], g);
      mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.065, 40), flock("#F4EDE0"), [0, 0.82, 0.555], [Math.PI / 2 - 0.3, 0, 0], g);
      const nd = mesh(new THREE.ConeGeometry(0.035, 0.26, 3), gloss("#B8423A"), [0, 0.84, 0.6], [0, 0, 0.5], g); nd.scale.z = 0.3;
      break;
    }
  }
}

export function makePlayer({ avatar = "sage", outfit = null, layer = "base" }) {
  const g = new THREE.Group();
  body(g, { avatar, outfit }, layer !== "base");
  if (layer !== "base") item(g, layer);
  return g;
}

// ── 마을 사람들 (NPC) ─────────────────────────────
export function makeNpc(id) {
  const g = new THREE.Group();
  const look = { guide: ["#C49A55", "teal-cap", "map"], artisan: ["#A34A40", "dugeon", "jar"], photographer: ["#6B4A36", "newsboy", "camera"], merchant: ["#2F4F52", "red-hat", "bag"] }[id];
  body(g, { coatColor: look[0] }, false);
  if (look[1] === "teal-cap") { // 조바위
    blob(flock("#2C5052"), [0.84, 0.5, 0.8], [0, 2.22, -0.06], [0, 0, 0], g);
    blob(flock("#B8423A"), [0.07, 0.12, 0.07], [0, 2.75, -0.05], [0, 0, 0], g);
    for (const s of [-1, 1]) blob(gloss("#E3B33E"), [0.05, 0.05, 0.05], [s * 0.5, 2.25, 0.5], [0, 0, 0], g);
  }
  if (look[1] === "dugeon") { // 흰 두건
    blob(flock("#F4EFE4"), [0.86, 0.46, 0.82], [0, 2.24, -0.04], [0, 0, 0], g);
    mesh(new THREE.TorusGeometry(0.76, 0.07, 10, 40), flock("#E8DFCC"), [0, 2.08, -0.02], [Math.PI / 2 - 0.1, 0, 0], g);
    blob(flock("#F4EFE4"), [0.14, 0.09, 0.08], [0.62, 2.08, 0.4], [0, 0, 0.4], g);
  }
  if (look[1] === "newsboy") {
    blob(flock("#3A3330"), [0.88, 0.36, 0.86], [0, 2.32, -0.02], [-0.1, 0, 0], g);
    blob(flock("#3A3330"), [0.36, 0.05, 0.3], [0, 2.2, 0.7], [0.15, 0, 0], g);
    blob(flock("#3A3330"), [0.06, 0.04, 0.06], [0, 2.66, 0], [0, 0, 0], g);
  }
  if (look[1] === "red-hat") item(g, "hat-fedora"), g.children.slice(-3).forEach((m) => { if (m.material?.color && m.material.color.getHexString() === "4a3a32") m.material = flock("#8C3A33"); });
  if (look[2] === "camera") item(g, "prop-camera");
  if (look[2] === "jar") { // 옹기 항아리
    const pts = [[0, 0], [0.18, 0.02], [0.26, 0.16], [0.24, 0.32], [0.14, 0.4], [0.15, 0.44], [0, 0.44]].map(([r, y]) => new THREE.Vector2(r, y));
    mesh(new THREE.LatheGeometry(pts, 32), flock("#6A3E2A", { clearcoat: 0.5, sheen: 0.2 }), [0.62, 0.55, 0.35], [0, 0, 0], g);
  }
  if (look[2] === "map") { // 두루마리 지도
    mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.62, 16), flock("#F1E2C0"), [0, 0.8, 0.55], [0, 0, Math.PI / 2], g);
    for (const s of [-1, 1]) mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.08, 12), flock("#6B4A36"), [s * 0.35, 0.8, 0.55], [0, 0, Math.PI / 2], g);
    blob(flock("#B8423A"), [0.03, 0.08, 0.02], [0, 0.8, 0.63], [0, 0, 0], g);
  }
  if (look[2] === "bag") { // 보부상 봇짐
    blob(flock("#C9A46A"), [0.36, 0.3, 0.24], [0, 1.0, -0.55], [0, 0, 0], g);
    mesh(new THREE.TorusGeometry(0.42, 0.03, 8, 30), flock("#6B4A36"), [0, 1.1, -0.1], [0.3, 0, 0.5], g);
  }
  return g;
}

// ── 까치 우체부 포포 ─────────────────────────────
export function makeMagpie() {
  const g = new THREE.Group();
  const black = flock("#24262E", { sheen: 0.6 }), blue = flock("#2E4E66", { clearcoat: 0.6, sheen: 0.4 }), white = flock("#F6F4EE");
  const head = { c: [0, 1.62, 0.1], r: [0.72, 0.66, 0.68] };
  blob(white, [0.6, 0.62, 0.55], [0, 0.78, 0.05], [0, 0, 0], g); // 흰 배
  blob(black, [0.62, 0.62, 0.56], [0, 0.82, -0.06], [0, 0, 0], g); // 등
  for (const s of [-1, 1]) { const w = blob(blue, [0.18, 0.5, 0.36], [s * 0.56, 0.9, -0.02], [0.2, 0, s * 0.25], g); w.rotation.y = s * 0.2; blob(white, [0.1, 0.22, 0.2], [s * 0.66, 0.92, 0.04], [0.2, 0, s * 0.25], g); }
  const tail = blob(blue, [0.18, 0.08, 0.7], [0, 0.55, -0.85], [-0.5, 0, 0], g); tail.rotation.x = -0.6;
  blob(black, head.r, head.c, [0, 0, 0], g);
  mesh(new THREE.ConeGeometry(0.1, 0.32, 20), gloss("#2B2220"), [0, 1.52, surfZ(0, 1.52, head.c, head.r, 0.08)], [Math.PI / 2, 0, 0], g);
  // 흰 눈가 (어두운 머리에서도 눈이 보이게)
  for (const sd of [-1, 1]) { const x = sd * 0.27, y = 1.72; const w = blob(new THREE.MeshPhysicalMaterial({ color: "#FFFFFF", roughness: 0.5 }), [0.15, 0.17, 0.05], [x, y, surfZ(x, y, head.c, head.r, -0.03)], [0, 0, 0], g); w.lookAt(w.position.clone().add(new THREE.Vector3(x * 0.4, 0, 1))); w.scale.set(0.15, 0.17, 0.05); }
  eyes(g, { y: 1.72, dx: 0.27, head: { c: head.c, r: [head.r[0], head.r[1], head.r[2] + 0.02] }, mood: "idle", size: 1.05 });
  blush(g, { y: 1.5, dx: 0.4, head, size: 0.8 });
  for (const s of [-1, 1]) mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.22, 8), flock("#3A3330"), [s * 0.18, 0.12, 0.08], [0, 0, 0], g), blob(flock("#3A3330"), [0.1, 0.04, 0.14], [s * 0.18, 0.02, 0.14], [0, 0, 0], g);
  // 편지
  mesh(new THREE.BoxGeometry(0.42, 0.28, 0.03), flock("#F4EDE0"), [0.3, 1.28, surfZ(0, 1.45, head.c, head.r, 0.25)], [0, -0.2, -0.18], g);
  blob(gloss("#B8423A"), [0.06, 0.06, 0.02], [0.3, 1.28, surfZ(0, 1.45, head.c, head.r, 0.29)], [0, 0, 0], g);
  return g;
}
