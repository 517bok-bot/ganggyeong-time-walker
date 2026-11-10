// NPC 데이터 — NPC 자체는 모두 '게임 창작 인물'입니다 (실존 인물·실제 상인이 아님).
// 역사/관광 정보 대사는 knowledgeId 로 승인 자료(knowledge.ts)를 참조합니다.

export interface DialogueChoice {
  label: string;
  next?: string;
  /** 대화 노드 대신 승인 자료를 낭독 */
  knowledgeId?: string;
  action?: "give-quest" | "give-items" | "open-jeotgal" | "open-postcard" | "open-post" | "close";
  questId?: string;
  items?: Record<string, number>;
}
export interface DialogueNode {
  /** 한 줄씩 넘겨 가며 보여 줌 (배열이면 여러 장) */
  text: string | string[];
  /** 이 대사가 승인 자료를 바탕으로 할 때: 읽음 기록·출처 표시 */
  knowledgeId?: string;
  choices: DialogueChoice[];
}
export interface Npc {
  id: string;
  name: string;
  title: string;
  /** 초상화 스타일 */
  look: { hat: string; outfit: string; skin: string; prop?: "jar" | "camera" | "letter" | "map" | "bag" };
  locationId?: string;
  greeting: string;
  /** 대화를 시작할 때 이어지는 말 (여러 장) */
  intro?: string[];
  /** 지금 진행 중인 이야기 목표를 알려 주는 NPC */
  hints?: boolean;
  dialogue: Record<string, DialogueNode>;
}

