<#
.SYNOPSIS
    IT Asset Agent Installer v2.0
    
.PARAMETER ServerUrl
    Server URL (e.g., http://192.168.100.15:4002)
    
.PARAMETER Uninstall
    Remove the agent
#>

param (
    [string]$ServerUrl = "http://YOUR_SERVER:4002",
    [switch]$Uninstall = $false
)

$ErrorActionPreference = "Stop"

$TaskName = "ITAssetAgent"
$InstallDir = "$env:ProgramData\ITAssetAgent"
$AgentScript = "$InstallDir\agent.ps1"
$LogFile = "$InstallDir\agent.log"

# Check Admin
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "Run as Administrator!"
    Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" -ServerUrl `"$ServerUrl`"" -Verb RunAs
    exit
}

Write-Host "`n=== IT Asset Agent Installer ===" -ForegroundColor Cyan

# UNINSTALL
if ($Uninstall) {
    Write-Host "Uninstalling..." -ForegroundColor Yellow
    $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($task) {
        Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Host "[OK] Task removed" -ForegroundColor Green
    }
    if (Test-Path $InstallDir) {
        Remove-Item -Path $InstallDir -Recurse -Force
        Write-Host "[OK] Files removed" -ForegroundColor Green
    }
    Write-Host "`nUninstall complete!`n" -ForegroundColor Green
    exit
}

# INSTALL
if ($ServerUrl -eq "http://YOUR_SERVER:4002") {
    Write-Host "ERROR: Specify -ServerUrl" -ForegroundColor Red
    Write-Host "Example: .\AgentInstaller.ps1 -ServerUrl 'http://192.168.1.100:4002'" -ForegroundColor Yellow
    exit 1
}

Write-Host "Server: $ServerUrl" -ForegroundColor Cyan

# Step 1: Create directory
Write-Host "[1/4] Creating directory..." -ForegroundColor Yellow
if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}
Write-Host "[OK] Directory created" -ForegroundColor Green

# Step 2: Download agent
Write-Host "[2/4] Downloading agent..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri "$ServerUrl/agent.ps1" -OutFile $AgentScript -TimeoutSec 30
    Write-Host "[OK] Agent downloaded" -ForegroundColor Green
}
catch {
    Write-Host "[FAIL] Download failed: $_" -ForegroundColor Red
    Write-Host "Make sure server is running at: $ServerUrl" -ForegroundColor Yellow
    exit 1
}

# Step 3: Create wrapper
$Wrapper = "$InstallDir\run-agent.ps1"
@"
Set-Location "$InstallDir"
& "$AgentScript" -ServerUrl "$ServerUrl" *>> "$LogFile"
"@ | Set-Content $Wrapper -Force

# Step 4: Create scheduled task
Write-Host "[3/4] Creating scheduled task..." -ForegroundColor Yellow

$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
    Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

$Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$Wrapper`""
$Trigger = New-ScheduledTaskTrigger -AtStartup
$Principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 5)

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Principal $Principal -Settings $Settings -Description "IT Asset Agent" | Out-Null
Write-Host "[OK] Task created" -ForegroundColor Green

# Step 5: Start now
Write-Host "[4/4] Starting agent..." -ForegroundColor Yellow
Start-ScheduledTask -TaskName $TaskName
Start-Sleep -Seconds 2
Write-Host "[OK] Agent started" -ForegroundColor Green

Write-Host "`n=== Installation Complete ===" -ForegroundColor Green
Write-Host "Directory: $InstallDir"
Write-Host "Server: $ServerUrl"
Write-Host "Log: $LogFile"
Write-Host "`nCommands:"
Write-Host "  View log: Get-Content '$LogFile' -Tail 20"
Write-Host "  Uninstall: .\AgentInstaller.ps1 -Uninstall"
Write-Host ""
