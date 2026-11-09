#!/usr/bin/env bash
# 사용법: PGHOST=... PGPORT=... ./supabase/tests/run.sh  (빈 테스트 DB를 만들어 schema.sql 을 두 번 적용하고 시험)
set -euo pipefail
cd "$(dirname "$0")"
psql -q -U postgres -c "drop database if exists gtw_test" -c "create database gtw_test"
psql -q -v ON_ERROR_STOP=1 -U postgres -d gtw_test -f supabase_stub.sql
psql -q -v ON_ERROR_STOP=1 -U postgres -d gtw_test -f ../schema.sql
psql -q -v ON_ERROR_STOP=1 -U postgres -d gtw_test -f ../schema.sql   # 재실행 안전성
psql -q -v ON_ERROR_STOP=1 -U postgres -d gtw_test -f test_rpc.sql
