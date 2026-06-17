#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT/docker-compose.prod.yml"
ENV_FILE="$ROOT/.env.prod"

usage() {
  echo "Usage: $0 <version> [--env-file path]" >&2
  echo "Example: $0 1.4.2" >&2
  exit 1
}

[[ $# -ge 1 ]] || usage

VERSION="$1"
shift

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env-file)
      [[ $# -ge 2 ]] || usage
      ENV_FILE="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      ;;
  esac
done

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing env file: $ENV_FILE" >&2
  echo "Copy .env.prod.template to .env.prod and fill in the values." >&2
  exit 1
fi

if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$ ]]; then
  echo "Warning: version '$VERSION' does not look like semver (e.g. 1.4.2)." >&2
fi

export APP_VERSION="$VERSION"

cd "$ROOT"

echo "Pulling nilochub/rocktom-back:$APP_VERSION and nilochub/rocktom-front:$APP_VERSION..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull back front

echo "Starting stack with version $APP_VERSION..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

echo ""
echo "Deployed version $APP_VERSION"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
