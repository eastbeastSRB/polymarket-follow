<#
  The poller's check (COLLECTOR-PLAN section 1.4 item 4), run from the run
  copy by the task "polymarket-follow poller check" at start-up and every
  5 minutes, outside the session. Task Scheduler restarts a crash, not a
  hang: if the heartbeat is older than 2 minutes (or missing), this ends the
  node process running THIS run copy's poller - found by its full script
  path, so no other program's node process can match - starts the poller
  task and appends a line to ..\var\check.log.
#>
$ErrorActionPreference = 'Stop'
$TaskName = 'polymarket-follow poller'
$StaleSeconds = 120

$poller = Join-Path $PSScriptRoot 'dist\index.js'
$var = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\var'))
$heartbeat = Join-Path $var 'heartbeat.json'
$checkLog = Join-Path $var 'check.log'

function Write-CheckLog([string]$text) {
  $stamp = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
  Add-Content -LiteralPath $checkLog -Value "$stamp $text" -Encoding UTF8
}

$age = $null
if (Test-Path -LiteralPath $heartbeat) {
  $written = (Get-Item -LiteralPath $heartbeat).LastWriteTimeUtc
  $age = ((Get-Date).ToUniversalTime() - $written).TotalSeconds
}
if ($null -ne $age -and $age -lt $StaleSeconds) { exit 0 }

$ended = @()
foreach ($p in Get-CimInstance Win32_Process -Filter "Name = 'node.exe'") {
  $line = $p.CommandLine
  if ($line -and $line.IndexOf($poller, [StringComparison]::OrdinalIgnoreCase) -ge 0) {
    Stop-Process -Id $p.ProcessId -Force
    $ended += $p.ProcessId
  }
}
# The ended poller's launcher exits right after it; until then a new start would be ignored.
if ($ended.Count -gt 0) {
  Wait-Process -Id $ended -Timeout 15 -ErrorAction SilentlyContinue
  Start-Sleep -Seconds 2
}
$ageText = if ($null -eq $age) { 'missing' } else { '{0:N0} s old' -f $age }
$what = "heartbeat $ageText; ended node process(es) [$($ended -join ', ')]"
try {
  Start-ScheduledTask -TaskName $TaskName
  Write-CheckLog "$what; started the poller task"
} catch {
  Write-CheckLog "$what; the poller task did not start: $($_.Exception.Message)"
  exit 1
}
