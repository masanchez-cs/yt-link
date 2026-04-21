#!/usr/bin/env sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

ZIP_NAME="ytlink-eb.zip"

echo ""
echo "=== [1/3] Instalando dependencias ==="
npm ci
NODE_ENV=development npm ci --prefix client

echo ""
echo "=== [2/3] Build del frontend ==="
npm run build

if [ ! -d "client/dist" ]; then
  echo "Error: no existe client/dist tras el build."
  exit 1
fi

if ! command -v zip >/dev/null 2>&1; then
  echo "Error: no existe el comando zip en el entorno de compilacion."
  echo "Instala zip o agrega una linea previa en el pipeline para instalarlo."
  exit 1
fi

echo ""
echo "=== [3/3] Creando artefacto $ZIP_NAME ==="
rm -f "$ZIP_NAME"
zip -rq "$ZIP_NAME" . \
  -x "node_modules/*" \
     "client/node_modules/*" \
     ".git/*" \
     "__tests__/*" \
     "coverage/*" \
     ".vscode/*" \
     ".idea/*" \
     ".env*" \
     "ytlink-eb-*.zip"

if [ ! -f "$ZIP_NAME" ]; then
  echo "Error: no se pudo generar $ZIP_NAME."
  exit 1
fi

echo "Listo: $ZIP_NAME"
