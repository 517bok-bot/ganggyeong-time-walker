// 관리자가 DB에 입력한 값(좌표·사진·설명·역사·캐릭터 설정·승인 자료)을 기본 데이터 위에 덮어씁니다.
// 게임 규칙(보상·발견 장소)은 코드의 기본 데이터를 그대로 사용합니다.
import { LOCATIONS, type GameLocation } from "./data/locations";
import { CHARACTERS, type GameCharacter } from "./data/characters";
import { KNOWLEDGE, type KnowledgeDoc } from "./data/knowledge";

export interface LocationRow { id: string; lat: number | null; lng: number | null; radius_m: number | null; photo_url: string | null; description: string | null; history: string | null; history_status: string | null }
export interface CharacterRow { id: string; story: string | null; quote: string | null; likes: string | null; personality: string[] | null; image_url: string | null; license_status: string | null }
export interface KnowledgeRow { id: string; title: string; body: string; caveat: string | null; sources: { label: string; url: string }[] | null; status: string }
export interface ContentOverrides { locations: LocationRow[]; characters: CharacterRow[]; knowledge: KnowledgeRow[] }

export const EMPTY_OVERRIDES: ContentOverrides = { locations: [], characters: [], knowledge: [] };

export function mergeLocations(o: ContentOverrides): GameLocation[] {
  const by = new Map(o.locations.map((r) => [r.id, r]));
  return LOCATIONS.map((l) => {
    const r = by.get(l.id);
    if (!r) return l;
    return {
      ...l,
      gps: r.lat != null && r.lng != null ? { lat: r.lat, lng: r.lng, radiusM: r.radius_m ?? 40 } : l.gps,
      photoUrl: r.photo_url ?? l.photoUrl,
      description: r.description ?? l.description,
      history: r.history_status === "approved" ? r.history : null, // 승인된 역사만 공개
      historyStatus: r.history_status === "approved" ? "approved" : "pending",
    };
  });
}

export function mergeCharacters(o: ContentOverrides): GameCharacter[] {
  const by = new Map(o.characters.map((r) => [r.id, r]));
  return CHARACTERS.map((c) => {
    const r = by.get(c.id);
    if (!r) return c;
    return {
      ...c,
      story: r.story || c.story,
      quote: r.quote || c.quote,
      likes: r.likes || c.likes,
      personality: r.personality?.length ? r.personality : c.personality,
      imageUrl: r.image_url,
      licenseStatus: r.license_status === "approved" ? "approved" : "permission_required",
    };
  });
}

export function mergeKnowledge(o: ContentOverrides): KnowledgeDoc[] {
  const by = new Map(o.knowledge.map((r) => [r.id, r]));
  const merged: KnowledgeDoc[] = KNOWLEDGE.map((k) => {
    const r = by.get(k.id);
    return r ? { id: k.id, title: r.title, body: r.body, caveat: r.caveat ?? undefined, sources: r.sources ?? k.sources, status: r.status === "approved" ? "approved" : "review" } : k;
  });
  // 관리자가 새로 추가한 자료 (draft 는 숨김)
  for (const r of o.knowledge) if (!KNOWLEDGE.some((k) => k.id === r.id) && r.status !== "draft")
    merged.push({ id: r.id, title: r.title, body: r.body, caveat: r.caveat ?? undefined, sources: r.sources ?? [], status: r.status === "approved" ? "approved" : "review" });
  return merged;
}
