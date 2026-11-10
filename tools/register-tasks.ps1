<#
  Registers the poller's two Windows tasks (COLLECTOR-PLAN section 1.4;
  decisions 2026-11-10, (8) and (9)). The OWNER runs it from an elevated
  PowerShell, after tools\deploy.ps1 has written the run copy:

      powershell -ExecutionPolicy Bypass -File E:\coding\polymarket-follow\tools\register-tasks.ps1

  Both tasks run as the owner's account "whether the user is logged on or
  not" without a stored password (S4U: local resources only, no window),
  run level Limited:
  - "polymarket-follow poller": at start-up after 1 minute; no time limit;
    one instance. Task Scheduler retries a start that fails to launch (every
    minute, up to 3 times); it does not look at the poller's exit code, so a
    crash or a hang is restarted by the check task.
  - "polymarket-follow poller check": at start-up after 3 minutes, and every
    5 minutes from now on, for ever; 2 minutes at most a run; one instance.
  The poller task also grants the registering account read and execute
  (GRGX): by default Task Scheduler gives a task's own user read only, and
  then neither the check task (run level Limited) nor tools\deploy.ps1 from
  a normal session could start it. One ACE is appended to the task's own
  security descriptor through RegisteredTask.SetSecurityDescriptor
  (learn.microsoft.com/windows/win32/taskschd/registeredtask-setsecuritydescriptor),
  on every run, since -Force re-registers the task; a grant already there is
  not added twice. The check task gets no grant.

  Running it again replaces the two tasks, also while the poller records.
  Microsoft's documentation does not say whether re-registering a task ends
  its running instance, so the poller task is started again at once after
  it is re-registered: a poller still running ignores the start (one
  instance), one that was ended comes back within seconds; after 15 s its
  heartbeat is read, and a stale one gets one more start. A second poller is
  refused anyway, by the launcher (its log is held: exit 4) or by the lock
  (exit 3). The script prints the poller's pid before and after.

  Undo: Unregister-ScheduledTask -TaskName 'polymarket-follow poller*' -Confirm
  removes both tasks, and the grant with them (it lives on the task). It
  leaves the run copy and its state (E:\polymarket-follow-run), the
  recordings (F:\polymarket-follow\recordings), the database
  polymarket_follow and its backups. Whether it also ends a poller that is
  running is not documented; one left running is ended by its full path:
  the node process whose command line holds E:\polymarket-follow-run\poller\dist\index.js.
#>
#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'task-access.ps1')
$Poller = 'polymarket-follow poller'
$run = 'E:\polymarket-follow-run\poller'
$heartbeat = 'E:\polymarket-follow-run\var\heartbeat.json'
foreach ($file in 'run-poller.cmd', 'poller-check.ps1', 'dist\index.js') {
  if (-not (Test-Path -LiteralPath (Join-Path $run $file))) {
    throw "missing $run\$file - run tools\deploy.ps1 first; nothing registered"
  }
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
  -ExecutionTimeLimit ([TimeSpan]::Zero) -MultipleInstances IgnoreNew
$pollerAction = New-ScheduledTaskAction -Execute (Join-Path $run 'run-poller.cmd') -WorkingDirectory $run
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

foreach ($name in $Poller, 'polymarket-follow poller check') {
  $task = Get-ScheduledTask -TaskName $name
  Write-Host "`n== $name - state $($task.State), logon $($task.Principal.LogonType), run level $($task.Principal.RunLevel)"
  foreach ($t in $task.Triggers) {
    Write-Host ("   trigger {0}: delay '{1}', repeat every '{2}' for '{3}' (empty = for ever)" -f `
      $t.CimClass.CimClassName, $t.Delay, $t.Repetition.Interval, $t.Repetition.Duration)
  }
  Write-Host "   action: $($task.Actions[0].Execute) $($task.Actions[0].Arguments)"
  Write-Host "   security: $($scheduler.GetFolder('\').GetTask($name).GetSecurityDescriptor(7))"
}
$pidBefore = if ($null -eq $before) { 'none' } else { $before.pid }
if ($null -eq $after -or $after.ageS -gt 20) {
  Write-Host "`nthe poller: pid $pidBefore before; NO fresh heartbeat now - see $heartbeat and ..\var\logs\stdout.log"
} elseif ($null -ne $before -and $after.pid -eq $before.pid) {
  Write-Host "`nthe poller kept running through the re-registration: pid $($after.pid), heartbeat $($after.ageS) s old"
} else {
  Write-Host "`nthe poller (re)started: pid $pidBefore before, $($after.pid) now, heartbeat $($after.ageS) s old"
}
