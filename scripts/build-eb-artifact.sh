#!/usr/bin/env sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo ""
echo "=== [1/4] Instalando dependencias ==="
npm ci
NODE_ENV=development npm ci --prefix client

echo ""
echo "=== [2/4] Build del frontend ==="
npm run build

if [ ! -d "client/dist" ]; then
  echo "Error: no existe client/dist tras el build."
  exit 1
fi

if [ ! -f "client/dist/index.html" ]; then
  echo "Error: client/dist/index.html no existe tras el build."
  exit 1
fi

echo ""
echo "=== [3/4] Limpiando dependencias para artefacto liviano ==="
rm -rf node_modules client/node_modules
rm -f ytlink-eb.zip

echo ""
echo "=== [4/4] Verificacion final ==="
ls -la client/dist >/dev/null
echo "Listo: workspace preparado para artefacto de CodePipeline (incluye client/dist)."
