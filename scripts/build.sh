#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCKER_USER="nilochub"
BACK_IMAGE="$DOCKER_USER/rocktom-back"
FRONT_IMAGE="$DOCKER_USER/rocktom-front"

usage() {
  echo "Usage: $0 <version> [--vite-api-url url]" >&2
  echo "" >&2
  echo "Environment variables (optional):" >&2
  echo "  VITE_API_URL          Public API URL baked into the front build" >&2
  echo "  DOCKERHUB_USERNAME    Defaults to nilochub" >&2
  echo "  DOCKERHUB_TOKEN       If set, logs in to Docker Hub before push" >&2
  echo "" >&2
  echo "Example:" >&2
  echo "  VITE_API_URL=https://api.rocktom.armandcolin.fr $0 1.0.0" >&2
  exit 1
}

[[ $# -ge 1 ]] || usage

VERSION="$1"
shift
VITE_API_URL="${VITE_API_URL:-}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --vite-api-url)
      [[ $# -ge 2 ]] || usage
      VITE_API_URL="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      ;;
  esac
done

if [[ -z "$VITE_API_URL" ]]; then
  echo "VITE_API_URL is required (env var or --vite-api-url)." >&2
  exit 1
fi

if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$ ]]; then
  echo "Warning: version '$VERSION' does not look like semver (e.g. 1.4.2)." >&2
fi

cd "$ROOT"

if [[ -n "${DOCKERHUB_TOKEN:-}" ]]; then
  echo "Logging in to Docker Hub as ${DOCKERHUB_USERNAME:-$DOCKER_USER}..."
  echo "$DOCKERHUB_TOKEN" | docker login -u "${DOCKERHUB_USERNAME:-$DOCKER_USER}" --password-stdin
fi

SHA_TAG=""
if command -v git >/dev/null 2>&1 && git -C "$ROOT" rev-parse --short HEAD >/dev/null 2>&1; then
  SHA_TAG="sha-$(git -C "$ROOT" rev-parse --short HEAD)"
fi

echo "Building $BACK_IMAGE:$VERSION..."
docker build \
  -t "$BACK_IMAGE:$VERSION" \
  ${SHA_TAG:+-t "$BACK_IMAGE:$SHA_TAG"} \
  ./api

echo "Building $FRONT_IMAGE:$VERSION (VITE_API_URL=$VITE_API_URL)..."
docker build \
  --build-arg "VITE_API_URL=$VITE_API_URL" \
  -t "$FRONT_IMAGE:$VERSION" \
  ${SHA_TAG:+-t "$FRONT_IMAGE:$SHA_TAG"} \
  ./app

echo "Pushing $BACK_IMAGE:$VERSION..."
docker push "$BACK_IMAGE:$VERSION"
if [[ -n "$SHA_TAG" ]]; then
  docker push "$BACK_IMAGE:$SHA_TAG"
fi

echo "Pushing $FRONT_IMAGE:$VERSION..."
docker push "$FRONT_IMAGE:$VERSION"
if [[ -n "$SHA_TAG" ]]; then
  docker push "$FRONT_IMAGE:$SHA_TAG"
fi

echo ""
echo "Published:"
echo "  $BACK_IMAGE:$VERSION"
echo "  $FRONT_IMAGE:$VERSION"
if [[ -n "$SHA_TAG" ]]; then
  echo "  $BACK_IMAGE:$SHA_TAG"
  echo "  $FRONT_IMAGE:$SHA_TAG"
fi
