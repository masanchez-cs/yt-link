#!/usr/bin/env sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [ -z "${CODEBUILD_BUILD_ID:-}" ]; then
  echo "Este script es solo para CodeBuild/CodePipeline."
  echo "Para empaquetado local usa: npm run zip:eb"
  exit 1
fi

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
if [ ! -f "client/dist/index.html" ]; then
  echo "Error: falta client/dist/index.html al finalizar limpieza."
  exit 1
fi

# Reducir el artefacto final a lo necesario para EB (similar al ZIP manual que funcionaba).
mkdir -p .tmp-client
cp -R client/dist .tmp-client/dist
rm -rf client
mkdir -p client
mv .tmp-client/dist client/dist
rmdir .tmp-client

rm -rf __tests__ docs scripts swagger .git .github .vscode .idea
rm -f .env .env.* .gitignore .env.example build-eb-zip.bat REQUIREMENTS.md

echo "Listo: workspace minimo para EB preparado (incluye client/dist)."
