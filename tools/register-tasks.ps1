<#
  Registers the poller's two Windows tasks (COLLECTOR-PLAN section 1.4;
  decisions 2026-11-10, (8) and (9)). The OWNER runs it once, from an
  elevated PowerShell, after tools\deploy.ps1 has written the run copy:

      powershell -ExecutionPolicy Bypass -File E:\coding\polymarket-follow\tools\register-tasks.ps1

  Both tasks run as the owner's account "whether the user is logged on or
  not" without a stored password (S4U: local resources only, no window),
  run level Limited:
  - "polymarket-follow poller": at start-up after 1 minute; restarted every
    minute up to 3 times after a failure; no time limit; one instance.
  - "polymarket-follow poller check": at start-up after 3 minutes, and every
    5 minutes from now on, for ever; 2 minutes at most a run; one instance.
  Then it starts the poller at once (no restart of the PC is needed) and
  prints both tasks as registered. Running it again replaces the two tasks.
  Undo: Unregister-ScheduledTask -TaskName 'polymarket-follow poller*' -Confirm
#>
#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
$run = 'E:\polymarket-follow-run\poller'
foreach ($file in 'run-poller.cmd', 'poller-check.ps1', 'dist\index.js') {
  if (-not (Test-Path -LiteralPath (Join-Path $run $file))) {
    throw "missing $run\$file - run tools\deploy.ps1 first; nothing registered"
  }
}
$user = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$principal = New-ScheduledTaskPrincipal -UserId $user -LogonType S4U -RunLevel Limited

$pollerTrigger = New-ScheduledTaskTrigger -AtStartup
$pollerTrigger.Delay = 'PT1M'
$pollerSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
  -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) `
  -ExecutionTimeLimit ([TimeSpan]::Zero) -MultipleInstances IgnoreNew
$pollerAction = New-ScheduledTaskAction -Execute (Join-Path $run 'run-poller.cmd') -WorkingDirectory $run
Register-ScheduledTask -TaskName 'polymarket-follow poller' -Force `
  -Description 'polymarket-follow: the poller (the collector). Watch-only; see the repository''s docs.' `
  -Action $pollerAction -Trigger $pollerTrigger -Principal $principal -Settings $pollerSettings | Out-Null

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

Start-ScheduledTask -TaskName 'polymarket-follow poller'

foreach ($name in 'polymarket-follow poller', 'polymarket-follow poller check') {
  $task = Get-ScheduledTask -TaskName $name
  Write-Host "`n== $name - state $($task.State), logon $($task.Principal.LogonType), run level $($task.Principal.RunLevel)"
  foreach ($t in $task.Triggers) {
    Write-Host ("   trigger {0}: delay '{1}', repeat every '{2}' for '{3}' (empty = for ever)" -f `
      $t.CimClass.CimClassName, $t.Delay, $t.Repetition.Interval, $t.Repetition.Duration)
  }
  Write-Host "   action: $($task.Actions[0].Execute) $($task.Actions[0].Arguments)"
}
