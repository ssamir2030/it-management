@echo off
setlocal
TITLE IT Asset Agent Installer

:: --- CONFIGURATION ---
SET "INSTALL_DIR=C:\Program Files\ITAssetAgent"
SET "TASK_NAME=ITAssetDiscoveryAgent"
:: ---------------------

echo ========================================================
echo   IT Asset Management - Agent Installer
echo ========================================================
echo.

:: 0. Prompt for Server IP
echo [IMPORTANT] The Agent needs to know where the Server is located.
echo Please enter the IP Address and Port of your server (e.g. 192.168.1.10:3000)
echo Do NOT use 'localhost' if running on a client machine.
echo.
set /p "SERVER_IP=Enter Server IP and Port: "

:: Remove http:// if user added it, then add it back to ensure format
set "SERVER_IP=%SERVER_IP:http://=%"
set "SERVER_IP=%SERVER_IP:https://=%"
set "SERVER_URL=http://%SERVER_IP%"

echo.
echo [*] Target Server: %SERVER_URL%
echo [*] Verifying connectivity...

:: Simple connectivity check
powershell -Command "try { $r = Invoke-WebRequest -Uri '%SERVER_URL%/agent.ps1' -Method Head -TimeoutSec 3; exit 0 } catch { exit 1 }"
if %errorLevel% neq 0 (
    echo [ERROR] Could not connect to %SERVER_URL%. 
    echo Please check the IP address and firewall settings.
    echo.
    set /p "RETRY=Press Enter to exit..."
    exit /b 1
)
echo [OK] Connection successful!
echo.

:: 1. Check Administrator Privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Please run this script as Administrator.
    echo Right-click and choose "Run as administrator".
    pause
    exit /b 1
)

:: 2. Create Installation Directory
echo [*] Creating installation directory...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

:: 3. Download Agent Script
echo [*] Downloading Agent script from %SERVER_URL%...
powershell -Command "Invoke-WebRequest -Uri '%SERVER_URL%/agent.ps1' -OutFile '%INSTALL_DIR%\agent.ps1'"
if %errorLevel% neq 0 (
    echo [ERROR] Failed to download agent. Please check connectivity to %SERVER_URL%.
    pause
    exit /b 1
)

:: 4. Create Scheduled Task (Runs every 1 hour)
echo [*] Creating Scheduled Task '%TASK_NAME%'...
schtasks /create /tn "%TASK_NAME%" /tr "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File \"%INSTALL_DIR%\agent.ps1\" -ServerUrl \"%SERVER_URL%\"" /sc hourly /mo 1 /ru SYSTEM /f >nul

if %errorLevel% neq 0 (
    echo [WARNING] Could not create scheduled task. Attempting simple daily trigger...
    schtasks /create /tn "%TASK_NAME%" /tr "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File \"%INSTALL_DIR%\agent.ps1\"" /sc daily /ru SYSTEM /f
)

:: 5. Run Immediately
echo [*] Running initial discovery...
powershell -ExecutionPolicy Bypass -File "%INSTALL_DIR%\agent.ps1" -ServerUrl "%SERVER_URL%"

echo.
echo [SUCCESS] Agent installed and verified successfully!
echo The agent will run automatically in the background.
echo.
pause
