import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

/** 공동 항아리 현재 진행도 (공개 읽기) */
export async function GET() {
  if (!supabaseConfigured()) return NextResponse.json({ live: false });
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { data } = await sb.from("community_jars").select("id,title,goal,progress,status").order("starts_at", { ascending: false }).limit(1).maybeSingle();
  return NextResponse.json(data ? { live: true, ...data } : { live: false });
}
