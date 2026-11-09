const { chromium, devices } = require('playwright');
const crypto = require('crypto');
const sign = (id) => `GTW1.${id}.` + crypto.createHmac('sha256','test-secret').update(`loc:${id}`).digest('hex').slice(0,16);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 13'], deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  const base = 'http://localhost:3000';
  await p.goto(base); await p.waitForTimeout(1500);
  await p.screenshot({ path: 'home.png', fullPage: true });
  // prologue
  await p.getByRole('button', { name: '시간 여행 시작' }).click();
  for (let i=0;i<3;i++) await p.getByText('다음 장으로').click(); await p.getByText('이 문으로 입학하기').click();
  await p.getByLabel('이름').fill('테스터');
  await p.getByText('입학 인장을 찍고 길을 나서다').click(); await p.waitForTimeout(1500);
  await p.screenshot({ path: 'explore.png', fullPage: true });
  // QR flow via URL
  await p.goto(`${base}/explore?qr=${sign('gwangshin')}`); await p.waitForTimeout(2000);
  await p.screenshot({ path: 'collect.png' });
  await p.getByText('인연을 기록하다').click();
  await p.waitForTimeout(500);
  await p.screenshot({ path: 'loc.png' });
  // duplicate
  await p.goto(`${base}/explore?qr=${sign('gwangshin')}`); await p.waitForTimeout(1500);
  const dup = await p.getByText('이미 방문 인증한 장소예요', {exact:false}).count();
  console.log('dup toast', dup);
  // forged
  const r = await p.evaluate(async () => (await fetch('/api/qr/verify',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({payload:'GTW1.kongi.aaaaaaaaaaaaaaaa'})})).json());
  console.log('forged', JSON.stringify(r));
  // village
  await p.goto(`${base}/village`); await p.waitForTimeout(1200);
  await p.screenshot({ path: 'village.png', fullPage: true });
  // walk right a bit & explore welcome center
  await p.getByText('살펴보기').click(); await p.waitForTimeout(400);
  await p.screenshot({ path: 'village-place.png' });
  await p.getByText('닫기').last().click();
  // find berijyu: walk to x ~228
  const right = p.getByLabel('오른쪽으로');
  await right.dispatchEvent('pointerdown'); await p.waitForTimeout(450); await right.dispatchEvent('pointerup');
  await p.getByLabel('수상한 기척').first().click(); await p.waitForTimeout(800);
  console.log('collect modal', await p.getByRole('dialog', { name: '캐릭터 발견' }).count());
  await p.getByText('인연을 기록하다').click();
  // npc talk
  await p.getByLabel('달래와 대화').click({force:true}); await p.waitForTimeout(300);
  await p.locator('[role=dialog] button').first().click(); // skip typewriter
  await p.getByText('▶ 계속').click();
  await p.locator('[role=dialog] button').first().click();
  await p.getByText('강경은 어떤 곳이었어요?').click(); await p.waitForTimeout(300);
  await p.locator('[role=dialog] button').first().click(); await p.waitForTimeout(200);
  await p.screenshot({ path: 'npc.png' });
  // jeotgal
  await p.goto(`${base}/jeotgal`); await p.waitForTimeout(800);
  await p.getByText('첫 젓갈 담그기').click();
  await p.getByText('새우젓', {exact:false}).first().click();
  await p.getByText('다음: 항아리에 담기 →').click();
  for (const name of ['새우','소금','웃소금']) { await p.locator('button', { hasText: name }).first().click(); await p.waitForTimeout(300); }
  await p.screenshot({ path: 'jeotgal-mix.png', fullPage: true });
  await p.getByText('다음: 뚜껑 덮기 →').click();
  await p.getByText('숙성 시작', { exact: true }).click(); await p.waitForTimeout(600);
  await p.screenshot({ path: 'jeotgal-aging.png', fullPage: true });
  await p.getByText('숙성 빨리감기 (시연용)').click(); await p.waitForTimeout(800);
  await p.screenshot({ path: 'jeotgal-result.png' });
  await p.getByText('젓갈 도감에 저장!').click();
  await p.goto(`${base}/quests`); await p.waitForTimeout(800);
  await p.screenshot({ path: 'quests.png', fullPage: true });
  await p.goto(`${base}/dex`); await p.waitForTimeout(800);
  await p.screenshot({ path: 'dex.png', fullPage: true });
  await p.goto(`${base}/me`); await p.waitForTimeout(800);
  await p.screenshot({ path: 'me.png', fullPage: true });
  // desktop
  const d = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await d.goto(base); await d.waitForTimeout(1200); await d.screenshot({ path: 'home-desktop.png' });
  console.log('errors', JSON.stringify(errs.filter(e=>!/fonts\.g|tile\.openstreetmap|ERR_/.test(e)), null, 1));
  await b.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
