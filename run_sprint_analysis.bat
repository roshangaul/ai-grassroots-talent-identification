@echo off
setlocal
cd /d "%~dp0"

if not exist "videos" mkdir "videos"
if not exist "data" mkdir "data"
if not exist "results" mkdir "results"

set "PYTHON_EXE=py"
py --version >nul 2>&1
if errorlevel 1 (
  set "PYTHON_EXE=python"
  python --version >nul 2>&1
  if errorlevel 1 (
    set "PYTHON_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
    if not exist "%PYTHON_EXE%" (
      echo Python is not installed.
      echo Install Python 3.11 or newer, then run this file again.
      echo Download: https://www.python.org/downloads/
      pause
      exit /b 1
    )
  )
)

if not exist "videos\sprint.mp4" (
  echo Put your sprint video here first:
  echo %cd%\videos\sprint.mp4
  echo.
  echo Rename your video to sprint.mp4, then run this file again.
  pause
  exit /b 1
)

"%PYTHON_EXE%" python\ai_analysis\analyze_video.py --video videos\sprint.mp4 --test sprint --distance-m 50 --output results\sprint_result.json --csv data\tracked_keypoints.csv
echo.
pause
