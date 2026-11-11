<#
  The poller's check (COLLECTOR-PLAN section 1.4 item 4), run from the run
  copy by the task "polymarket-follow poller check" at start-up and every
  5 minutes, outside the session. Task Scheduler does not look at the
  poller's exit code, so it restarts neither a crash nor a hang: if the
  heartbeat is older than 2 minutes (or missing), this stops the poller task
  and waits for its node process to end (poller-task.ps1), starts the task
  again and appends a line to ..\var\check.log.
#>
$ErrorActionPreference = 'Stop'
$TaskName = 'polymarket-follow poller'
$StaleSeconds = 120

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

$ageText = if ($null -eq $age) { 'missing' } else { '{0:N0} s old' -f $age }
try {
  . (Join-Path $PSScriptRoot 'poller-task.ps1')
  # A start while the old instance still runs would be ignored (one instance).
  $stop = Stop-PollerTask $TaskName $var
  Start-ScheduledTask -TaskName $TaskName
} catch {
  Write-CheckLog "heartbeat $ageText; the poller task was not restarted: $($_.Exception.Message)"
  exit 1
}
if ($stop.ended) {
  Write-CheckLog "heartbeat $ageText; stopped the poller task: $($stop.summary); started it again"
  exit 0
}
Write-CheckLog "heartbeat $ageText; stopped the poller task, but $($stop.summary); started it anyway"
exit 1
