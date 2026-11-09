import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GameProvider } from "@/lib/game";
import BottomNav from "@/components/BottomNav";
import Overlays from "@/components/Overlays";
import AudioDirector from "@/components/AudioDirector";
import FxLayer from "@/components/FxLayer";
import ArtDefs from "@/components/art/ArtDefs";
import { ContentProvider } from "@/lib/content";
import { getOverrides } from "@/lib/content-server";
import { supabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "강경 타임워커 · Ganggyeong Time Walker",
  description: "시간을 걷는 곳, 강경으로! 강경근대거리를 배경으로 한 캐릭터 수집형 위치 기반 관광 RPG",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "강경 타임워커", statusBarStyle: "black-translucent" },
};
export const viewport: Viewport = { themeColor: "#F4EEDF", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const overrides = await getOverrides();
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Song+Myung&family=Nanum+Pen+Script&family=Nanum+Myeongjo:wght@400;700;800&family=Gowun+Batang:wght@400;700&family=Gowun+Dodum&display=swap" rel="stylesheet" />
        {/* 움직임 줄이기 설정을 첫 화면 전에 적용 */}
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem("gtw-motion")==="reduced")document.documentElement.dataset.motion="reduced"}catch(e){}` }} />
      </head>
      <body>
        <ArtDefs />
        <ContentProvider overrides={overrides}>
          <GameProvider authConfigured={supabaseConfigured()} demoToolsRemote={process.env.DEMO_TOOLS === "true"}>
            <div className="mx-auto max-w-5xl pb-36">{children}</div>
            <BottomNav />
            <Overlays />
            <AudioDirector />
            <FxLayer />
          </GameProvider>
        </ContentProvider>
      </body>
    </html>
  );
}
