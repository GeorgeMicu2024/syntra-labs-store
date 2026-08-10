@echo off
setlocal
cd /d "%~dp0"
echo.
echo ==========================================
echo   SYNTRA LABS V10 PRODUCTION CHECK
echo ==========================================
echo.
call npm install
if errorlevel 1 goto :error
echo Running TypeScript check...
call npm run typecheck
if errorlevel 1 goto :error
echo Running Next.js production build...
call npm run build
if errorlevel 1 goto :error
echo.
echo Production checks completed successfully.
pause
goto :end
:error
echo.
echo Production check failed. Review the message above.
pause
:end
endlocal
