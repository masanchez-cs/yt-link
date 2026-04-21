#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/app/staging"
cd "$APP_DIR"

if [ ! -f "client/package.json" ]; then
  echo "No existe client/package.json; se omite build de frontend."
  exit 0
fi

echo "[predeploy] Instalando dependencias del frontend..."
NODE_ENV=development npm ci --prefix client

echo "[predeploy] Compilando frontend..."
npm run build --prefix client

if [ ! -f "client/dist/index.html" ]; then
  echo "Error: client/dist/index.html no fue generado."
  exit 1
fi

# Evitar dejar dependencias del frontend en runtime.
rm -rf client/node_modules
echo "[predeploy] Frontend compilado correctamente."
