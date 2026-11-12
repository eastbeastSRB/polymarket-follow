<#
  Registers the poller's three Windows tasks (COLLECTOR-PLAN sections 1.4 and
  1.5; decisions 2026-11-10, (7) to (9)) and the paper experiment's (the
  paper plan's section 6). The OWNER runs it from an elevated PowerShell,
  after tools\deploy.ps1 has written the run copies (the experiment's with
  -Program paper):

      powershell -ExecutionPolicy Bypass -File E:\coding\polymarket-follow\tools\register-tasks.ps1

  All three run as the owner's account "whether the user is logged on or
  not" without a stored password (S4U: local resources only, no window),
  run level Limited:
  - "polymarket-follow poller": node.exe itself, by the absolute path found
    on this account's PATH now (printed, version 24 or later), runs the run
    copy's dist\index.js in the run copy's folder, whose .env holds its
    settings (tools\poller.env). No launcher: Task Scheduler's stop ends
    only the process it started, so node must be that process (a node
    started by cmd.exe outlived the stop, COLLECTOR-BUILD 2026-11-11). At
    start-up after 1 minute; no time limit; one instance. Task Scheduler
    retries a start that fails to launch (every minute, up to 3 times); it
    does not look at the poller's exit code, so a crash or a hang is
    restarted by the check task. Priority 4 (normal): at Task Scheduler's
    default, 7, a task runs below normal, and the poller then falls seconds
    behind its streams whenever the PC is busy (16 busy threads for 8 s:
    no book line for 7 s, COLLECTOR-REVIEW 2026-11-11 17:00Z;
    learn.microsoft.com/windows/win32/taskschd/tasksettings-priority). A
    poller already running keeps the priority it started with until its
    next start (the next deploy).
  - "polymarket-follow poller check": at start-up after 3 minutes, and every
    5 minutes from now on, for ever; 2 minutes at most a run; one instance.
  - "polymarket-follow backup": node.exe runs the run copy's backup.cjs
    daily at 05:20Z, the time computed from UTC (Get-DailyUtcStart) as the
    paper task's is, so a registration in summer time keeps it too; as soon
    as possible after a missed start; an hour at most a run; one instance.
  - "polymarket-follow paper": node.exe itself runs the experiment's own
    copy, E:\polymarket-follow-run\paper\dist\paper.js daily, in that folder;
    daily at 04:00Z, the time computed from UTC (Get-DailyUtcStart), never a
    local literal, which would move to 03:00Z inside the night pause after
    2027-03-28 (PAPER-PLAN-REVIEW F11); as soon as possible after a missed
    start; 36 hours at most a run (a first run is 16-26 h); a trigger met while
    a run goes on is ignored; priority 7, below the poller's 4. Nothing runs
    after the cut before the freeze: the program's gate refuses it.
  The poller task also grants the registering account read and execute
  (GRGX): by default Task Scheduler gives a task's own user read only, and
  then neither the check task (run level Limited) nor tools\deploy.ps1 from
  a normal session could start it. One ACE is appended to the task's own
  security descriptor through RegisteredTask.SetSecurityDescriptor
  (learn.microsoft.com/windows/win32/taskschd/registeredtask-setsecuritydescriptor),
  on every run, since -Force re-registers the task; a grant already there is
  not added twice. The check task gets no grant.

  Running it again replaces the three tasks, also while the poller records.
  Microsoft's documentation does not say whether re-registering a task ends
  its running instance, so the poller task is started again at once after
  it is re-registered: a poller still running ignores the start (one
  instance), one that was ended comes back within seconds; after 15 s its
  heartbeat is read, and a stale one gets one more start. A second poller is
  refused anyway, by the lock (exit 3). The script prints the poller's pid
  before and after.

  Undo: Stop-ScheduledTask -TaskName 'polymarket-follow poller' ends the
  poller; then Unregister-ScheduledTask -TaskName 'polymarket-follow *'
  -Confirm removes the three tasks, and the grant with them (it lives on the
  task). It leaves the run copy and its state (E:\polymarket-follow-run), the
  recordings (F:\polymarket-follow\recordings), the database
  polymarket_follow and its backups.
