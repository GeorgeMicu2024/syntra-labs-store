@echo off
setlocal
cd /d "%~dp0"
echo.
echo ==========================================
echo   SYNTRA LABS PROFESSIONAL V6
echo ==========================================
echo.
if not exist node_modules (
  echo Installing project dependencies...
  call npm install
  if errorlevel 1 goto :error
)
echo Starting local development server...
call npm run dev
if errorlevel 1 goto :error
goto :end
:error
echo.
echo Something failed. Review the message above.
pause
:end
endlocal
