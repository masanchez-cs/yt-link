# Genera un ZIP listo para Elastic Beanstalk: npm run build + copia sin node_modules ni secretos.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host ""
Write-Host "=== [1/3] npm run build ===" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
  Write-Host "Error: el build falló." -ForegroundColor Red
  exit 1
}

if (-not (Test-Path "client\dist")) {
  Write-Host "Error: no existe client\dist tras el build." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "=== [2/3] Copiando a carpeta temporal (excluye node_modules, .git, etc.) ===" -ForegroundColor Cyan

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipName = "ytlink-eb-$stamp.zip"
$temp = Join-Path $env:TEMP "ytlink-eb-staging-$stamp"

if (Test-Path $temp) {
  Remove-Item $temp -Recurse -Force
}
New-Item -ItemType Directory -Path $temp -Force | Out-Null

# Robocopy: copia todo excepto lo que no debe ir a EB (alineado a .ebignore)
$rcArgs = @(
  $root,
  $temp,
  "/E",
  "/NFL", "/NDL", "/NJH", "/NJS",
  "/XD", "node_modules", "client\node_modules", ".git", "__tests__", "coverage", ".vscode", ".idea", "scripts",
  "/XF", ".env", ".gitignore", "build-eb-zip.bat"
)
& robocopy.exe @rcArgs | Out-Null
$rc = $LASTEXITCODE
# Robocopy: 0-7 = OK (0 sin cambios, 1+ archivos copiados, etc.); >= 8 error
if ($rc -ge 8) {
  Write-Host "Error: robocopy falló (código $rc)." -ForegroundColor Red
  exit 1
}

# Quitar otros .env* si existieran en el árbol
Get-ChildItem -Path $temp -Filter ".env*" -Recurse -Force -ErrorAction SilentlyContinue |
  Remove-Item -Force -ErrorAction SilentlyContinue

# No incluir zips viejos si los hubiera copiado
Get-ChildItem -Path $temp -Filter "ytlink-eb-*.zip" -Recurse -ErrorAction SilentlyContinue |
  Remove-Item -Force -ErrorAction SilentlyContinue

# EB exige package.json y app.js en la raíz del ZIP (no dentro de una subcarpeta).
if (-not (Test-Path -LiteralPath (Join-Path $temp "package.json"))) {
  Write-Host "Error: falta package.json en la copia de despliegue (revisa robocopy)." -ForegroundColor Red
  exit 1
}
if (-not (Test-Path -LiteralPath (Join-Path $temp "app.js"))) {
  Write-Host "Error: falta app.js en la copia de despliegue." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "=== [3/3] Creando ZIP (rutas con / para Linux / Elastic Beanstalk) ===" -ForegroundColor Cyan

$zipPath = Join-Path $root $zipName
if (Test-Path $zipPath) {
  Remove-Item $zipPath -Force
}

# Compress-Archive en Windows guarda '\' dentro del ZIP; unzip en Linux de EB falla.
# ZipArchive con nombres de entrada normalizados a '/' (estándar ZIP / Unix).
# No usar FullName.Substring(base.Length): en Windows 8.3 vs ruta larga deja prefijos basura (p. ej. "9/app.js")
# y EB no encuentra package.json en la raíz.
Add-Type -AssemblyName System.IO.Compression
$baseFull = [System.IO.Path]::GetFullPath((Get-Item -LiteralPath $temp).FullName).TrimEnd('\')
$baseUri = New-Object Uri ($baseFull + [System.IO.Path]::DirectorySeparatorChar)
$zipStream = [System.IO.File]::Open($zipPath, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write)
try {
  $zip = [System.IO.Compression.ZipArchive]::new($zipStream, [System.IO.Compression.ZipArchiveMode]::Create)
  try {
    Get-ChildItem -LiteralPath $baseFull -Recurse -File | ForEach-Object {
      $full = [System.IO.Path]::GetFullPath($_.FullName)
      $rel = [Uri]::UnescapeDataString($baseUri.MakeRelativeUri([Uri](New-Object Uri $full)).ToString())
      if ([string]::IsNullOrEmpty($rel)) { return }
      $entryName = $rel.TrimStart('\') -replace '\\', '/'
      $entry = $zip.CreateEntry($entryName, [System.IO.Compression.CompressionLevel]::Optimal)
      $dest = $entry.Open()
      try {
        $src = [System.IO.File]::OpenRead($full)
        try {
          $src.CopyTo($dest)
        } finally {
          $src.Dispose()
        }
      } finally {
        $dest.Dispose()
      }
    }
  } finally {
    $zip.Dispose()
  }
} finally {
  $zipStream.Dispose()
}

Remove-Item $temp -Recurse -Force

$sizeMb = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
Write-Host ""
Write-Host "Listo: $zipPath ($sizeMb MB)" -ForegroundColor Green
Write-Host "Sube este archivo a Elastic Beanstalk (o usa eb deploy)." -ForegroundColor Gray
Write-Host ""
