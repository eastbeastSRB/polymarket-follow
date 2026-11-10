<#
  Writes the run copy that the poller task runs (COLLECTOR-PLAN section 1.4,
  deviation D6): only a committed, clean working tree whose `pnpm verify` is
  green is deployed. The program and its production packages are built into
  <RunRoot>\poller.next and then replace <RunRoot>\poller; a poller running
  from the run copy is ended for the swap and its task started again after.
  <RunRoot>\var (heartbeat, lock, logs) is never touched.

  Usage, from any folder:  powershell -ExecutionPolicy Bypass -File tools\deploy.ps1
#>
param([string]$RunRoot = 'E:\polymarket-follow-run')
$ErrorActionPreference = 'Stop'
$TaskName = 'polymarket-follow poller'
$repo = Split-Path $PSScriptRoot -Parent
$target = Join-Path $RunRoot 'poller'
$next = Join-Path $RunRoot 'poller.next'
$old = Join-Path $RunRoot 'poller.old'

Push-Location $repo
try {
  $dirty = git status --porcelain
  if ($LASTEXITCODE -ne 0) { throw 'git status failed: nothing deployed' }
  if ($dirty) { throw "the working tree is not clean: commit first; nothing deployed`n$dirty" }
  $commit = git rev-parse HEAD

  Remove-Item -Recurse -Force (Join-Path $repo 'apps\poller\dist') -ErrorAction SilentlyContinue
  pnpm verify
  if ($LASTEXITCODE -ne 0) { throw "pnpm verify failed ($LASTEXITCODE): nothing deployed" }

  if (Test-Path -LiteralPath $next) { Remove-Item -Recurse -Force -LiteralPath $next }
  # pnpm 11 deploys a package that is not "injected" only with --legacy.
  pnpm --filter '@polymarket-follow/poller' --prod deploy --legacy $next
  if ($LASTEXITCODE -ne 0) { throw "pnpm deploy failed ($LASTEXITCODE): nothing deployed" }
  # The deploy records its --prod install as the workspace's own, and the next
  # pnpm command would then remove the development packages: install again.
  pnpm install --frozen-lockfile --offline
  if ($LASTEXITCODE -ne 0) { throw "pnpm install after the deploy failed ($LASTEXITCODE)" }
  Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'run-poller.cmd') -Destination $next
  Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'poller-check.ps1') -Destination $next
  Set-Content -LiteralPath (Join-Path $next 'DEPLOYED.txt') -Encoding ASCII -Value @(
    "commit $commit",
    "deployed $((Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ'))"
  )
} finally {
  Pop-Location
}

$task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
$wasRunning = $null -ne $task -and $task.State -eq 'Running'
$poller = Join-Path $target 'dist\index.js'
foreach ($p in Get-CimInstance Win32_Process -Filter "Name = 'node.exe'") {
  $line = $p.CommandLine
  if ($line -and $line.IndexOf($poller, [StringComparison]::OrdinalIgnoreCase) -ge 0) {
    Stop-Process -Id $p.ProcessId -Force
    Write-Host "ended the running poller (pid $($p.ProcessId)) for the swap"
  }
}
Start-Sleep -Seconds 1
if (Test-Path -LiteralPath $old) { Remove-Item -Recurse -Force -LiteralPath $old }
if (Test-Path -LiteralPath $target) { Rename-Item -LiteralPath $target -NewName 'poller.old' }
Rename-Item -LiteralPath $next -NewName 'poller'
if ($wasRunning) {
  Start-ScheduledTask -TaskName $TaskName
  Write-Host "started the task '$TaskName' again"
}
Write-Host "deployed commit $commit to $target"
