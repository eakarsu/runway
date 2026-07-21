#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL is required}"
project_dir="$(cd "$(dirname "$0")/.." && pwd -P)"
exec node "$project_dir/server/scripts/migrate.js"
