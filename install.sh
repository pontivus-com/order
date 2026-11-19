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
sourceCommit=""
repositoryRoot="$(git -C "$sourceRoot" rev-parse --show-toplevel 2>/dev/null || true)"
if [ -n "$repositoryRoot" ]; then
  [ "$repositoryRoot" = "$sourceRoot" ] ||
    fail "install.sh must run from the Order repository root"
  git -C "$sourceRoot" diff --quiet -- ||
    fail "refusing to install from a checkout with unstaged changes"
  git -C "$sourceRoot" diff --cached --quiet -- ||
    fail "refusing to install from a checkout with staged changes"
  sourceCommit="$(git -C "$sourceRoot" rev-parse HEAD)"
elif [ ! -f "$sourceRoot/RELEASE.json" ]; then
  fail "install.sh must run from a clean Order Git checkout or extracted Order release bundle"
fi

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
  HOME="$bootstrap/home" BUN_INSTALL="$bootstrap/bun" bash -s -- "bun-v${bunVersion}"

bunBinary="$bootstrap/bun/bin/bun"
[ -x "$bunBinary" ] || fail "Bun bootstrap did not produce the expected binary"
[ "$("$bunBinary" --version)" = "$bunVersion" ] ||
  fail "Bun bootstrap version does not match $bunVersion"

if [ -z "$sourceCommit" ]; then
  sourceCommit="$(
    "$bunBinary" -e '
      const path = Bun.argv.at(-1);
      if (path === undefined) process.exit(1);
      const value = await Bun.file(path).json().catch(() => null);
      if (
        value === null ||
        typeof value !== "object" ||
        typeof value.gitCommit !== "string" ||
        !/^[0-9a-f]{40}$/.test(value.gitCommit)
      ) process.exit(1);
      process.stdout.write(value.gitCommit);
    ' "$sourceRoot/RELEASE.json"
  )" || fail "release bundle contains an invalid RELEASE.json"
fi

"$bunBinary" "$sourceRoot/src/installer.ts" \
  --source-root "$sourceRoot" \
  --source-commit "$sourceCommit"
