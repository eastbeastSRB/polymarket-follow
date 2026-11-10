@echo off
REM ---------------------------------------------------------------------------
REM  The poller, as the task "polymarket-follow poller" runs it: from the run
REM  copy (E:\polymarket-follow-run\poller\), never from the working tree, so a
REM  build in progress is never what a crash restart starts (polymarket-lab's
REM  run-worker.bat, adapted; COLLECTOR-PLAN section 1.4).
REM
REM  node.exe by its full path: a task outside the session may not see PATH.
REM  The script path is absolute too: the check task finds the poller's node
REM  process by it, and must never match another program's.
REM  Output and a crash's last words go to ..\var\logs\stdout.log; node's exit
REM  code is this script's, so Task Scheduler sees a failure. Arguments are
REM  passed on (a test run gives --run-for=<seconds>; the task gives none).
REM ---------------------------------------------------------------------------

setlocal
cd /d "%~dp0"
for %%I in ("%~dp0..\var") do set "STATE_DIR=%%~fI"
if not defined RECORDINGS_ROOT set "RECORDINGS_ROOT=F:\polymarket-follow\recordings"
if not exist "%STATE_DIR%\logs" mkdir "%STATE_DIR%\logs"
"C:\Program Files\nodejs\node.exe" "%~dp0dist\index.js" %* >> "%STATE_DIR%\logs\stdout.log" 2>&1
exit /b %ERRORLEVEL%
