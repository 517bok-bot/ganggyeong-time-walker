"use client";
// 실제 지도 (Leaflet + OpenStreetMap)
// 개별 장소 좌표는 공식 검증 전이라 표시하지 않고, 강경읍 일대 '근사 중심'만 표시합니다.
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DISTRICT_INFO, LOCATIONS } from "@/lib/data/locations";

export default function RealMap({ me }: { me: { lat: number; lng: number; accuracy: number } | null }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const meLayer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!el.current || map.current) return;
    const c = DISTRICT_INFO.approxCenter;
    const m = L.map(el.current, { zoomControl: true, attributionControl: true }).setView([c.lat, c.lng], 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19, attribution: "&copy; OpenStreetMap contributors",
    }).addTo(m);
    L.circle([c.lat, c.lng], { radius: 250, color: "#963F38", weight: 2, dashArray: "6 6", fillColor: "#B58B48", fillOpacity: 0.15 })
      .addTo(m).bindPopup("강경근대거리 일대 (근사 위치 · 공식 좌표 검증 필요)");
    // 좌표가 등록된 장소만 마커 표시
    LOCATIONS.filter((l) => l.gps).forEach((l) => {
      L.circleMarker([l.gps!.lat, l.gps!.lng], { radius: 8, color: "#39332F", fillColor: "#263D40", fillOpacity: 1 }).addTo(m).bindPopup(`${l.no}. ${l.name}`);
    });
    meLayer.current = L.layerGroup().addTo(m);
    map.current = m;
    return () => { m.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    if (!map.current || !meLayer.current) return;
    meLayer.current.clearLayers();
    if (me) {
      L.circle([me.lat, me.lng], { radius: me.accuracy, color: "#263D40", weight: 1, fillOpacity: 0.1 }).addTo(meLayer.current);
      L.circleMarker([me.lat, me.lng], { radius: 9, color: "#fff", weight: 3, fillColor: "#263D40", fillOpacity: 1 }).addTo(meLayer.current).bindPopup("현재 위치");
      map.current.setView([me.lat, me.lng], 16);
    }
  }, [me]);

  return <div ref={el} className="w-full h-[60vh] min-h-[360px] rounded-xl border-2 border-wood overflow-hidden z-0" />;
}
