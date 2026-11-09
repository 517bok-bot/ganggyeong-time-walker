import "server-only";
import { getServiceSupabase } from "./supabase/admin";
import { applyAction, initialState, normalize, type Action, type Outcome } from "./engine";
import type { GameState, Proof } from "./types";
import { verifyQr } from "./qr";
import { checkGps } from "./geo";
import { getLocationsServer } from "./content-server";

export const demoToolsEnabled = () => process.env.DEMO_TOOLS === "true";

export async function loadSave(userId: string): Promise<{ state: GameState; version: number }> {
  const sb = getServiceSupabase();
  const { data, error } = await sb.from("game_saves").select("state,version").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  if (data) return { state: normalize(data.state), version: data.version };
  const state = initialState();
  const ins = await sb.rpc("init_game_save", { p_user: userId, p_state: state });
  if (ins.error) throw ins.error;
  return { state, version: ins.data as number };
}

function stats(s: GameState) {
  return { nickname: s.player.name, avatar: s.player.avatar, level: s.player.level, exp: s.player.exp, coins: s.player.coins, artisan_exp: s.artisanExp };
}

/** 증명(QR 서명·GPS 거리)을 서버에서 검증 */
async function verifyProof(a: Action, proof: Proof | undefined): Promise<string | null> {
  if (a.type === "openJar" && a.fastForward && !demoToolsEnabled()) return "숙성 빨리감기는 비활성화되어 있어요";
  if (a.type !== "visit") return null;
  if (a.method === "demo") return demoToolsEnabled() ? null : "시뮬레이션은 비활성화되어 있어요";
  if (a.method === "qr") {
    const r = proof?.qr ? verifyQr(proof.qr) : { ok: false as const, reason: "QR 정보가 없어요" };
    if (!r.ok) return r.reason;
    return r.locationId === a.locationId ? null : "다른 장소의 QR이에요";
  }
  if (a.method === "gps") {
    if (!proof?.gps) return "위치 정보가 없어요";
    const loc = (await getLocationsServer()).find((l) => l.id === a.locationId);
    const r = checkGps(loc, proof.gps);
    return r.ok ? null : r.reason;
  }
  return "잘못된 인증 방식";
}

export async function runAction(userId: string, a: Action, proof?: Proof): Promise<Outcome & { status: number }> {
  const proofErr = await verifyProof(a, proof);
  for (let attempt = 0; attempt < 3; attempt++) {
    const { state, version } = await loadSave(userId);
    if (proofErr) return { ok: false, error: proofErr, state, newly: [], messages: [], effects: { collections: [] }, status: 422 };
    const out = applyAction(state, a, { now: Date.now(), allowDemo: demoToolsEnabled() });
    if (!out.ok) return { ...out, status: 422 };
    const sb = getServiceSupabase();
    const { error } = await sb.rpc("commit_game_action", {
      p_user: userId, p_version: version, p_state: out.state, p_effects: out.effects, p_stats: stats(out.state),
    });
    if (!error) return { ...out, status: 200 };
    if (error.message.includes("version_conflict")) continue; // 다른 요청이 먼저 저장됨 → 최신 상태로 다시 계산
    if (error.message.includes("duplicate_visit")) return { ...out, ok: false, error: "이미 방문 인증한 장소예요 (중복 보상 없음)", state, newly: [], messages: [], status: 409 };
    throw error;
  }
  const { state } = await loadSave(userId);
  return { ok: false, error: "잠시 후 다시 시도해 주세요", state, newly: [], messages: [], effects: { collections: [] }, status: 409 };
}

export async function resetSave(userId: string) {
  const sb = getServiceSupabase();
  const state = initialState();
  const { error } = await sb.rpc("reset_game_save", { p_user: userId, p_state: state });
  if (error) throw error;
  return state;
}
