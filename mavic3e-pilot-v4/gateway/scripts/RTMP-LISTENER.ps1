param(
  [Parameter(Mandatory=$true)][string]$Ffmpeg,
  [Parameter(Mandatory=$true)][string]$WebRoot,
  [Parameter(Mandatory=$true)][int]$Port,
  [Parameter(Mandatory=$true)][string]$AppName,
  [Parameter(Mandatory=$true)][string]$StopFile,
  [Parameter(Mandatory=$true)][string]$LogFile
)
$ErrorActionPreference = 'Continue'
$liveDir = Join-Path $WebRoot 'live'
New-Item -ItemType Directory -Force -Path $liveDir | Out-Null

function Log([string]$message) {
  $line = "[{0}] {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $message
  Add-Content -LiteralPath $LogFile -Value $line -Encoding UTF8
}

Log "RTMP listener wrapper iniciado na porta $Port, app $AppName"
while (-not (Test-Path -LiteralPath $StopFile)) {
  try {
    Get-ChildItem -LiteralPath $liveDir -File -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
    $playlist = Join-Path $liveDir 'index.m3u8'
    $segmentPattern = Join-Path $liveDir 'segment_%06d.ts'
    $args = @(
      '-hide_banner','-loglevel','info',
      '-listen','1',
      '-i',"rtmp://0.0.0.0:$Port/$AppName",
      '-map','0:v:0','-an',
      '-c:v','libx264','-preset','ultrafast','-tune','zerolatency',
      '-pix_fmt','yuv420p','-profile:v','baseline','-level','4.1',
      '-g','30','-keyint_min','30','-sc_threshold','0',
      '-b:v','2500k','-maxrate','3000k','-bufsize','6000k',
      '-f','hls','-hls_time','1','-hls_list_size','6',
      '-hls_flags','delete_segments+append_list+omit_endlist+independent_segments',
      '-hls_segment_type','mpegts','-hls_segment_filename',$segmentPattern,$playlist
    )
    Log "Aguardando publicacao em rtmp://0.0.0.0:$Port/$AppName"
    & $Ffmpeg @args 2>&1 | ForEach-Object {
      $text = [string]$_
      Add-Content -LiteralPath $LogFile -Value $text -Encoding UTF8
    }
    $code = $LASTEXITCODE
    Log "FFmpeg encerrou com codigo $code. Reiniciando em 2 segundos."
  } catch {
    Log ("Erro do listener: " + $_.Exception.Message)
  }
  Start-Sleep -Seconds 2
}
Log 'RTMP listener wrapper encerrado pelo stop.flag.'
