import type { Config } from "tailwindcss";

// 강경 타임워커 디자인 토큰 3.0 — Oriental Dreamlike Woodblock
// ─────────────────────────────────────────────────────────────
// 새 이름(hanji·teal·vermilion·antique·dream·sumi·jade)이 기준입니다.
// 2.x 코드의 옛 이름(cream·sage·brick·wood·gold)은 같은 '역할'의 새 색으로 연결해 둔 별칭입니다.
//   cream → 한지(바탕) · sage → 깊은 청록(구조·주요 버튼) · brick → 주홍(인장·CTA)
//   wood → 먹(글자·선) · gold → 앤티크 골드(보상)
const hanji = { DEFAULT: "#E8D8B8", light: "#F2E7D0", dark: "#D6C29C", deep: "#C4AC80" };
const teal = { DEFAULT: "#263D40", light: "#3B5659", dark: "#1A2B2D" };
const vermilion = { DEFAULT: "#963F38", light: "#B2564C", dark: "#74302A" };
const antique = { DEFAULT: "#B58B48", light: "#D1AE70", dark: "#8A6731" };
const sumi = { DEFAULT: "#39332F", light: "#5C534C", dark: "#26211E" };
const jade = { DEFAULT: "#748A70", light: "#93A78F", dark: "#566A53" };
const dream = { DEFAULT: "#65516F", light: "#83708D", dark: "#4A3A52" };

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        hanji, teal, vermilion, antique, sumi, jade, dream,
        // 2.x 별칭
        cream: hanji, sage: teal, brick: vermilion, wood: sumi, gold: antique,
        ink: "#39332F",
      },
      fontFamily: {
        story: ["'Song Myung'", "'Nanum Myeongjo'", "serif"],       // 제목: 고전 명조
        game: ["'Nanum Myeongjo'", "'Gowun Batang'", "serif"],      // UI 표찰·라벨: 굵은 명조
        body: ["'Gowun Dodum'", "'Noto Sans KR'", "sans-serif"],     // 본문: 현대 한글
      },
      boxShadow: {
        card: "0 1px 0 rgba(57,51,47,.35), 0 10px 24px -12px rgba(38,61,64,.45)",
        btn: "0 3px 0 rgba(38,33,30,.55)",
        "btn-press": "0 1px 0 rgba(38,33,30,.55)",
        seal: "0 0 0 2px #E8D8B8 inset, 0 4px 0 #74302A, 0 10px 18px -8px rgba(116,48,42,.6)",
      },
      borderRadius: { xl: "6px", "2xl": "8px", "3xl": "10px" },
    },
  },
  plugins: [],
} satisfies Config;
