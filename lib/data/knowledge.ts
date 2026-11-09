// NPC가 말할 수 있는 '승인 자료' (knowledge_documents)
// ─────────────────────────────────────────────────────────────
// NPC의 역사·관광 대사는 반드시 이 목록에서만 가져옵니다. 목록에 없는 역사적 사실은 만들어내지 않습니다.
// status: "review" = 공개 자료로 1차 확인했으나 지자체/해설사 최종 검토 전.
// 관리자 페이지(2단계)에서 수정·승인하도록 설계했습니다.

export interface KnowledgeDoc {
  id: string;
  title: string;
  body: string;
  caveat?: string;
  sources: { label: string; url: string }[];
  status: "review" | "approved";
}

export const KNOWLEDGE: KnowledgeDoc[] = [
  {
    id: "kd-port",
    title: "금강 하류의 포구, 강경",
    body: "철도가 놓이기 전, 강경포구는 금강 하류에서 바닷길로 들어온 물자가 내려지고 다시 실려 나가던 대표적인 포구였어요. 강경장은 조선 후기 평양·대구와 함께 전국 3대 시장으로 꼽혔다고 전해져요.",
    caveat: "3대 시장의 순서·표현은 자료마다 조금씩 달라요.",
    sources: [
      { label: "비즈한국 기사", url: "https://bizhankook.com/articles/11732.html" },
      { label: "문화체육관광부 축제 정보", url: "https://www.mcst.go.kr/site/s_culture/festival/festivalView.jsp?pSeq=12853" },
    ],
    status: "review",
  },
  {
    id: "kd-jeotgal",
    title: "강경 젓갈이 발달한 이유",
    body: "서해에서 들어온 소금과 수산물이 많았던 강경에서는, 팔고 남은 수산물을 오래 보관하기 위한 염장법과 수산가공법이 발달했어요. 이것이 강경 젓갈의 바탕이 되었다고 해요.",
    sources: [{ label: "비즈한국 기사", url: "https://bizhankook.com/articles/11732.html" }],
    status: "review",
  },
  {
    id: "kd-decline",
    title: "포구의 변화",
    body: "강경포구는 이후 교통의 변화와 함께 예전의 번성함을 잃었어요. 군산항 개항(1899), 철도의 발달, 금강하구둑 건설 등이 영향을 준 것으로 이야기돼요.",
    caveat: "쇠퇴 원인에 대한 설명은 자료마다 강조점이 달라요.",
    sources: [{ label: "비즈한국 기사", url: "https://bizhankook.com/articles/11732.html" }],
    status: "review",
  },
  {
    id: "kd-festival",
    title: "강경젓갈축제",
    body: "강경젓갈축제는 논산시가 주최하는 축제예요. 2026년에는 10월 15일부터 18일까지 강경 금강둔치 일원에서 열렸고, 옛 강경장을 재현한 '강경포구장터'가 운영됐어요.",
    caveat: "매년 일정이 바뀌니 논산시 공식 누리집에서 확인하세요.",
    sources: [
      { label: "문화체육관광부 축제 정보", url: "https://www.mcst.go.kr/site/s_culture/festival/festivalView.jsp?pSeq=12853" },
      { label: "더팩트 기사", url: "https://news.tf.co.kr/read/ogmeta/2376924.htm" },
    ],
    status: "review",
  },
  {
    id: "kd-visit",
    title: "강경근대거리 방문 안내",
    body: "강경근대거리의 주소는 '충청남도 논산시 강경읍 옥녀봉로 30-5'예요. (안내도에는 지번 '중앙리 40-2'로 적혀 있어요.) 주차는 인근 공용주차장을 이용하고, 문화관광해설사는 041-746-5405(논산시청 관광과)로 예약할 수 있다고 안내돼 있어요.",
    sources: [{ label: "강경근대거리 안내도 (현장 자료)", url: "" }],
    status: "review",
  },
  {
    id: "kd-cats",
    title: "특별수배! 고양이 가족",
    body: "안내도에는 강경근대거리에서 목격된 수상한(?) 고양이 3마리, 강이(아빠)·갱이(엄마)·콩이(아기)를 찾는다는 '특별수배'가 붙어 있어요. 힌트는 '강경모던상회에 가면 고양이 가족을 만날 수 있을지도…?'",
    sources: [{ label: "강경근대거리 안내도 (현장 자료)", url: "" }],
    status: "review",
  },
];

export const KD = Object.fromEntries(KNOWLEDGE.map((k) => [k.id, k])) as Record<string, KnowledgeDoc>;
