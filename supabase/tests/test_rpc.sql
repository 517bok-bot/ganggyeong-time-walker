-- commit_game_action / RLS 동작 시험
\set ON_ERROR_STOP 1
insert into auth.users(id, email) values ('11111111-1111-1111-1111-111111111111', 'a@test'), ('22222222-2222-2222-2222-222222222222', 'b@test');

set role service_role;
-- 트리거로 프로필이 생겼는지
do $$ begin assert (select count(*) from profiles) = 2, 'profiles trigger'; end $$;
select init_game_save('11111111-1111-1111-1111-111111111111', '{"player":{"name":"A"}}') as v1;
select init_game_save('11111111-1111-1111-1111-111111111111', '{"player":{"name":"X"}}') as v1_again; -- 덮어쓰지 않음
do $$ begin assert (select state->'player'->>'name' from game_saves where user_id='11111111-1111-1111-1111-111111111111') = 'A', 'init idempotent'; end $$;

-- 정상 방문 커밋
select commit_game_action('11111111-1111-1111-1111-111111111111', 1, '{"s":2}',
  '{"visit":{"location_id":"gwangshin","method":"qr"},"collections":[{"item_type":"character","item_id":"kaengi","method":"real"}]}',
  '{"nickname":"에이","level":2,"exp":10,"coins":75,"artisan_exp":0,"avatar":"sage"}') as v2;
do $$ begin
  assert (select count(*) from location_visits) = 1, 'visit stored';
  assert (select count(*) from collections) = 1, 'collection stored';
  assert (select coins from profiles where id='11111111-1111-1111-1111-111111111111') = 75, 'stats synced';
end $$;

-- 버전 충돌
do $$ begin
  perform commit_game_action('11111111-1111-1111-1111-111111111111', 1, '{"s":"stale"}', '{"collections":[]}', '{}');
  raise exception 'should have failed';
exception when others then
  assert sqlerrm = 'version_conflict', 'expected version_conflict, got ' || sqlerrm;
end $$;

-- 중복 방문 → 전체 롤백 (state 도 바뀌지 않아야 함)
do $$ begin
  perform commit_game_action('11111111-1111-1111-1111-111111111111', 2, '{"s":"dup"}', '{"visit":{"location_id":"gwangshin","method":"gps"},"collections":[]}', '{}');
  raise exception 'should have failed';
exception when others then
  assert sqlerrm = 'duplicate_visit', 'expected duplicate_visit, got ' || sqlerrm;
end $$;
do $$ begin assert (select version from game_saves where user_id='11111111-1111-1111-1111-111111111111') = 2, 'rolled back'; end $$;

-- 퀘스트 중복 수령 차단
select commit_game_action('11111111-1111-1111-1111-111111111111', 2, '{"s":3}', '{"questClaim":"q-npc","collections":[]}', '{}');
do $$ begin
  perform commit_game_action('11111111-1111-1111-1111-111111111111', 3, '{"s":4}', '{"questClaim":"q-npc","collections":[]}', '{}');
  raise exception 'should have failed';
exception when others then assert sqlerrm = 'duplicate_claim', sqlerrm; end $$;

-- 젓갈 항아리 저장 → 완료 갱신
select commit_game_action('11111111-1111-1111-1111-111111111111', 3, '{"s":5}',
  '{"collections":[],"jar":{"id":"jar-1","typeId":"saeu","ingredients":{"shrimp":2,"salt":2},"ratio":30,"order":["main","salt","topsalt"],"jarSkin":"basic","startedAt":1762650000000,"readyAt":1762650180000,"status":"aging"}}', '{}');
select commit_game_action('11111111-1111-1111-1111-111111111111', 4, '{"s":6}',
  '{"collections":[{"item_type":"jeotgal","item_id":"saeu"}],"jar":{"id":"jar-1","typeId":"saeu","ingredients":{"shrimp":2,"salt":2},"ratio":30,"order":["main","salt","topsalt"],"jarSkin":"basic","startedAt":1762650000000,"readyAt":1762650180000,"status":"done","score":91,"grade":"황금빛 장인 젓갈","finishedAt":1762650200000}}', '{}');
do $$ begin assert (select status||score from user_fermentation where id='jar-1') = 'done91', 'jar updated'; end $$;

-- 공동 항아리 기여
select commit_game_action('11111111-1111-1111-1111-111111111111', 5, '{"s":7}', '{"collections":[],"contribution":{"item_id":"salt","source":"real"}}', '{}');
do $$ begin assert (select progress from community_jars where id='season-1') = 1, 'jar progress'; end $$;
reset role;

-- RLS: 사용자 B 는 A 의 기록을 볼 수 없고, 직접 쓸 수도 없음
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
do $$ begin
  assert (select count(*) from game_saves) = 0, 'B cannot read A save';
  assert (select count(*) from location_visits) = 0, 'B cannot read A visits';
  assert (select count(*) from community_jars) = 1, 'jar readable';
  assert (select count(*) from profiles) = 1, 'B sees only own profile';
end $$;
do $$ begin
  perform commit_game_action('22222222-2222-2222-2222-222222222222', 1, '{}', '{"collections":[]}', '{}');
  raise exception 'should have failed';
exception when insufficient_privilege then null; end $$;
-- 권한 상승·수치 조작 시도: 쓰기 정책이 없어 0행 변경
update profiles set role = 'admin', coins = 999999;
do $$ begin
  insert into game_saves(user_id, state) values ('22222222-2222-2222-2222-222222222222', '{}');
  raise exception 'should have failed';
exception when insufficient_privilege then null; end $$;
reset role;
do $$ begin
  assert (select role from profiles where id='22222222-2222-2222-2222-222222222222') = 'user', 'no privilege escalation';
  assert (select count(*) from game_saves where user_id='22222222-2222-2222-2222-222222222222') = 0, 'no direct save insert';
end $$;
set role authenticated;
do $$ begin
  begin perform * from admin_stats; raise exception 'should have failed'; exception when insufficient_privilege then null; end;
end $$;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
do $$ begin assert (select count(*) from game_saves) = 1, 'A reads own save'; end $$;
reset role;
select 'ALL RPC/RLS TESTS PASSED' as result;
