// 두루마리 패널: 위아래 나무 축 + 한지
import React from "react";

/** 두루마리 (위아래 축 + 한지) */
export function Scroll({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="relative">
      <div className="h-4 mx-[-8px] rounded-full bg-teal border border-sumi-dark relative z-10" style={{ backgroundImage: "var(--woodgrain)" }}>
        <span className="absolute -left-1 -top-1 w-3 h-6 rounded-sm bg-antique border border-sumi-dark" /><span className="absolute -right-1 -top-1 w-3 h-6 rounded-sm bg-antique border border-sumi-dark" />
      </div>
      <div className="paper !rounded-none px-5 py-4 mx-1">
        <h2 className="font-story text-2xl text-sumi text-center">{title}</h2>
        <div className="ink-rule my-2" />
        {children}
      </div>
      <div className="h-4 mx-[-8px] rounded-full bg-teal border border-sumi-dark relative z-10" style={{ backgroundImage: "var(--woodgrain)" }} />
    </section>
  );
}

