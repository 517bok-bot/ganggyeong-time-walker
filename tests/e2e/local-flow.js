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
  await p.getByRole('button', { name: '시간 여행 시작' }).click(); await p.waitForTimeout(800);
  await p.getByRole('button', { name: /건너뛰기/ }).click(); await p.waitForTimeout(600);
  await p.getByText('이 신수와 함께하기').click();
  await p.getByLabel('이름').fill('테스터');
  await p.getByText('계약의 인장을 찍고 길을 나서다').click(); await p.waitForTimeout(2500);
  // 이야기 자동 장면(서장 마무리 → 1장 도입)은 건너뛰기
  for (let k = 0; k < 3; k++) { const sk = p.getByRole('button', { name: /건너뛰기/ }); if (await sk.count()) { await sk.click(); await p.waitForTimeout(1500); } }
  console.log('story', JSON.parse(await p.evaluate(() => localStorage.getItem('gtw-save-v1'))).story);
  await p.screenshot({ path: 'explore.png', fullPage: true });
  // QR flow via URL
  await p.goto(`${base}/explore?qr=${sign('gwangshin')}`); await p.waitForTimeout(2000);
  await p.screenshot({ path: 'collect.png' });
  await p.getByText('인연을 기록하다').click();
  await p.waitForTimeout(500);
  await p.screenshot({ path: 'loc.png' });
  // 시간 조각 하나 붙잡기
  for (let k = 0; k < 3; k++) { const sk = p.getByRole('button', { name: /건너뛰기/ }); if (await sk.count()) { await sk.click(); await p.waitForTimeout(1200); } }
  await p.keyboard.press('Escape');
  await p.evaluate(() => document.querySelector('[role=dialog]')?.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  await p.waitForTimeout(400);
  await p.evaluate(() => document.querySelector('button[aria-label$="붙잡기"]').click()); await p.waitForTimeout(2500);
  await p.mouse.click(195, 420); await p.waitForTimeout(300); await p.mouse.click(195, 420); await p.waitForTimeout(1500);
  console.log('spark', JSON.parse(await p.evaluate(() => localStorage.getItem('gtw-save-v1'))).sparkTotal);
  // duplicate
  await p.goto(`${base}/explore?qr=${sign('gwangshin')}`); await p.waitForTimeout(1500);
  const dup = await p.getByText('이미 방문 인증한 장소예요', {exact:false}).count();
  console.log('dup toast', dup);
  // forged
  const r = await p.evaluate(async () => (await fetch('/api/qr/verify',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({payload:'GTW1.kongi.aaaaaaaaaaaaaaaa'})})).json());
  console.log('forged', JSON.stringify(r));
  // 이야기 화면
  await p.goto(`${base}/story`); await p.waitForTimeout(800);
  await p.screenshot({ path: 'story.png', fullPage: true });
  // 없앤 화면은 첫 장으로
  await p.goto(`${base}/village`); await p.waitForTimeout(500);
  console.log('village redirect', new URL(p.url()).pathname);
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
