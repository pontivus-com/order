#!/usr/bin/env bash
set -euo pipefail

fail() {
  printf 'order install: %s\n' "$*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "required bootstrap command is unavailable: $1"
}

[ "$(uname -s)" = "Linux" ] || fail "Order v1 productive installation requires Linux"
for command in git curl bash mktemp rm dirname; do
  require_command "$command"
done

sourceRoot="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
repositoryRoot="$(git -C "$sourceRoot" rev-parse --show-toplevel 2>/dev/null)" ||
  fail "install.sh must run from a Order Git checkout"
[ "$repositoryRoot" = "$sourceRoot" ] ||
  fail "install.sh must run from the Order repository root"

git -C "$sourceRoot" diff --quiet -- ||
  fail "refusing to install from a checkout with unstaged changes"
git -C "$sourceRoot" diff --cached --quiet -- ||
  fail "refusing to install from a checkout with staged changes"
sourceCommit="$(git -C "$sourceRoot" rev-parse HEAD)"

bunVersion="$(tr -d '[:space:]' < "$sourceRoot/.bun-version")"
[ "$bunVersion" = "1.4.4" ] || fail "unexpected Bun pin: $bunVersion"

home="${HOME:-}"
[ -n "$home" ] || fail "HOME is required"
case "$home" in
  /*) ;;
  *) fail "HOME must be an absolute path" ;;
esac

bootstrap="$(mktemp -d "${TMPDIR:-/tmp}/pontivus-order-bootstrap.XXXXXX")"
cleanup() {
  rm -rf "$bootstrap"
}
trap cleanup EXIT

curl -fsSL https://bun.com/install |
  HOME="$bootstrap/home"   BUN_INSTALL="$bootstrap/bun"   bash -s -- "bun-v${bunVersion}"

bunBinary="$bootstrap/bun/bin/bun"
[ -x "$bunBinary" ] || fail "Bun bootstrap did not produce the expected binary"
[ "$("$bunBinary" --version)" = "$bunVersion" ] ||
  fail "Bun bootstrap version does not match $bunVersion"

"$bunBinary" "$sourceRoot/src/installer.ts"   --source-root "$sourceRoot"   --source-commit "$sourceCommit"
