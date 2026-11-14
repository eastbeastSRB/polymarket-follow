<#
  Starts WAVE-H's download, tools\waveh-fetch.cjs, detached and at idle
  priority, so that it outlives the session that starts it (decisions
  2026-11-14, "WAVE-H's download spec", point 7). WMI's Win32_Process.Create
  starts it: the process is no child of this shell, and no job of the
  session can end it. A start is refused while the stop file is there or the
  tool runs (its pid file names a live process and was touched in the last
  3 minutes; the tool touches it every minute).

    powershell -NoProfile -ExecutionPolicy Bypass -File tools\waveh-fetch-start.ps1 -SizingOnly   the first session
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\waveh-fetch-start.ps1               the full run
    powershell -NoProfile -ExecutionPolicy Bypass -File tools\waveh-fetch-start.ps1 -Check        does it run?

  To stop it: New-Item -ItemType File <Store>\fetch\waveh-fetch.stop. It
  ends within a second and logs why; delete the file before the next start.
#>
param(
  [string]$Store = 'F:\polymarket-follow-research\WAVE-H\store',
  [string]$Heartbeat = 'E:\polymarket-follow-run\var\heartbeat.json',
  [switch]$SizingOnly,
  [int]$Rate = 0,
  [switch]$Check
)
$ErrorActionPreference = 'Stop'
$Store = $Store.TrimEnd('\')
$fetchDir = Join-Path $Store 'fetch'
$pidFile = Join-Path $fetchDir 'waveh-fetch.pid'
$stopFile = Join-Path $fetchDir 'waveh-fetch.stop'
$logDir = Join-Path $fetchDir 'log'

# The running tool's pid, or $null: the tool's own lock rule.
function Get-FetchPid {
  if (-not (Test-Path -LiteralPath $pidFile)) { return $null }
  $text = Get-Content -LiteralPath $pidFile -Raw
  if ($null -eq $text -or $text.Trim() -notmatch '^\d{1,9}$') { return $null }
  $age = [DateTime]::UtcNow - (Get-Item -LiteralPath $pidFile).LastWriteTimeUtc
  if ($age.TotalMinutes -ge 3) { return $null }
  if ($null -eq (Get-Process -Id ([int]$text.Trim()) -ErrorAction SilentlyContinue)) { return $null }
  return [int]$text.Trim()
}

if ($Check) {
  $running = Get-FetchPid
  if ($null -eq $running) {
    Write-Output 'waveh-fetch does not run'
  } else {
    $process = Get-Process -Id $running
    Write-Output "waveh-fetch runs: pid $running, priority $($process.PriorityClass), started $($process.StartTime.ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ'))"
  }
  if (Test-Path -LiteralPath $stopFile) { Write-Output "the stop file is there: $stopFile" }
  $log = Get-ChildItem -LiteralPath $logDir -Filter '*.jsonl' -ErrorAction SilentlyContinue | Sort-Object Name | Select-Object -Last 1
  if ($null -ne $log) {
    Write-Output "the last lines of $($log.FullName):"
    Get-Content -LiteralPath $log.FullName -Tail 5
  }
  exit 0
}

if (Test-Path -LiteralPath $stopFile) {
  Write-Output "Not started: the stop file is there ($stopFile). Delete it first if the download is to run again."
  exit 1
}
$running = Get-FetchPid
if ($null -ne $running) {
  Write-Output "Not started: waveh-fetch runs already, pid $running."
  exit 1
}
$node = (Get-Command node.exe -CommandType Application | Select-Object -First 1).Source
$arguments = @((Join-Path $PSScriptRoot 'waveh-fetch.cjs'), '--store', $Store, '--heartbeat', $Heartbeat)
if ($SizingOnly) { $arguments += '--sizing-only' }
if ($Rate -gt 0) { $arguments += @('--rate', "$Rate") }
$commandLine = (@($node) + $arguments | ForEach-Object { '"' + $_ + '"' }) -join ' '
# Idle (64) and hidden (0): the collector, at Task Scheduler's below normal, always comes first (D3).
$startup = New-CimInstance -CimClass (Get-CimClass -ClassName Win32_ProcessStartup) -ClientOnly -Property @{
  PriorityClass = [uint32]64
  ShowWindow    = [uint16]0
}
$created = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{
  CommandLine               = $commandLine
  CurrentDirectory          = (Split-Path -Parent $PSScriptRoot)
  ProcessStartupInformation = $startup
}
if ($created.ReturnValue -ne 0) {
  Write-Output "Not started: Win32_Process.Create returned $($created.ReturnValue)."
  exit 1
}
$newPid = [int]$created.ProcessId
$until = (Get-Date).AddSeconds(15)
while ((Get-Date) -lt $until) {
  if ((Get-FetchPid) -eq $newPid) {
    Write-Output "Started: waveh-fetch, pid $newPid, at idle priority; its log in $logDir."
    Write-Output "Check: tools\waveh-fetch-start.ps1 -Check -Store '$Store'"
    Write-Output "Stop: New-Item -ItemType File '$stopFile'"
    exit 0
  }
  if ($null -eq (Get-Process -Id $newPid -ErrorAction SilentlyContinue)) { break }
  Start-Sleep -Milliseconds 250
}
Write-Output "Not running: pid $newPid ended or took no lock within 15 s; read its log in $logDir."
exit 1
