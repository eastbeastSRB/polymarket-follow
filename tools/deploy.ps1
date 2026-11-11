<#
  Writes the run copy that the poller task runs (COLLECTOR-PLAN section 1.4,
  deviation D6): only a committed, clean working tree whose `pnpm verify` is
  green is deployed. The program, its production packages, its settings
  (tools\poller.env, as .env) and the check's scripts are built into
  <RunRoot>\poller.next; the new copy must load (started without its
  settings, it exits 2) before it replaces <RunRoot>\poller. When the task
  runs this run copy, the poller is stopped through the task for the swap
  (poller-task.ps1) and the task is started again after; if the poller's
  node process outlives the stop, the task is started again and nothing is
  swapped. A scratch run root never touches the task, and a poller started
  from it by hand needs its four settings in its environment (they win over
  the copy's .env). The task is managed only from a session that may stop
  and start it: elevated, or one the task grants execute; otherwise nothing
  is deployed.
  Each deploy appends its reason to <RunRoot>\var\deploy.log: the time, the
  commit, the poller it stopped, the seconds from the stop to the start.
  <RunRoot>\var is otherwise never touched.

  Usage, from any folder:  powershell -ExecutionPolicy Bypass -File tools\deploy.ps1
#>
param([string]$RunRoot = 'E:\polymarket-follow-run')
$ErrorActionPreference = 'Stop'
$TaskName = 'polymarket-follow poller'
$repo = Split-Path $PSScriptRoot -Parent
$target = Join-Path $RunRoot 'poller'
$next = Join-Path $RunRoot 'poller.next'
$old = Join-Path $RunRoot 'poller.old'
$var = Join-Path $RunRoot 'var'

. (Join-Path $PSScriptRoot 'task-access.ps1')
. (Join-Path $PSScriptRoot 'poller-task.ps1')

# Stopping and starting a task both take read and execute: an elevated session
# has them (administrators have full access); otherwise the task must grant
# this account execute (register-tasks.ps1 does).
function Test-CanStartTask([string]$name) {
  $me = [Security.Principal.WindowsIdentity]::GetCurrent()
  $role = [Security.Principal.WindowsBuiltInRole]::Administrator
  if ((New-Object Security.Principal.WindowsPrincipal($me)).IsInRole($role)) { return $true }
  $scheduler = New-Object -ComObject Schedule.Service
  $scheduler.Connect()
  $sddl = $scheduler.GetFolder('\').GetTask($name).GetSecurityDescriptor(4)
  return Test-RunGranted $sddl $me.User.Value
}

function Write-DeployLog([string]$text) {
  New-Item -ItemType Directory -Force -Path $var | Out-Null
  $stamp = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
  Add-Content -LiteralPath (Join-Path $var 'deploy.log') -Encoding UTF8 -Value "$stamp $text"
}

$task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
$ours = $null -ne $task -and "$($task.Actions[0].Arguments)".Trim().Trim('"') -ieq (Join-Path $target 'dist\index.js')
if ($ours -and -not (Test-CanStartTask $TaskName)) {
  throw "this session could not stop and start the task '$TaskName' for the swap (the task grants this account read only): deploy from an elevated PowerShell; nothing deployed"
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
  foreach ($file in 'poller-check.ps1', 'poller-task.ps1') {
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot $file) -Destination $next
  }
  Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'poller.env') -Destination (Join-Path $next '.env')
  Set-Content -LiteralPath (Join-Path $next 'DEPLOYED.txt') -Encoding ASCII -Value @(
    "commit $commit",
    "deployed $((Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ'))"
  )
} finally {
  Pop-Location
}

# The new copy must load before it replaces the old one: started once with
# none of its settings (its folder dist holds no .env, and the four are left
# out of its environment), it stops at its configuration with exit 2.
$smoke = New-Object System.Diagnostics.ProcessStartInfo
$smoke.FileName = (Get-Command node.exe -CommandType Application -ErrorAction Stop | Select-Object -First 1).Source
$smoke.Arguments = '"{0}"' -f (Join-Path $next 'dist\index.js')
$smoke.WorkingDirectory = Join-Path $next 'dist'
$smoke.UseShellExecute = $false
$smoke.RedirectStandardError = $true
foreach ($name in 'RECORDINGS_ROOT', 'STATE_DIR', 'MONGO_URI', 'MONGO_DB') { $smoke.EnvironmentVariables.Remove($name) }
$started = [System.Diagnostics.Process]::Start($smoke)
$stderr = $started.StandardError.ReadToEndAsync()
if (-not $started.WaitForExit(30000)) {
  $started.Kill()
  throw "the new copy did not stop within 30 s when started without its settings: nothing deployed; $next is kept"
}
if ($started.ExitCode -ne 2) {
  throw "the new copy does not load (exit $($started.ExitCode)): $($stderr.Result.Trim()) - nothing deployed; $next is kept"
}

# A folder cannot be renamed while a process works in it (the check task's
# run, every 5 minutes, takes about a second): retried for 10 s; anything
# else (a window open in it) stops the swap, with the old copy in place.
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
# Removed while the poller still runs, so it adds nothing to the gap.
if (Test-Path -LiteralPath $old) { Remove-Item -Recurse -Force -LiteralPath $old }

$why = "deploy of $commit"
$wasRunning = $ours -and (Get-ScheduledTask -TaskName $TaskName).State -eq 'Running'
if ($wasRunning) {
  $stoppedAt = Get-Date
  try {
    $stop = Stop-PollerTask $TaskName $var
    $failed = if ($stop.ended) { $null } else { "stopped the task, but $($stop.summary)" }
  } catch {
    $failed = "the task's stop failed: $($_.Exception.Message)"
  }
  if ($null -ne $failed) {
    # Whatever outlived the stop still runs the old copy and is left recording.
    $text = "$why refused: $failed"
    try {
      Start-ScheduledTask -TaskName $TaskName
      $text += '; started the task again'
    } catch {
      $text += "; the task did not start: $($_.Exception.Message)"
    }
    Write-DeployLog "$text; nothing swapped"
    throw "$text; nothing swapped; $next is kept"
  }
  $why += "; stopped the task: $($stop.summary)"
}

$swapError = $null
try {
  if (Test-Path -LiteralPath $target) { Rename-Retrying $target 'poller.old' }
  try {
    Rename-Retrying $next 'poller'
  } catch {
    # The old copy goes back, so the task starts what it ran before.
    if (Test-Path -LiteralPath $old) { Rename-Item -LiteralPath $old -NewName 'poller' }
    throw
  }
} catch {
  $swapError = $_.Exception.Message
}
$why += if ($null -eq $swapError) { '; swapped' } else { "; NOT swapped: $swapError" }
if ($wasRunning) {
  try {
    Start-ScheduledTask -TaskName $TaskName
  } catch {
    Write-DeployLog "$why; the task did not start: $($_.Exception.Message)"
    throw
  }
  $why += "; started the task again $([math]::Round(((Get-Date) - $stoppedAt).TotalSeconds, 1)) s after its stop"
  Write-Host "started the task '$TaskName' again"
}
Write-DeployLog $why
if ($null -ne $swapError) { throw $swapError }
Write-Host "deployed commit $commit to $target"
