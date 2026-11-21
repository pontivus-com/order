#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")" && pwd)"
real="$(cat "${root}/real-path")"

if [[ "${PWD}" == */opencode/account-control ]]; then
  export OPENCODE_SIMULATE=1
  unset OPENCODE_DRIVE
  exec "${real}" "$@"
fi

if [[ "${1:-}" == "serve" ]]; then
  merged="$(bun -e '
    const base = JSON.parse(process.env.OPENCODE_CONFIG_CONTENT ?? "{}");
    const simulation = {
      name: "Order SD20 Simulation",
      package: "@opencode/ai/providers/openai/chat",
      settings: { apiKey: "order-sd20-simulation" },
      models: {
        "order-sim-model": {
          name: "Order SD20 Simulated Model",
          capabilities: { tools: true, input: ["text"], output: ["text"] },
          cost: { input: 0, output: 0 },
          limit: { context: 4000000, output: 1000000 }
        }
      }
    };
    process.stdout.write(JSON.stringify({
      ...base,
      update: "disable",
      providers: { ...(base.providers ?? {}), simulation }
    }));
  ')"
  export OPENCODE_CONFIG_CONTENT="${merged}"
  export OPENCODE_SIMULATE=1
  export OPENCODE_DRIVE=1

  primed=0
  "${real}" "$@" | while IFS= read -r line; do
    if [[ "${primed}" -eq 0 && "${line}" =~ (http://127\.0\.0\.1:[0-9]+) ]]; then
      endpoint="${BASH_REMATCH[1]}"
      curl -sS -u "opencode:${OPENCODE_PASSWORD}" \
        --get \
        --data-urlencode "location[directory]=${PWD}" \
        "${endpoint}/api/integration/opencode" \
        >/dev/null 2>&1 || true
      sleep 9
      primed=1
    fi
    printf '%s\n' "${line}"
  done
  exit "${PIPESTATUS[0]}"
fi

exec "${real}" "$@"
