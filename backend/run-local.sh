#!/usr/bin/env bash
# Roda o backend localmente (sem Docker), gerando o .env na primeira vez
# e exportando o JWT_SECRET de la pro processo do Maven.
set -euo pipefail

raiz="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
"$raiz/scripts/setup-env.sh"

set -a
source "$raiz/.env"
set +a

cd "$(dirname "${BASH_SOURCE[0]}")"
mvn spring-boot:run
