<#
  Who may start a scheduled task, and a daily trigger's time; dot-sourced by
  deploy.ps1 and register-tasks.ps1. Task Scheduler gives a task's own user
  read only (FR) unless granted more, and starting a task takes execute.
#>

# Today's $HourUtc:00Z as a local DateTime. New-ScheduledTaskTrigger -Daily -At
# keeps a daily trigger's time in UTC, so the task runs at $HourUtc:00Z all year;
# a local literal typed now would mean another UTC hour after the next change of
# the clock (PAPER-PLAN-REVIEW F11).
function Get-DailyUtcStart([int]$HourUtc) {
  return [DateTime]::SpecifyKind([DateTime]::UtcNow.Date.AddHours($HourUtc), [DateTimeKind]::Utc).ToLocalTime()
}

# True when $sddl holds an allow ACE granting $sid execute: GA, GX, FA or FX
# (no SDDL right ends in G or F, so these never match across two rights), or
# a mask with FILE_EXECUTE (0x20) or GENERIC_EXECUTE (0x20000000).
function Test-RunGranted([string]$sddl, [string]$sid) {
  foreach ($ace in [regex]::Matches($sddl, '\(A;[^;]*;([^;]*);[^;]*;[^;]*;([^)]*)\)')) {
    if ($ace.Groups[2].Value -ne $sid) { continue }
    $rights = $ace.Groups[1].Value
    if ($rights -match '^0x[0-9a-fA-F]+$') {
      if (([Convert]::ToInt64($rights.Substring(2), 16) -band 0x20000020) -ne 0) { return $true }
    } elseif ($rights -match 'GA|GX|FA|FX') {
      return $true
    }
  }
  return $false
}
