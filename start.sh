#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="${RUNTIME_PROJECT_SOURCE:-$(cd "$(dirname "$0")" && pwd)}"
SERVER_PORT="${SERVER_PORT:-}"
CLIENT_PORT="${CLIENT_PORT:-}"

if [[ "${NODE_ENV:-production}" != production && -z "${CORS_ORIGIN:-}" ]]; then
  CORS_ORIGIN="${CORS_ALLOWED_ORIGIN:-http://127.0.0.1:$CLIENT_PORT}"
  export CORS_ORIGIN
fi

required=(DATABASE_URL JWT_SECRET CORS_ORIGIN SERVER_PORT CLIENT_PORT)
for name in "${required[@]}"; do
  if [[ -z "${!name:-}" ]]; then
    echo "Missing required environment variable: $name" >&2
    exit 1
  fi
done
if [[ "$SERVER_PORT" == "$CLIENT_PORT" ]]; then
  echo "SERVER_PORT and CLIENT_PORT must be distinct" >&2
  exit 1
fi
if (( ${#JWT_SECRET} < 32 )); then
  echo "JWT_SECRET must be at least 32 characters" >&2
  exit 1
fi
if [[ "$JWT_SECRET" =~ ^(change-me|replace-with|your-|example|dev-secret) ]]; then
  echo "JWT_SECRET must not be a placeholder" >&2
  exit 1
fi
if [[ ! "$DATABASE_URL" =~ ^postgres(ql)?:// ]]; then
  echo "DATABASE_URL must be a PostgreSQL URL" >&2
  exit 1
fi
if [[ ! "$CORS_ORIGIN" =~ ^https?://[^[:space:]]+$ || "$CORS_ORIGIN" == "*" ]]; then
  echo "CORS_ORIGIN must be one explicit HTTP(S) origin" >&2
  exit 1
fi

for port in "$SERVER_PORT" "$CLIENT_PORT"; do
  if [[ ! "$port" =~ ^[0-9]+$ ]] || (( port < 1 || port > 65535 )); then
    echo "Ports must be integers from 1 through 65535" >&2
    exit 1
  fi
  if command -v lsof >/dev/null 2>&1 && lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Port $port is already in use; refusing to stop an unrelated process" >&2
    exit 1
  fi
done

[[ -d "$PROJECT_DIR/server/node_modules" ]] || { echo "Prepared server dependencies are missing" >&2; exit 1; }
[[ -d "$PROJECT_DIR/client/node_modules" ]] || { echo "Prepared client dependencies are missing" >&2; exit 1; }
[[ -f "$PROJECT_DIR/client/dist/index.html" ]] || { echo "Prepared client build is missing" >&2; exit 1; }

cleanup() {
  local status=$?
  trap - EXIT INT TERM
  [[ -n "${client_pid:-}" ]] && kill "$client_pid" 2>/dev/null || true
  [[ -n "${server_pid:-}" ]] && kill "$server_pid" 2>/dev/null || true
  wait "${client_pid:-}" "${server_pid:-}" 2>/dev/null || true
  exit "$status"
}
trap cleanup EXIT INT TERM

(cd "$PROJECT_DIR/server" && exec env NODE_ENV="${NODE_ENV:-production}" node index.js) &
server_pid=$!
for _ in {1..30}; do
  kill -0 "$server_pid" 2>/dev/null || { echo "Server exited before readiness" >&2; wait "$server_pid"; exit 1; }
  curl --fail --silent "http://127.0.0.1:$SERVER_PORT/api/health" >/dev/null && break
  sleep 1
done
curl --fail --silent "http://127.0.0.1:$SERVER_PORT/api/health" >/dev/null || { echo "Server readiness timed out" >&2; exit 1; }

(cd "$PROJECT_DIR/client" && exec npm run preview -- --host 127.0.0.1 --port "$CLIENT_PORT" --strictPort) &
client_pid=$!
for _ in {1..30}; do
  kill -0 "$client_pid" 2>/dev/null || { echo "Client exited before readiness" >&2; wait "$client_pid"; exit 1; }
  curl --fail --silent "http://127.0.0.1:$CLIENT_PORT/login" >/dev/null && break
  sleep 1
done
curl --fail --silent "http://127.0.0.1:$CLIENT_PORT/login" >/dev/null || { echo "Client readiness timed out" >&2; exit 1; }
echo "Runway ready at http://127.0.0.1:$CLIENT_PORT"
while kill -0 "$server_pid" 2>/dev/null && kill -0 "$client_pid" 2>/dev/null; do
  sleep 1
done
echo "A Runway service exited unexpectedly" >&2
exit 1
