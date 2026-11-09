// 화면 연출 이벤트 버스: 어디서든 fx.reward(...)를 부르면 FxLayer가 파티클·숫자·진동을 그립니다.
// 연출은 순전히 보여주기용이며 게임 수치와는 무관합니다.

export type FxEvent =
  | { type: "reward"; x: number; y: number; coins: number; exp: number; icon?: string }
  | { type: "burst"; x: number; y: number; color?: string; count?: number; big?: boolean }
  | { type: "text"; x: number; y: number; text: string; color?: string }
  | { type: "levelUp"; level: number };

type Fn = (e: FxEvent) => void;
const subs = new Set<Fn>();
let last = { x: 0, y: 0, at: 0 };

if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", (e) => { last = { x: e.clientX, y: e.clientY, at: Date.now() }; }, true);
}

/** 최근에 누른 지점 (2.5초 이내), 없으면 화면 가운데 */
export function lastPoint() {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  if (Date.now() - last.at < 2500 && last.x) return { x: last.x, y: last.y };
  return { x: window.innerWidth / 2, y: window.innerHeight * 0.45 };
}

export function reducedMotion() {
  if (typeof window === "undefined") return true;
  return document.documentElement.dataset.motion === "reduced" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function haptic(pattern: number | number[] = 12) {
  try { if (!reducedMotion()) navigator.vibrate?.(pattern); } catch { /* 지원 안 함 */ }
}

export const fx = {
  on(fn: Fn) { subs.add(fn); return () => { subs.delete(fn); }; },
  emit(e: FxEvent) { subs.forEach((f) => f(e)); },
  reward(coins: number, exp: number, at = lastPoint()) { fx.emit({ type: "reward", x: at.x, y: at.y, coins, exp }); },
  burst(x: number, y: number, opts: { color?: string; count?: number; big?: boolean } = {}) { fx.emit({ type: "burst", x, y, ...opts }); },
  text(text: string, at = lastPoint(), color?: string) { fx.emit({ type: "text", x: at.x, y: at.y, text, color }); },
  levelUp(level: number) { fx.emit({ type: "levelUp", level }); },
};
