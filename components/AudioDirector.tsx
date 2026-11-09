"use client";
// 화면에 맞춰 BGM을 바꾸고, 버튼 터치음과 소리 설정 버튼을 제공합니다.
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Ico } from "./art/Icons";
import { applySettings, loadSettings, playBgm, sfx, trackForPath, unlockAudio, type AudioSettings } from "@/lib/audio";

const TRACK_NAME: Record<string, string> = { title: "달빛 강경", explore: "길 위의 타임워커", village: "장터 풍경", workshop: "옹기 장단", calm: "고서의 밤" };

export default function AudioDirector() {
  const path = usePathname();
  const [unlocked, setUnlocked] = useState(false);
  const [open, setOpen] = useState(false);
  const [s, setS] = useState<AudioSettings>({ bgm: 0.5, sfx: 0.8, muted: false });
  const [reduced, setReduced] = useState(false);
  useEffect(() => { setReduced(document.documentElement.dataset.motion === "reduced"); }, []);
  const toggleMotion = () => {
    const next = !reduced; setReduced(next);
    if (next) document.documentElement.dataset.motion = "reduced"; else delete document.documentElement.dataset.motion;
    try { localStorage.setItem("gtw-motion", next ? "reduced" : "full"); } catch { /* ignore */ }
  };
  const track = trackForPath(path);

  useEffect(() => { setS(loadSettings()); }, []);
  useEffect(() => {
    const go = (e: Event) => {
      unlockAudio();
      setUnlocked(true);
      const el = (e.target as HTMLElement)?.closest?.("button, a, [role=button], summary");
      if (el && !el.hasAttribute("data-nosfx")) sfx.tap();
    };
    window.addEventListener("pointerdown", go, true);
    window.addEventListener("keydown", go, true);
    return () => { window.removeEventListener("pointerdown", go, true); window.removeEventListener("keydown", go, true); };
  }, []);
  useEffect(() => { if (unlocked) playBgm(path.startsWith("/admin") ? null : track); }, [unlocked, track, path]);

  const update = (n: AudioSettings) => { setS(n); applySettings(n); };
  if (path.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-24 right-3 z-[45]">
      <button data-nosfx aria-label="소리 설정" onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full grid place-items-center border-2 border-sumi bg-hanji-light shadow-card" style={{ backgroundImage: "var(--fiber)" }}>
        <Ico name={s.muted ? "bellmute" : "bell"} size={28} />
      </button>
      {!unlocked && !s.muted && <span className="absolute right-14 top-3 whitespace-nowrap text-[11px] font-game font-bold bg-teal text-hanji-light px-2 py-1 animate-pulse pointer-events-none">화면을 누르면 음악이 시작돼요</span>}
      {open && (
        <div className="absolute right-0 bottom-14 w-60 paper p-3 text-sm anim-rise">
          <p className="font-story text-lg text-sumi">♪ {track ? TRACK_NAME[track] : "-"}</p>
          <label className="block mt-2">배경음악 <input type="range" min={0} max={1} step={0.05} value={s.bgm} onChange={(e) => update({ ...s, bgm: Number(e.target.value) })} className="w-full accent-teal" /></label>
          <label className="block mt-1">효과음 <input type="range" min={0} max={1} step={0.05} value={s.sfx} onChange={(e) => { update({ ...s, sfx: Number(e.target.value) }); sfx.coin(); }} className="w-full accent-vermilion" /></label>
          <button className="btn-cream btn-sm w-full mt-2" onClick={() => update({ ...s, muted: !s.muted })}>{s.muted ? "소리 켜기" : "소리 모두 끄기"}</button>
          <button className="btn-cream btn-sm w-full mt-2" aria-pressed={reduced} onClick={toggleMotion}>{reduced ? "움직임 다시 켜기" : "움직임 줄이기 (안개·꽃잎 끄기)"}</button>
          <p className="text-[10px] text-wood mt-2">모든 음악·효과음은 앱이 실시간으로 합성한 자체 제작 사운드예요.</p>
        </div>
      )}
    </div>
  );
}
