// Supabase 설정 여부. 두 공개 값이 모두 있어야 서버 모드(로그인·DB 저장)가 켜집니다.
// 미설정 시 앱은 1단계와 같은 '로컬 모드'(브라우저 저장)로 동작합니다.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const supabaseConfigured = () => !!(SUPABASE_URL && SUPABASE_ANON_KEY);