#>
#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'task-access.ps1')
$Poller = 'polymarket-follow poller'
$run = 'E:\polymarket-follow-run\poller'
$heartbeat = 'E:\polymarket-follow-run\var\heartbeat.json'
foreach ($file in '.env', 'poller-check.ps1', 'poller-task.ps1', 'backup.cjs', 'restore.cjs', 'dist\index.js') {
  if (-not (Test-Path -LiteralPath (Join-Path $run $file))) {
    throw "missing $run\$file - run tools\deploy.ps1 first; nothing registered"
  }
}
$paperRun = 'E:\polymarket-follow-run\paper'
foreach ($file in '.env', 'dist\paper.js', 'research\kit\check.mjs', 'experiment\rules.md') {
  if (-not (Test-Path -LiteralPath (Join-Path $paperRun $file))) {
    throw "missing $paperRun\$file - run tools\deploy.ps1 -Program paper first; nothing registered"
  }
}
$node = (Get-Command node.exe -CommandType Application -ErrorAction Stop | Select-Object -First 1).Source
$nodeVersion = & $node --version
if ([int]($nodeVersion -replace '^v(\d+)\..*$', '$1') -lt 24) {
  throw "node $nodeVersion at $node is older than 24 (the poller's engines); nothing registered"
}

# The poller's pid and the heartbeat's age in seconds, or $null without one.
# The poller replaces the file every 10 s, so a read can meet the swap: tried 3 times.
function Get-Heartbeat {
  for ($try = 1; $try -le 3; $try++) {
    try {
      $age = ((Get-Date).ToUniversalTime() - (Get-Item -LiteralPath $heartbeat).LastWriteTimeUtc).TotalSeconds
      return @{ pid = (Get-Content -LiteralPath $heartbeat -Raw | ConvertFrom-Json).pid; ageS = [int]$age }
    } catch {
      Start-Sleep -Milliseconds 300
    }
  }
  return $null
}

$user = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$principal = New-ScheduledTaskPrincipal -UserId $user -LogonType S4U -RunLevel Limited
$before = Get-Heartbeat

$pollerTrigger = New-ScheduledTaskTrigger -AtStartup
$pollerTrigger.Delay = 'PT1M'
$pollerSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
  -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) `
  -ExecutionTimeLimit ([TimeSpan]::Zero) -MultipleInstances IgnoreNew -Priority 4
$pollerAction = New-ScheduledTaskAction -Execute $node -Argument ('"{0}"' -f (Join-Path $run 'dist\index.js')) -WorkingDirectory $run
Register-ScheduledTask -TaskName $Poller -Force `
  -Description 'polymarket-follow: the poller (the collector). Watch-only; see the repository''s docs.' `
  -Action $pollerAction -Trigger $pollerTrigger -Principal $principal -Settings $pollerSettings | Out-Null

# Started again before anything else can fail (see the header).
Start-ScheduledTask -TaskName $Poller
Start-Sleep -Seconds 15
$after = Get-Heartbeat
if ($null -eq $after -or $after.ageS -gt 20) {
  Start-ScheduledTask -TaskName $Poller
  Start-Sleep -Seconds 15
  $after = Get-Heartbeat
}

$sid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value
$scheduler = New-Object -ComObject Schedule.Service
$scheduler.Connect()
$registered = $scheduler.GetFolder('\').GetTask($Poller)
$sddl = $registered.GetSecurityDescriptor(7)
if (-not (Test-RunGranted $sddl $sid)) {
  $registered.SetSecurityDescriptor("$sddl(A;;GRGX;;;$sid)", 0)
}

$checkAtStartup = New-ScheduledTaskTrigger -AtStartup
$checkAtStartup.Delay = 'PT3M'
$checkEvery5Min = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(5) `
  -RepetitionInterval (New-TimeSpan -Minutes 5)
$checkSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 2) -MultipleInstances IgnoreNew
$checkArguments = '-NoProfile -NonInteractive -ExecutionPolicy Bypass -File "{0}"' -f (Join-Path $run 'poller-check.ps1')
$checkAction = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument $checkArguments -WorkingDirectory $run
Register-ScheduledTask -TaskName 'polymarket-follow poller check' -Force `
  -Description 'polymarket-follow: restarts the poller when its heartbeat is older than 2 minutes.' `
  -Action $checkAction -Trigger @($checkAtStartup, $checkEvery5Min) -Principal $principal -Settings $checkSettings | Out-Null

$backupTrigger = New-ScheduledTaskTrigger -Daily -At (Get-DailyUtcStart 5 20)
$backupSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
  -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Hours 1) -MultipleInstances IgnoreNew
$backupAction = New-ScheduledTaskAction -Execute $node -Argument ('"{0}"' -f (Join-Path $run 'backup.cjs')) -WorkingDirectory $run
Register-ScheduledTask -TaskName 'polymarket-follow backup' -Force `
  -Description 'polymarket-follow: the database''s daily dump to F:, its newest copy on E: (see the repository''s docs).' `
  -Action $backupAction -Trigger $backupTrigger -Principal $principal -Settings $backupSettings | Out-Null

$paperTrigger = New-ScheduledTaskTrigger -Daily -At (Get-DailyUtcStart 4)
$paperSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
  -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Hours 36) -MultipleInstances IgnoreNew -Priority 7
$paperAction = New-ScheduledTaskAction -Execute $node -Argument ('"{0}" daily' -f (Join-Path $paperRun 'dist\paper.js')) -WorkingDirectory $paperRun
Register-ScheduledTask -TaskName 'polymarket-follow paper' -Force `
  -Description 'polymarket-follow: the paper experiment, once a day at 04:00Z (watch-only; see the repository''s docs).' `
  -Action $paperAction -Trigger $paperTrigger -Principal $principal -Settings $paperSettings | Out-Null

foreach ($name in $Poller, 'polymarket-follow poller check', 'polymarket-follow backup', 'polymarket-follow paper') {
  $task = Get-ScheduledTask -TaskName $name
  Write-Host "`n== $name - state $($task.State), logon $($task.Principal.LogonType), run level $($task.Principal.RunLevel), priority $($task.Settings.Priority)"
  foreach ($t in $task.Triggers) {
    Write-Host ("   trigger {0}: delay '{1}', repeat every '{2}' for '{3}' (empty = for ever)" -f `
      $t.CimClass.CimClassName, $t.Delay, $t.Repetition.Interval, $t.Repetition.Duration)
    if ($t.StartBoundary) { Write-Host "   starts $($t.StartBoundary)" }
  }
  Write-Host "   action: $($task.Actions[0].Execute) $($task.Actions[0].Arguments), in $($task.Actions[0].WorkingDirectory)"
  if ($name -eq $Poller) { Write-Host "   node: $node, $nodeVersion" }
  Write-Host "   security: $($scheduler.GetFolder('\').GetTask($name).GetSecurityDescriptor(7))"
}
$pidBefore = if ($null -eq $before) { 'none' } else { $before.pid }
if ($null -eq $after -or $after.ageS -gt 20) {
  Write-Host "`nthe poller: pid $pidBefore before; NO fresh heartbeat now - see $heartbeat, the poller's log in E:\polymarket-follow-run\var\logs and the task's last result (Get-ScheduledTaskInfo -TaskName '$Poller')"
} elseif ($null -ne $before -and $after.pid -eq $before.pid) {
  Write-Host "`nthe poller kept running through the re-registration: pid $($after.pid), heartbeat $($after.ageS) s old"
} else {
  Write-Host "`nthe poller (re)started: pid $pidBefore before, $($after.pid) now, heartbeat $($after.ageS) s old"
}
