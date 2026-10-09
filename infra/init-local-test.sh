#!/usr/bin/env bash
set -euo pipefail
# Development helper. Creates only the named local test services in /tmp.
pg_dir="${BUILDHIVE_TEST_PG_DIR:-/tmp/buildhive-v1-pg}"
pg_bin="${BUILDHIVE_PG_BIN:-/usr/lib/postgresql/16/bin}"
if [[ ! -f "$pg_dir/PG_VERSION" ]]; then "$pg_bin/initdb" -D "$pg_dir" -A trust --no-locale -E UTF8; fi
if ! "$pg_bin/pg_ctl" -D "$pg_dir" status >/dev/null 2>&1; then "$pg_bin/pg_ctl" -D "$pg_dir" -l /tmp/buildhive-v1-postgres.log -o '-p 55432 -k /tmp -h 127.0.0.1' start; fi
if ! psql -h 127.0.0.1 -p 55432 -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='buildhive_test'" | grep -q 1; then createdb -h 127.0.0.1 -p 55432 buildhive_test; fi
if ! redis-cli -p 56379 ping >/dev/null 2>&1; then redis-server --port 56379 --bind 127.0.0.1 --save '' --appendonly no --daemonize yes; fi
printf 'Local fixtures ready: PostgreSQL :55432/buildhive_test and Redis :56379\n'
