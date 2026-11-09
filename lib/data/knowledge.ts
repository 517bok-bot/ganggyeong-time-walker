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
  {
    id: "kd-street",
    title: "강경근대거리",
    body: "논산시는 강경국가유산야행 개막(8월 28일)에 맞춰 근대풍 건물에 미디어아트·고보라이트·AI 포토 체험을 더한 강경근대거리를 전면 개관했어요. 웰컴센터·음악도서관·양장점·딴스홀·강경씨네마·사진관·강경모던상회 등을 돌아보며, 체험 공간 8곳의 스탬프를 모아 강경모던상회에 보여 주면 굿즈를 받을 수 있어요.",
    caveat: "운영 시간(전시·체험 10:00~18:00, 스탬프투어 10:00~17:30)은 바뀔 수 있어요.",
    sources: [
      { label: "주간한국 기사", url: "https://weekly.hankooki.com/news/articleView.html?idxno=7180474" },
      { label: "충청매일 기사", url: "https://www.ccdn.co.kr/news/articleView.html?idxno=1104640" },
    ],
    status: "review",
  },
  {
    id: "kd-night",
    title: "강경의 밤 풍경",
    body: "해가 지면 근대거리에는 영란등과 미디어퍼사드, 고보라이트가 켜져요. 감성산책로는 옛 강경 포구 장터의 고양이 이야기를 주제로 꾸민 야간 산책로로, 곳곳에 숨은 고양이 가족을 찾아보는 재미가 있어요.",
    sources: [
      { label: "굿모닝충청 기사", url: "https://www.goodmorningcc.com/news/articleView.html?idxno=453933" },
      { label: "대한민국 구석구석 · 강경 국가유산야행", url: "https://korean.visitkorea.or.kr/kfes/detail/fstvlDetail.do?fstvlCntntsId=16d5225b-90b2-43f1-9c6a-3bedb4279a2d" },
    ],
    status: "review",
  },
  {
    id: "kd-bank",
    title: "옛 한일은행 강경지점",
    body: "강경구락부 정문 옆 붉은 벽돌 건물은 국가등록문화유산인 옛 한일은행 강경지점이에요. 1905년 한호농공은행 강경지점으로 세워졌고, 이후 조선식산은행 강경지점으로 쓰였어요. 지금은 강경역사관으로 쓰이고 있어요.",
    caveat: "건립 연도는 자료에 따라 1905년(개업)·1913년(건물)으로 다르게 적혀 있어요.",
    sources: [
      { label: "머니투데이 기사", url: "https://www.mt.co.kr/article/2010012914048110093" },
      { label: "논산시청 강경읍 국가유산", url: "https://www.nonsan.go.kr/kor/html/sub06/06020202.html?mode=V&mng_no=157&GotoPage=1" },
    ],
    status: "review",
  },
  {
    id: "kd-namildang",
    title: "남일당 한약방과 옛 노동조합",
    body: "1923년에 지은 2층 남일당 한약방은 한식 구조에 일본식 분위기가 섞인 건물로, 1920년대 강경시장 전경 사진에 남아 있는 유일한 건물이라고 해요. 1925년에 지은 한식 목조 2층 구 강경노동조합 건물은 지금 강경역사문화안내소로 쓰여요.",
    sources: [
      { label: "비즈한국 기사", url: "https://bizhankook.com/articles/11732.html" },
      { label: "머니투데이 기사", url: "https://www.mt.co.kr/article/2010012914048110093" },
    ],
    status: "review",
  },
  {
    id: "kd-okneobong",
    title: "옥녀봉과 강경의 근대",
    body: "포구의 역사를 그린 벽화 골목을 오르면 해발 44m의 옥녀봉이 나와요. 금강과 강경 시내가 한눈에 보이는 곳이에요. 1920년대 강경에는 전기·수도 시설과 극장이 있었고, 1937년에 지은 강경중앙초등학교 강당은 등록문화재로 남아 있어요.",
    caveat: "옥녀봉 일대 유적의 세부 내용은 현장 안내판을 함께 확인해 주세요.",
    sources: [
      { label: "이데일리 브라보 기사", url: "https://bravo.etoday.co.kr/view/atc_view/13192" },
      { label: "머니투데이 기사", url: "https://www.mt.co.kr/article/2010012914048110093" },
    ],
    status: "review",
  },
  {
    id: "kd-club",
    title: "강경구락부(江景俱樂部)",
    body: "‘구락부’는 클럽(Club)을 한자로 옮긴 말로, 개화기 서양식 사교 공간을 뜻해요. 강경구락부 광장에는 원형 분수와 파라솔 테이블이 있고, 붉은 벽돌과 파스텔 톤 건물이 어우러져 있어요.",
    sources: [{ label: "현장 안내도·블로그 탐방기", url: "" }],
    status: "review",
  },
];

export const KD = Object.fromEntries(KNOWLEDGE.map((k) => [k.id, k])) as Record<string, KnowledgeDoc>;