export const NPCS: Npc[] = [
  {
    id: "guide", name: "달래", title: "마을 안내인",
    look: { hat: "#263D40", outfit: "#B58B48", skin: "#F6D9BE", prop: "map" },
    locationId: "welcome-center", hints: true,
    greeting: "어서 와요, 타임워커! 웰컴센터에 온 걸 환영해요.",
    intro: ["안쪽 화면 봤어요? 돛단배 가득한 옛 포구 끝에 검은 고양이 한 마리가 앉아 있죠.", "저는 그 화면을 볼 때마다 생각해요. 저 고양이는 누구를 기다리는 걸까 하고요."],
    dialogue: {
      start: { text: "무엇이 궁금해요? 강경 이야기라면 뭐든지요.", choices: [
        { label: "강경은 원래 어떤 곳이었어요?", next: "port" },
        { label: "이 거리는 어떻게 둘러보면 돼요?", next: "street" },
        { label: "밤에 오면 뭐가 달라요?", next: "night" },
        { label: "고양이 가족 소문을 들었어요", next: "cats" },
        { label: "고마워요, 또 올게요!", action: "close" },
      ]},
      port: { knowledgeId: "kd-port", text: ["강경은요, 금강 물길이 바다와 이어지는 자리였어요.", "철도가 놓이기 전엔 바닷길로 들어온 물자가 여기서 내려지고 다시 실려 나갔대요. 강경장은 평양·대구와 함께 전국 3대 시장으로 꼽혔다고 하고요.", "지금은 조용하지만… 눈을 감으면 배 대는 소리가 들리는 것 같지 않아요?"], choices: [
        { label: "그런데 왜 조용해졌어요?", next: "decline" },
        { label: "다른 이야기도 들려주세요", next: "start" },
      ]},
      decline: { knowledgeId: "kd-decline", text: ["1899년에 군산항이 열리고, 철도가 놓이고, 나중엔 금강하구둑까지 생기면서 배가 점점 덜 오게 됐대요.", "그래서 사람들이 옛 건물을 다시 가꿔 근대거리를 만든 거예요. 그 시절을 잊지 말자고요."], choices: [
        { label: "그 마음, 알 것 같아요", next: "start" },
      ]},
      street: { knowledgeId: "kd-street", text: ["근대풍 건물마다 체험이 숨어 있어요. 음악도서관, 양장점, 딴스홀, 강경씨네마, 사진관…", "체험 공간 여덟 곳에서 스탬프를 모아 강경모던상회에 보여 주면 굿즈도 준대요. 스탬프투어는 매일 오전 10시부터 오후 5시 30분까지예요.", "아, 게임 지도에서 장소를 누르면 QR 인증하는 곳도 알려 드려요!"], choices: [
        { label: "찾아오는 길도 알려 주세요", next: "visit" },
        { label: "다른 이야기도 들려주세요", next: "start" },
      ]},
      visit: { knowledgeId: "kd-visit", text: ["주소는 충청남도 논산시 강경읍 옥녀봉로 30-5예요.", "차는 근처 공용주차장에 두면 되고, 문화관광해설사 해설은 논산시청 관광과(041-746-5405)로 예약할 수 있어요."], choices: [
        { label: "알겠어요!", next: "start" },
      ]},
      night: { knowledgeId: "kd-night", text: ["해가 지면 은방울꽃 모양 영란등이 켜지고, 길바닥에는 고보 조명 꽃무늬가 피어요.", "감성산책로는 옛 포구 장터의 고양이 이야기로 꾸민 밤 산책길이에요. 숨은 고양이를 찾아보세요. 참, 게임 속 강경도 실제 시간에 맞춰 밤이 와요."], choices: [
        { label: "밤에 꼭 와 볼게요", next: "start" },
      ]},
      cats: { knowledgeId: "kd-cats", text: ["후후, 안내도에 붙은 ‘특별수배’ 봤구나.", "강이, 갱이, 콩이. 수상한(?) 고양이 셋이 거리 어딘가에 있대요. 힌트는… ‘강경모던상회에 가면 만날 수 있을지도?’"], choices: [
        { label: "제가 찾아볼게요!", action: "close" },
        { label: "다른 이야기도 들려주세요", next: "start" },
      ]},
    },
  },
  {
    id: "artisan", name: "덕배", title: "젓갈 장인",
    look: { hat: "#E8D8B8", outfit: "#963F38", skin: "#E9C3A0", prop: "jar" },
    locationId: "daecheong",
    greeting: "허허, 항아리 냄새를 맡고 왔구먼.",
    intro: ["요즘 웬 아기 고양이 하나가 내 가게 앞을 떠나질 않아. 콩이라던가… 녀석, 코가 아주 좋아."],
    dialogue: {
      start: { text: "젓갈 얘기 좀 들어볼 텐가? 늙은이 말은 길어도 맛은 있다네.", choices: [
        { label: "강경 젓갈은 왜 유명해요?", next: "jeotgal" },
        { label: "시장은 지금도 열려요?", next: "festival" },
        { label: "젓갈 맛 좀 볼 수 있어요?", next: "learn" },
        { label: "다음에 또 올게요", action: "close" },
      ]},
      jeotgal: { knowledgeId: "kd-jeotgal", text: ["옛날 강경엔 서해에서 소금이며 생선이며 엄청나게 들어왔지.", "다 팔지 못하고 남은 걸 어쩌겠나. 소금에 절여 오래 두는 법이 발달했고, 그게 강경 젓갈이 된 게야.", "젓갈은 결국 시간이 만드는 맛이라네. 자네가 모으는 그 ‘시간 조각’처럼 말이야. 허허."], choices: [
        { label: "시간이 만드는 맛이라니 멋져요", next: "start" },
      ]},
      festival: { knowledgeId: "kd-festival", text: ["가을이면 금강둔치에서 강경젓갈축제가 열리지. 옛 강경장을 재현한 ‘강경포구장터’도 서고.", "날짜는 해마다 바뀌니 논산시 누리집을 꼭 보고 오게."], choices: [
        { label: "가을에 꼭 갈게요", next: "start" },
      ]},
      learn: { text: ["옳지, 맛을 알아야 강경을 아는 법이지. 작은 새우젓 한 종지 줄 테니 들고 가게.", "(덕배가 작은 종지를 건넨다.)"], choices: [
        { label: "새우젓 받기", action: "give-items", items: { shrimp: 2, salt: 3 } },
        { label: "괜찮아요, 마음만 받을게요", next: "start" },
      ]},
    },
  },
  {
    id: "photographer", name: "은솔", title: "옛날 사진사",
    look: { hat: "#39332F", outfit: "#5A4033", skin: "#F3D2B5", prop: "camera" },
    locationId: "photo-studio",
    greeting: "찰칵! 아, 미안해요. 빛이 너무 좋아서 저도 모르게.",
    intro: ["美光寫眞館에 온 걸 환영해요. 여기선 AI 포토로 그 시절 모습의 사진을 남길 수 있어요.", "그런데 사진을 찍다 보면요, 가끔 사진 속에서만 보이는 것들이 있어요. 예를 들면… 오래된 은행 앞을 지나가는 고양이 꼬리 같은 거요."], 
    dialogue: {
      start: { text: "어떤 이야기가 듣고 싶어요? 사진 한 장마다 이야기가 하나씩 있거든요.", choices: [
        { label: "오래된 은행 이야기", next: "bank" },
        { label: "옛 사진에 남은 건물", next: "namildang" },
        { label: "포구는 어떻게 변했어요?", next: "decline" },
        { label: "안녕히 계세요", action: "close" },
      ]},
      bank: { knowledgeId: "kd-bank", text: ["강경구락부 정문 옆 붉은 벽돌 건물 봤어요? 높은 창에 철창이 달린 그 건물.", "1905년 한호농공은행 강경지점으로 세워져서, 나중엔 조선식산은행 강경지점이 됐대요. 지금은 강경역사관이에요.", "그 시절 강경에 은행이 있었다는 건, 그만큼 돈과 물건이 많이 오갔다는 뜻이겠죠."], choices: [
        { label: "다 좋은 기억이었을까요?", next: "shadow" },
        { label: "다른 사진 이야기도요", next: "start" },
      ]},
      shadow: { knowledgeId: "kd-colonial", text: ["…좋은 질문이에요. 사진 속 거리는 늘 반짝여 보이지만, 그때는 일제강점기였어요.", "조선식산은행은 일제가 조선의 경제를 쥐는 데 쓴 은행이었고, 은행의 특혜를 받은 일본 상인들이 상권을 넓혀 가는 동안 우리 상인들은 힘들었대요.", "저는 그래서 웃는 얼굴 사진 옆에, 그 시절의 그늘도 같이 걸어 두고 싶어요. 그래야 진짜 강경이니까요."], choices: [
        { label: "아픈 기억도 기억할게요", next: "start" },
      ]},
      namildang: { knowledgeId: "kd-namildang", text: ["1920년대 강경시장을 찍은 전경 사진이 있어요. 그 사진 속 건물 중에 지금까지 남은 건 딱 하나래요. 1923년에 지은 남일당 한약방이요.", "1925년에 지은 구 강경노동조합 건물은 지금 강경역사문화안내소가 됐고요.", "사진은 사라진 걸 기억하게 해 주고, 남은 건물은 사진이 진짜였다고 말해 줘요. 둘 다 소중해요."], choices: [
        { label: "그래서 사진사가 됐군요", next: "why" },
        { label: "다른 사진 이야기도요", next: "start" },
      ]},
      why: { text: ["맞아요. 사람은 떠나도 빛은 남으니까요.", "타임워커가 시간 조각을 모으는 것도 비슷한 일 아닐까요? 언젠가 다 모으면, 제가 기념사진 한 장 찍어 드릴게요."], choices: [
        { label: "약속이에요!", next: "start" },
      ]},
      decline: { knowledgeId: "kd-decline", text: ["군산항이 열리고, 철도가 놓이고, 금강하구둑이 생기면서 포구는 조용해졌대요.", "그래도 사진 속 포구는 늘 붐벼요. 그게 사진의 마법이죠."], choices: [
        { label: "다른 사진 이야기도요", next: "start" },
      ]},
    },
  },
  {
    id: "merchant", name: "만복", title: "근대거리 상인",
    look: { hat: "#963F38", outfit: "#263D40", skin: "#EFC9A6", prop: "bag" },
    locationId: "modern-store",
    greeting: "어서 오세요~ 강경모던상회입니다! 구경은 공짜예요.",
    intro: ["앞에 세워 둔 클래식카 보셨죠? 포토존이에요. 거기서 사진 찍는 손님이 하루에도 수십 명이라니까요.", "그런데 요즘 밤만 되면 그 차 지붕 위에 고양이 셋이 나란히 앉아 있다는 소문이… 쉿, 비밀이에요."],
    dialogue: {
      start: { text: "무엇을 찾으세요?", choices: [
        { label: "고양이 가족 소문 더 들려주세요", next: "cats" },
        { label: "스탬프투어 굿즈는 어떻게 받아요?", next: "stamp" },
        { label: "구락부가 뭐예요?", next: "club" },
        { label: "멸치 좀 얻을 수 있을까요?", next: "gift" },
        { label: "구경만 할게요", action: "close" },
      ]},
      cats: { knowledgeId: "kd-cats", text: ["안내도에 붙은 ‘특별수배’ 아시죠? 강이·갱이·콩이.", "그 녀석들이 결국엔 다 여기로 온대요. 왜냐고요? 우리 상회가 강경에서 제일 따뜻하거든요. 하하!"], choices: [
        { label: "기다려 볼게요", next: "start" },
      ]},
      stamp: { knowledgeId: "kd-street", text: ["체험 공간 여덟 곳에서 스탬프를 찍어 오시면 돼요. 저한테 보여 주시면 논산여행단 굿즈를 드려요!", "매일 오전 10시부터 오후 5시 30분까지예요. 늦으면 제가 문 닫고 퇴근합니다~"], choices: [
        { label: "얼른 모아 올게요", next: "start" },
      ]},
      club: { knowledgeId: "kd-club", text: ["‘구락부’는 클럽(Club)을 한자로 옮긴 말이래요. 개화기 서양식 사교 공간이죠.", "강경구락부 광장엔 분수랑 파라솔이 있어서 꼭 유럽 작은 광장 같아요. 커피 한잔하기 딱이에요."], choices: [
        { label: "가 봐야겠어요", next: "start" },
      ]},
      gift: { text: "에이, 단골 될 손님한테 그 정도야! 멸치 두 줌 챙겨 드릴게요.", choices: [
        { label: "감사히 받을게요", action: "give-items", items: { anchovy: 2 } },
        { label: "다음에 받을게요", next: "start" },
      ]},
    },
  },
  {
    id: "musician", name: "선율", title: "음악도서관 조율사",
    look: { hat: "#2E3B5A", outfit: "#2E3B5A", skin: "#F3D2B5" },
    locationId: "music-library",
    greeting: "쉿… 들려요? 지금 피아노가 혼자 치고 있어요.",
    intro: ["저는 이 음악도서관 피아노를 돌보는 조율사예요. 그런데 이 피아노는 제가 손대기도 전에 먼저 노래를 해요.", "기억이 하나 돌아올 때마다 한 소절씩요."],
    dialogue: {
      start: { text: "‘귀 기울이면 들려오는 그 시절.’ 음악도서관의 말이에요. 무엇이 궁금해요?", choices: [
        { label: "여기선 뭘 할 수 있어요?", next: "floors" },
        { label: "옛날 강경에도 음악이 있었어요?", next: "old" },
        { label: "피아노가 왜 혼자 쳐요?", next: "magic" },
        { label: "또 들으러 올게요", action: "close" },
      ]},
      floors: { text: ["1층에는 스스로 연주하는 마법 피아노와, 명화 미디어아트가 펼쳐지는 스크린 음악회가 있어요.", "2층에는 나만의 LP 앨범 커버를 만드는 곳, 음악과 테이블, 재즈 연주를 감상하는 JAZZ Q, 가족이 함께 듣는 MUSIC BOX가 있어요.", "건물 모서리엔 ‘江景金融組合’ 글자가 붙어 있죠. 근대거리답게 옛 간판을 살린 거예요."], choices: [
        { label: "꼭 들어가 볼게요", next: "start" },
      ]},
      old: { knowledgeId: "kd-okneobong", text: ["1920년대 강경엔 벌써 전기와 수도가 들어왔고, 극장도 있었대요. 포구 덕분에 새로운 것이 빨리 들어왔던 거죠.", "다만 그때는 일제강점기라, 그 화려함을 모두가 누린 건 아니었대요. 밝은 소리 뒤에 낮은 음도 함께 있었던 거죠.", "옥녀봉에 오르면 금강이랑 강경 시내가 한눈에 보여요. 거기서 듣는 저녁 바람 소리도 음악이에요."], choices: [
        { label: "옥녀봉도 가 볼게요", next: "start" },
      ]},
      magic: { text: ["진짜 이유는 저도 몰라요. 다만 시간의 종에 금이 간 뒤로 피아노가 아주 작게만 울려요.", "타임워커가 시간 조각을 모아 오면… 언젠가 이 피아노가 강경 전체에 들리도록 연주할 거라 믿어요."], choices: [
        { label: "조각을 모아 올게요", next: "start" },
      ]},
    },
  },
  {
    id: "postman", name: "포포", title: "까치 우체부",
    look: { hat: "#74302A", outfit: "#B58B48", skin: "#F6D9BE", prop: "letter" },
    locationId: "ganggyeong-gwan", hints: true,
    greeting: "깍! 타임워커! 마침 잘 왔어요.",
    intro: ["강경관 여행자 라운지는 제 쉼터예요. 손그림 영화 간판 아래서 편지 분류하기 딱 좋거든요."],
    dialogue: {
      start: { text: "무엇을 도와줄까요? 편지 말고도 아는 거 많아요, 깍!", choices: [
        { label: "지금 뭘 해야 할지 모르겠어요", next: "help" },
        { label: "시간의 종 이야기를 다시 해 줘요", next: "bell" },
        { label: "축제 소식 있어요?", next: "festival" },
        { label: "고마워, 포포!", action: "close" },
      ]},
      help: { text: ["걱정 마요. 지도 위에 반짝이는 시간 조각을 톡 누르면 붙잡을 수 있어요. 하루에 여섯 개씩 새로 떨어져요.", "그리고 실제 거리에선 장소마다 붙은 QR을 찍으면 도장을 받고 숨은 친구를 만나요. 이야기 띠를 누르면 지금 목표도 볼 수 있어요!"], choices: [
        { label: "알겠어요!", next: "start" },
      ]},
      bell: { text: ["기억의 등대 꼭대기에 ‘시간의 종’이 있어요. 매일 저녁 울려서 강경의 기억을 지켜 줬죠.", "그런데 종에 금이 가면서 망각의 안개가 피어올랐어요. 흩어진 조각을 모아야 종이 다시 울려요. 그게 타임워커의 일이에요, 깍!"], choices: [
        { label: "꼭 다시 울리게 할게요", next: "start" },
      ]},
      festival: { knowledgeId: "kd-festival", text: ["가을엔 금강둔치에서 강경젓갈축제가 열려요! 옛 장터를 재현한 강경포구장터도 서고요.", "해마다 날짜가 바뀌니 논산시 누리집을 확인해요. 편지로 알려 줄 수도 있는데… 우표가 없어요, 깍."], choices: [
        { label: "축제 날 만나자!", next: "start" },
      ]},
    },
  },
];

export const NPC = Object.fromEntries(NPCS.map((n) => [n.id, n])) as Record<string, Npc>;
