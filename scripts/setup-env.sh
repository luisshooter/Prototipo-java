#!/usr/bin/env bash
# Garante que existe um .env na raiz com um JWT_SECRET valido.
# Idempotente: se o .env ja existe, nao mexe nele (nao troca o segredo a toa,
# senao toda sessao ativa cairia). So gera na primeira vez.
set -euo pipefail

raiz="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
env_path="$raiz/.env"

if [ -f "$env_path" ]; then
  echo ".env ja existe em $env_path - nada a fazer."
  exit 0
fi

if command -v openssl >/dev/null 2>&1; then
  segredo=$(openssl rand -base64 48)
else
  segredo=$(head -c 48 /dev/urandom | base64)
fi

cat > "$env_path" <<EOF
# Gerado automaticamente por scripts/setup-env.sh - nao versionar.
JWT_SECRET=$segredo
EOF

echo "Criado $env_path com um JWT_SECRET novo."
