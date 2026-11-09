import "server-only";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from "./supabase/config";
import { EMPTY_OVERRIDES, mergeLocations, type ContentOverrides } from "./content-merge";

/** 공개 콘텐츠 테이블을 anon 키로 읽습니다 (RLS: 누구나 읽기). 60초 캐시, 관리자 수정 시 'content' 태그 무효화 */
export const getOverrides = unstable_cache(async (): Promise<ContentOverrides> => {
  if (!supabaseConfigured()) return EMPTY_OVERRIDES;
  try {
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const [l, c, k] = await Promise.all([
      sb.from("locations").select("id,lat,lng,radius_m,photo_url,description,history,history_status"),
      sb.from("characters").select("id,story,quote,likes,personality,image_url,license_status"),
      sb.from("knowledge_documents").select("id,title,body,caveat,sources,status"),
    ]);
    return { locations: l.data ?? [], characters: c.data ?? [], knowledge: k.data ?? [] };
  } catch {
    return EMPTY_OVERRIDES;
  }
}, ["content-overrides"], { revalidate: 60, tags: ["content"] });

export async function getLocationsServer() {
  return mergeLocations(await getOverrides());
}
