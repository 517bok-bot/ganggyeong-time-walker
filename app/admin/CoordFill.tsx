"use client";
// 현장에서 관리자가 현재 위치로 좌표를 채우는 버튼
export default function CoordFill({ formId }: { formId: string }) {
  return (
    <button type="button" className="btn-cream btn-sm" onClick={() => {
      navigator.geolocation?.getCurrentPosition((p) => {
        const f = document.getElementById(formId) as HTMLFormElement | null;
        if (!f) return;
        (f.elements.namedItem("lat") as HTMLInputElement).value = p.coords.latitude.toFixed(6);
        (f.elements.namedItem("lng") as HTMLInputElement).value = p.coords.longitude.toFixed(6);
        alert(`현재 위치를 채웠어요 (정확도 ±${Math.round(p.coords.accuracy)}m). 저장을 눌러야 반영돼요.`);
      }, () => alert("위치를 가져오지 못했어요"), { enableHighAccuracy: true });
    }}>📡 현재 위치로 채우기</button>
  );
}
