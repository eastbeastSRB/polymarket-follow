<#
  Writes the run copy that the poller task runs (COLLECTOR-PLAN section 1.4,
  deviation D6): only a committed, clean working tree whose `pnpm verify` is
  green is deployed. The program and its production packages are built into
  <RunRoot>\poller.next and then replace <RunRoot>\poller; a poller running
  from the run copy is ended for the swap and its task started again after.
  The task is managed only when it runs this run copy (a scratch run root
  never touches it), and only from a session that may start it again:
  elevated, or one the task grants execute; otherwise nothing is deployed.
  Each deploy appends its reason to <RunRoot>\var\deploy.log: the time, the
  commit, the poller it ended. <RunRoot>\var is otherwise never touched.

  Usage, from any folder:  powershell -ExecutionPolicy Bypass -File tools\deploy.ps1
#>
param([string]$RunRoot = 'E:\polymarket-follow-run')
$ErrorActionPreference = 'Stop'
$TaskName = 'polymarket-follow poller'
$repo = Split-Path $PSScriptRoot -Parent
$target = Join-Path $RunRoot 'poller'
$next = Join-Path $RunRoot 'poller.next'
$old = Join-Path $RunRoot 'poller.old'

. (Join-Path $PSScriptRoot 'task-access.ps1')

# An elevated session may start any task (administrators have full access);
# otherwise the task must grant this account execute (register-tasks.ps1 does).
function Test-CanStartTask([string]$name) {
  $me = [Security.Principal.WindowsIdentity]::GetCurrent()
  $role = [Security.Principal.WindowsBuiltInRole]::Administrator
  if ((New-Object Security.Principal.WindowsPrincipal($me)).IsInRole($role)) { return $true }
  $scheduler = New-Object -ComObject Schedule.Service
  $scheduler.Connect()
  $sddl = $scheduler.GetFolder('\').GetTask($name).GetSecurityDescriptor(4)
  return Test-RunGranted $sddl $me.User.Value
}

$task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
$ours = $null -ne $task -and $task.Actions[0].Execute -ieq (Join-Path $target 'run-poller.cmd')
if ($ours -and -not (Test-CanStartTask $TaskName)) {
  throw "this session could not start the task '$TaskName' again after the swap (the task grants this account read only): deploy from an elevated PowerShell; nothing deployed"
}

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
  # pnpm 11 deploys a package that is not "injected" only with --legacy. Its
  # usual node_modules links by absolute paths, which the rename below would
  # break; a hoisted one is plain folders.
  pnpm --filter '@polymarket-follow/poller' --prod deploy --legacy --config.node-linker=hoisted $next
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

$wasRunning = $ours -and (Get-ScheduledTask -TaskName $TaskName).State -eq 'Running'
$poller = Join-Path $target 'dist\index.js'
$ended = @()
foreach ($p in Get-CimInstance Win32_Process -Filter "Name = 'node.exe'") {
  $line = $p.CommandLine
  if ($line -and $line.IndexOf($poller, [StringComparison]::OrdinalIgnoreCase) -ge 0) {
    Stop-Process -Id $p.ProcessId -Force
    $ended += $p.ProcessId
    Write-Host "ended the running poller (pid $($p.ProcessId)) for the swap"
  }
}
# A folder cannot be renamed while a process works in it: the ended poller's
# launcher leaves it a moment later; anything else (a window open in it) stops
# the deploy here, with the old copy still in place.
function Rename-Retrying([string]$path, [string]$newName) {
  for ($try = 1; ; $try++) {
    try {
      Rename-Item -LiteralPath $path -NewName $newName
      return
    } catch {
      if ($try -ge 20) {
        throw "could not rename $path ($($_.Exception.Message)); is a window or program open in it? Nothing was swapped; $next is kept."
      }
      Start-Sleep -Milliseconds 500
    }
  }
}
if (Test-Path -LiteralPath $old) { Remove-Item -Recurse -Force -LiteralPath $old }
if (Test-Path -LiteralPath $target) { Rename-Retrying $target 'poller.old' }
Rename-Retrying $next 'poller'

$var = Join-Path $RunRoot 'var'
New-Item -ItemType Directory -Force -Path $var | Out-Null
$stamp = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
$why = "deploy of $commit; ended poller pid(s) [$($ended -join ', ')] for the swap"
if ($wasRunning) {
  try {
    Start-ScheduledTask -TaskName $TaskName
  } catch {
    Add-Content -LiteralPath (Join-Path $var 'deploy.log') -Encoding UTF8 -Value "$stamp $why; the task did not start: $($_.Exception.Message)"
    throw
  }
  $why += "; started the task again"
  Write-Host "started the task '$TaskName' again"
}
Add-Content -LiteralPath (Join-Path $var 'deploy.log') -Encoding UTF8 -Value "$stamp $why"
Write-Host "deployed commit $commit to $target"
