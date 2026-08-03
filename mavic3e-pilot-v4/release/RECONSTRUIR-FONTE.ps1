$ErrorActionPreference='Stop'
$Root=Split-Path -Parent $MyInvocation.MyCommand.Path
$parts=Get-ChildItem -LiteralPath $Root -Filter 'source.part*.b64' | Sort-Object Name
if($parts.Count -ne 7){throw "Esperadas 7 partes; encontradas $($parts.Count)."}
$base64=($parts | ForEach-Object { Get-Content -Raw -LiteralPath $_.FullName }) -join ''
$bytes=[Convert]::FromBase64String(($base64 -replace '\s',''))
$out=Join-Path $Root 'EVORA-MAVIC3E-PILOT-V4-FONTE.zip'
[IO.File]::WriteAllBytes($out,$bytes)
$expected='d59bc05cd6fa32cfb896fa99f7ee77558da23e8d04d4b73e24f0454fd059b3bc'
$actual=(Get-FileHash -Algorithm SHA256 -LiteralPath $out).Hash.ToLowerInvariant()
if($actual -ne $expected){Remove-Item $out -Force;throw "Checksum inválido: $actual"}
Write-Host "Fonte reconstruída e validada: $out" -ForegroundColor Green
