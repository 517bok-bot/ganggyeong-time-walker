const { chromium } = require('playwright');
const crypto = require('crypto');
const { Pool } = require('pg');
const db = new Pool({ host: '/var/tmp/gtwpg', port: 5433, user: 'postgres', database: 'gtw_e2e' });
const q = async (sql, p) => (await db.query(sql, p)).rows;
const sign = (id) => `GTW1.${id}.` + crypto.createHmac('sha256', 'test-secret').update(`loc:${id}`).digest('hex').slice(0, 16);
const base = 'http://localhost:3100';
let n = 0; const ok = (c, m) => { if (!c) throw new Error('FAILED: ' + m); n++; console.log('✓', m); };

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 420, height: 860 }, permissions: ['geolocation'], geolocation: { latitude: 36.0, longitude: 127.0, accuracy: 10 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const act = (action, proof) => p.evaluate(async ([a, pr]) => { const r = await fetch('/api/game/action', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: a, proof: pr }) }); return { status: r.status, body: await r.json() }; }, [action, proof]);

  // 1. 게스트 로그인
  await p.goto(base + '/login'); await p.getByText('나그네(게스트)로 바로 시작').click();
  await p.getByText('기록이 서버에 저장되고 있어요').waitFor({ timeout: 10000 });
  const [u] = await q('select id from auth.users'); const uid = u.id;
  ok((await q('select 1 from profiles where id=$1', [uid])).length === 1, '가입 시 profiles 트리거 생성');
  ok((await q('select version from game_saves where user_id=$1', [uid])).length === 1, '첫 접속 시 서버 게임 저장 생성');
  await p.screenshot({ path: 'remote-login.png' });

  // 2. QR 방문 (서버 검증)
  await p.goto(`${base}/explore?qr=${sign('gwangshin')}`);
  await p.getByRole('dialog', { name: '캐릭터 발견' }).waitFor({ timeout: 10000 });
  ok(true, 'QR 방문 → 캐릭터 수집 연출');
  await p.getByText('인연을 기록하다').click();
  const v = await q('select location_id, method from location_visits where user_id=$1', [uid]);
  ok(v.length === 1 && v[0].method === 'qr', 'location_visits 에 QR 방문 저장');
  ok((await q("select 1 from collections where user_id=$1 and item_type='character' and item_id='kaengi'", [uid])).length === 1, 'collections 에 갱이 저장');
  ok(await p.getByText('현장 도착 시뮬레이션').count() === 0, '서버 모드에서 시뮬레이션 버튼 숨김');

  // 3. 중복·위조·우회 시도
  const dup = await act({ type: 'visit', locationId: 'gwangshin', method: 'qr' }, { qr: sign('gwangshin') });
  ok(dup.status === 422 && /이미 방문/.test(dup.body.error), '같은 장소 재인증 거절');
  const forged = await act({ type: 'visit', locationId: 'gallery', method: 'qr' }, { qr: 'GTW1.gallery.0000000000000000' });
  ok(forged.status === 422, '위조 QR 거절');
  const swapped = await act({ type: 'visit', locationId: 'gallery', method: 'qr' }, { qr: sign('gwangshin') });
  ok(swapped.status === 422 && /다른 장소/.test(swapped.body.error), '다른 장소 QR 재사용 거절');
  const demo = await act({ type: 'visit', locationId: 'gallery', method: 'demo' });
  ok(demo.status === 422, '서버 모드 시뮬레이션 방문 거절');
  const gpsNoCoords = await act({ type: 'visit', locationId: 'gallery', method: 'gps' }, { gps: { lat: 36, lng: 127, accuracy: 5 } });
  ok(gpsNoCoords.status === 422 && /좌표/.test(gpsNoCoords.body.error), '좌표 미등록 장소 GPS 거절');
  const fakeReward = await act({ type: 'villageFind', key: 'place:hacked' });
  ok(fakeReward.status === 422, '없는 보상 키 거절');
  ok((await q('select count(*)::int c from location_visits where user_id=$1', [uid]))[0].c === 1, '거절된 요청은 DB에 기록되지 않음');

  // 4. 동시 요청 (버전 충돌 처리)
  const many = await Promise.all(['place:welcome-center', 'place:gallery', 'place:honggyori', 'place:dammi'].map((k) => act({ type: 'villageFind', key: k })));
  const st = (await q('select state from game_saves where user_id=$1', [uid]))[0].state;
  ok(many.filter((r) => r.status === 200).length === 3 && st.villageFound.filter((x) => x.startsWith('place:')).length === 3, '동시 요청 4건 → 유효 3건만 반영 (없는 장소 1건 거절, 유실 없음)');

  // 5. 젓갈 (UI)
  await p.goto(base + '/jeotgal'); await p.getByText('첫 젓갈 담그기').click();
  await p.getByText('새우젓', { exact: false }).first().click();
  await p.getByText('다음: 항아리에 담기 →').click();
  for (const name of ['새우', '소금', '웃소금']) { await p.locator('button', { hasText: name }).first().click(); await p.waitForTimeout(150); }
  await p.getByText('다음: 뚜껑 덮기 →').click(); await p.getByText('숙성 시작', { exact: true }).click();
  await p.getByRole('button', { name: '새 항아리' }).waitFor(); await p.waitForTimeout(800);
  ok((await q("select status from user_fermentation where user_id=$1", [uid]))[0]?.status === 'aging', '젓갈 항아리 서버 저장');
  ok(await p.getByText('숙성 빨리감기').count() === 0, '서버 모드에서 빨리감기 숨김');
  const early = await act({ type: 'openJar', jarId: st.jars?.[0]?.id ?? (await q("select id from user_fermentation where user_id=$1", [uid]))[0].id, fastForward: true });
  ok(early.status === 422, '숙성 전 개봉·빨리감기 거절');

  // 6. 공동 항아리 실시간 집계
  await p.getByText('실시간 집계').waitFor();
  await p.getByRole('button', { name: '기여' }).nth(2).click(); await p.waitForTimeout(800);
  ok((await q("select progress from community_jars where id='season-1'"))[0].progress === 1, '공동 항아리 기여 → DB 집계');
  await p.screenshot({ path: 'remote-jeotgal.png', fullPage: true });

  // 7. 퀘스트 보상 (웰컴센터 QR → 첫 발걸음)
  await p.goto(`${base}/explore?qr=${sign('welcome-center')}`); await p.getByText('인연을 기록하다').click();
  await p.goto(base + '/quests');
  const before = (await q('select coins from profiles where id=$1', [uid]))[0].coins;
  await p.getByText('보상 받기').first().click(); await p.waitForTimeout(800);
  ok((await q('select count(*)::int c from user_quests where user_id=$1', [uid]))[0].c >= 1, '퀘스트 보상 수령 → user_quests 저장');
  ok((await q('select coins from profiles where id=$1', [uid]))[0].coins > before, 'profiles 코인 동기화');

  // 8. 엽서 저장
  await p.goto(base + '/postcard?loc=gwangshin'); await p.waitForTimeout(800);
  await p.getByText('내 엽서함에 저장').click();
  await p.getByText('저장한 엽서').first().waitFor({ state: 'attached', timeout: 10000 }).catch(() => {});
  await p.waitForTimeout(1500);
  const pc = await q('select image_path, is_public from postcards where user_id=$1', [uid]);
  ok(pc.length === 1 && pc[0].image_path.startsWith(uid + '/'), '엽서 이미지 업로드 + postcards 행 저장');
  ok(await p.locator('img[alt="저장한 엽서"]').count() === 1, '엽서함에 서명 URL 이미지 표시');
  await p.screenshot({ path: 'remote-postcard.png', fullPage: true });
  const pcBad = await p.evaluate(async () => { const fd = new FormData(); fd.set('image', new Blob(['notpng']), 'x.png'); fd.set('location_id', 'gallery'); return (await fetch('/api/postcards', { method: 'POST', body: fd })).status; });
  ok(pcBad === 415 || pcBad === 403, 'PNG 아닌 파일 / 미방문 장소 엽서 거절');

  // 9. 관리자: 권한 없을 때 거절 → 권한 부여 → 시드 → 좌표 등록
  await p.goto(base + '/admin'); ok(await p.getByText('접근 권한이 없습니다').count() === 1, '일반 사용자 관리자 페이지 차단');
  await q("update profiles set role='admin' where id=$1", [uid]);
  await p.goto(base + '/admin'); await p.getByText('기본 콘텐츠 DB에 등록').click(); await p.waitForTimeout(1500);
  ok((await q('select count(*)::int c from locations'))[0].c === 24 && (await q("select count(*)::int c from characters where id='sweetpo'"))[0].c === 1, '기본 콘텐츠 시드 (장소 24 · 스윗포 포함)');
  await p.screenshot({ path: 'remote-admin.png', fullPage: true });
  await p.goto(base + '/admin/locations');
  const det = p.locator('details', { hasText: '9. 강경화랑' }); await det.locator('summary').click();
  await det.locator('input[name=lat]').fill('36.158000'); await det.locator('input[name=lng]').fill('127.010000');
  await det.locator('select[name=history_status]').selectOption('pending');
  await det.getByText('저장').click(); await p.waitForTimeout(1500);
  ok((await q("select lat from locations where id='gallery'"))[0].lat === 36.158, '관리자 좌표 저장');

  // 10. GPS 인증: 멀리서 → 거절, 현장 → 성공
  const far = await act({ type: 'visit', locationId: 'gallery', method: 'gps' }, { gps: { lat: 36.0, lng: 127.0, accuracy: 10 } });
  ok(far.status === 422 && /떨어져/.test(far.body.error), '먼 위치 GPS 거절');
  const lowAcc = await act({ type: 'visit', locationId: 'gallery', method: 'gps' }, { gps: { lat: 36.158, lng: 127.01, accuracy: 300 } });
  ok(lowAcc.status === 422 && /정확도/.test(lowAcc.body.error), '정확도 낮은 GPS 거절');
  await ctx.setGeolocation({ latitude: 36.15801, longitude: 127.01001, accuracy: 8 });
  await p.goto(base + '/explore'); await p.waitForTimeout(800);
  await p.getByRole('button', { name: /9번 강경화랑/ }).click({ force: true });
  await p.getByRole('button', { name: /GPS 인증/ }).click();
  await p.getByRole('dialog', { name: '캐릭터 발견' }).waitFor({ timeout: 10000 });
  ok((await q("select method from location_visits where user_id=$1 and location_id='gallery'", [uid]))[0]?.method === 'gps', '현장 GPS 인증 성공 → 대추 첫째 발견');
  await p.getByText('인연을 기록하다').click();

  // 11. 새로고침해도 서버 기록 유지
  await p.goto(base + '/me'); await p.waitForTimeout(800);
  ok(await p.getByText('서버 저장', { exact: true }).count() === 1, '내 공간: 서버 저장 모드 표시');
  await p.screenshot({ path: 'remote-me.png', fullPage: true });
  const lv = (await q('select level from profiles where id=$1', [uid]))[0].level;
  ok(await p.getByText(`Lv.${lv} ·`).count() >= 1, '새로고침 후 서버의 레벨 표시');

  // 12. 회원 탈퇴 → 모든 기록 삭제
  p.on('dialog', (d) => d.accept());
  await p.getByText('회원 탈퇴 · 개인정보 삭제').click(); await p.waitForURL(base + '/', { timeout: 10000 });
  const left = await q('select (select count(*) from auth.users)::int u, (select count(*) from game_saves)::int g, (select count(*) from location_visits)::int v, (select count(*) from postcards)::int p');
  ok(left[0].u === 0 && left[0].g === 0 && left[0].v === 0 && left[0].p === 0, '탈퇴 시 계정·기록·엽서 모두 삭제');

  console.log(`\n${n}개 서버 모드 E2E 검사 통과`);
  console.log('page errors:', JSON.stringify(errs));
  await b.close(); await db.end();
})().catch(async (e) => { console.error(e.message); process.exit(1); });
