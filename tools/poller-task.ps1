<#
  Stopping the poller task; dot-sourced by deploy.ps1 and poller-check.ps1
  (deploy.ps1 copies it into the run copy, beside the check). The task runs
  the poller in its own logon (S4U, session 0), and another logon of the same
  account can neither read the node process's command line nor open it
  (COLLECTOR-BUILD, 2026-11-11), so the poller is ended through Task
  Scheduler. Its stop takes read and execute on the task, which
  register-tasks.ps1 grants (IRegisteredTask::Stop, remarks:
  learn.microsoft.com/windows/win32/api/taskschd/nf-taskschd-iregisteredtask-stop).
#>

# Stops every running instance of $TaskName, then waits up to $Seconds until
# the task no longer runs and the node process named by $Var\poller.lock is
# gone (Get-Process -Id needs no access to the process). Returns whether both
# ended, and a summary for the logs.
function Stop-PollerTask([string]$TaskName, [string]$Var, [int]$Seconds = 30) {
  $nodePid = $null
  $lock = Join-Path $Var 'poller.lock'
  if ((Test-Path -LiteralPath $lock) -and ((Get-Content -LiteralPath $lock -Raw) -match '^\s*(\d{1,9})\s*$')) {
    $process = Get-Process -Id ([int]$Matches[1]) -ErrorAction SilentlyContinue
    if ($null -ne $process -and $process.ProcessName -eq 'node') { $nodePid = $process.Id }
  }
  $from = Get-Date
  Stop-ScheduledTask -TaskName $TaskName | Out-Null
  while ($true) {
    $taskState = (Get-ScheduledTask -TaskName $TaskName).State
    $nodeRuns = $null -ne $nodePid -and $null -ne (Get-Process -Id $nodePid -ErrorAction SilentlyContinue)
    $waited = ((Get-Date) - $from).TotalSeconds
    $ended = $taskState -ne 'Running' -and -not $nodeRuns
    if ($ended -or $waited -ge $Seconds) { break }
    Start-Sleep -Milliseconds 250
  }
  $node = if ($null -eq $nodePid) { 'the lock names no running node.exe' }
  elseif ($nodeRuns) { "node pid $nodePid still running" }
  else { "node pid $nodePid ended" }
  return [pscustomobject]@{
    ended   = $ended
    summary = "after $([math]::Round($waited, 1)) s the task is $taskState, $node"
  }
}
