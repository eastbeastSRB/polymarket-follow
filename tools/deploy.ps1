<#
  Writes the run copy that the poller task runs (COLLECTOR-PLAN section 1.4,
  deviation D6): only a committed, clean working tree whose `pnpm verify` is
  green is deployed. The program, its production packages, its settings
  (tools\poller.env, as .env), the check's scripts and the backup's are built into
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

  -Program paper writes the paper experiment's own copy, <RunRoot>\paper,
  from the same verified build plus apps\poller\research and
  apps\poller\experiment (byte copies: their files are frozen by hash), so
  a collector deploy never changes what the experiment runs, nor waits for
  one of its runs (PAPER-PLAN-REVIEW F11). Its smoke: dist\paper.js without
  settings exits 2, and research\kit\check.mjs returns the kit's pinned
  fingerprint. It refuses while the task "polymarket-follow paper" runs; it
  stops and starts no task.

  Usage, from any folder:  powershell -ExecutionPolicy Bypass -File tools\deploy.ps1 [-Program paper]
#>
param(
  [string]$RunRoot = 'E:\polymarket-follow-run',
  [ValidateSet('poller', 'paper')][string]$Program = 'poller'
)
$ErrorActionPreference = 'Stop'
$paper = $Program -eq 'paper'
$TaskName = if ($paper) { 'polymarket-follow paper' } else { 'polymarket-follow poller' }
$entry = if ($paper) { 'dist\paper.js' } else { 'dist\index.js' }
$KitFingerprint = '2d3667b5ce90645b41dfee4e6fc425ab3e64c985cb4973bfed6ece5052c409aa'
$repo = Split-Path $PSScriptRoot -Parent
$target = Join-Path $RunRoot $Program
$next = Join-Path $RunRoot "$Program.next"
$old = Join-Path $RunRoot "$Program.old"
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
$ours = $null -ne $task -and "$($task.Actions[0].Arguments)".Trim().Trim('"').StartsWith((Join-Path $target $entry), [StringComparison]::OrdinalIgnoreCase)
if ($paper -and $ours -and $task.State -eq 'Running') {
  throw "the task '$TaskName' is running: deploy after its run ends; nothing deployed"
}
if (-not $paper -and $ours -and -not (Test-CanStartTask $TaskName)) {
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
  if ($paper) {
    # Byte copies (Copy-Item never re-encodes): their hashes are frozen.
    foreach ($dir in 'research', 'experiment') {
      Copy-Item -LiteralPath (Join-Path $repo "apps\poller\$dir") -Destination (Join-Path $next $dir) -Recurse
    }
  } else {
    foreach ($file in 'poller-check.ps1', 'poller-task.ps1', 'backup.cjs', 'restore.cjs') {
      Copy-Item -LiteralPath (Join-Path $PSScriptRoot $file) -Destination $next
    }
  }
  Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'poller.env') -Destination (Join-Path $next '.env')
  $typescript = (Get-Content -LiteralPath (Join-Path $repo 'apps\poller\node_modules\typescript\package.json') -Raw | ConvertFrom-Json).version
  $lockHash = (Get-FileHash -LiteralPath (Join-Path $repo 'pnpm-lock.yaml') -Algorithm SHA256).Hash.ToLowerInvariant()
  Set-Content -LiteralPath (Join-Path $next 'DEPLOYED.txt') -Encoding ASCII -Value @(
    "commit $commit",
    "deployed $((Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ'))",
    "typescript $typescript",
    "pnpm-lock.yaml sha256 $lockHash"
  )
} finally {
  Pop-Location
}

# The new copy must load before it replaces the old one: started once with
# none of its settings (its folder dist holds no .env, and the four are left
# out of its environment), it stops at its configuration with exit 2.
$smoke = New-Object System.Diagnostics.ProcessStartInfo
$smoke.FileName = (Get-Command node.exe -CommandType Application -ErrorAction Stop | Select-Object -First 1).Source
$smoke.Arguments = '"{0}"' -f (Join-Path $next $entry)
$smoke.WorkingDirectory = Join-Path $next 'dist'
$smoke.UseShellExecute = $false
$smoke.RedirectStandardError = $true
foreach ($name in 'RECORDINGS_ROOT', 'STATE_DIR', 'MONGO_URI', 'MONGO_DB', 'PAPER_ROOT') { $smoke.EnvironmentVariables.Remove($name) }
$started = [System.Diagnostics.Process]::Start($smoke)
$stderr = $started.StandardError.ReadToEndAsync()
if (-not $started.WaitForExit(30000)) {
  $started.Kill()
  throw "the new copy did not stop within 30 s when started without its settings: nothing deployed; $next is kept"
}
if ($started.ExitCode -ne 2) {
  throw "the new copy does not load (exit $($started.ExitCode)): $($stderr.Result.Trim()) - nothing deployed; $next is kept"
}
if ($paper) {
  # The kit's own check on the copy: every vendored file byte for byte.
  $check = New-Object System.Diagnostics.ProcessStartInfo
  $check.FileName = $smoke.FileName
  $kitUrl = ([Uri](Join-Path $next 'research\kit\check.mjs')).AbsoluteUri
  $check.Arguments = '-e "import(process.argv[1]).then((m) => process.stdout.write(m.checkKit()))" "{0}"' -f $kitUrl
  $check.UseShellExecute = $false
  $check.RedirectStandardOutput = $true
  $check.RedirectStandardError = $true
  $ran = [System.Diagnostics.Process]::Start($check)
  $out = $ran.StandardOutput.ReadToEndAsync()
  $err = $ran.StandardError.ReadToEndAsync()
  if (-not $ran.WaitForExit(30000)) { $ran.Kill(); throw "the kit's check did not end within 30 s: nothing deployed; $next is kept" }
  if ($out.Result.Trim() -ne $KitFingerprint) {
    throw "the copy's kit is not the pinned one ($($out.Result.Trim()) $($err.Result.Trim())): nothing deployed; $next is kept"
  }
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

$why = "deploy of $commit ($Program)"
$wasRunning = -not $paper -and $ours -and (Get-ScheduledTask -TaskName $TaskName).State -eq 'Running'
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
  if (Test-Path -LiteralPath $target) { Rename-Retrying $target "$Program.old" }
  try {
    Rename-Retrying $next $Program
  } catch {
    # The old copy goes back, so the task starts what it ran before.
    if (Test-Path -LiteralPath $old) { Rename-Item -LiteralPath $old -NewName $Program }
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
