@echo off
setlocal
cd /d "%~dp0"
if not exist node_modules call npm install
call npm run typecheck
if errorlevel 1 goto :error
call npm run build
if errorlevel 1 goto :error
echo.
echo Production build completed successfully.
pause
goto :end
:error
echo.
echo Build failed. Review the message above.
pause
:end
endlocal
