<#
.SYNOPSIS
    IT Asset Agent v2.0 with AgentKey
    
.PARAMETER ServerUrl
    Server URL

.PARAMETER PollingInterval
    Poll interval in seconds (default: 30)

.PARAMETER RunOnce
    Run once and exit
#>

param (
    [string]$ServerUrl = "http://localhost:4002",
    [int]$PollingInterval = 30,
    [switch]$RunOnce = $false
)

$ErrorActionPreference = "SilentlyContinue"
$AgentKeyFile = "$env:ProgramData\ITAssetAgent\agentkey.txt"
$AgentDir = "$env:ProgramData\ITAssetAgent"

function Write-Log { param($msg, $color = "White") Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $msg" -ForegroundColor $color }

# Check Admin
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" -ServerUrl `"$ServerUrl`"" -Verb RunAs
    exit
}

Write-Host "`n=== IT Asset Agent v2.0 ===" -ForegroundColor Cyan

# Get or create AgentKey
function Get-AgentKey {
    if (-not (Test-Path $AgentDir)) { New-Item -ItemType Directory -Path $AgentDir -Force | Out-Null }
    if (Test-Path $AgentKeyFile) {
        $key = (Get-Content $AgentKeyFile -Raw).Trim()
        if ($key.Length -gt 0) { Write-Log "AgentKey loaded" "Green"; return $key }
    }
    $newKey = [System.Guid]::NewGuid().ToString()
    $newKey | Set-Content $AgentKeyFile -Force
    Write-Log "New AgentKey: $($newKey.Substring(0,8))..." "Yellow"
    return $newKey
}

$AgentKey = Get-AgentKey
Write-Log "AgentKey: $($AgentKey.Substring(0,8))..." "Cyan"

# Collect device info
function Get-DeviceInfo {
    Write-Log "Collecting info..." "Yellow"
    
    try { $osInfo = Get-CimInstance Win32_OperatingSystem; $os = $osInfo.Caption; $ram = "{0:N2} GB" -f (($osInfo.TotalVisibleMemorySize * 1024) / 1GB) }
    catch { $os = "Unknown"; $ram = "Unknown" }
    
    try { $cpu = (Get-CimInstance Win32_Processor).Name } catch { $cpu = "Unknown" }
    
    try {
        $cs = Get-CimInstance Win32_ComputerSystem
        $bios = Get-CimInstance Win32_BIOS
        $manufacturer = $cs.Manufacturer; $model = $cs.Model; $serial = $bios.SerialNumber
        $username = if ($cs.UserName) { $cs.UserName } else { $env:USERNAME }
    }
    catch { $manufacturer = "-"; $model = "-"; $serial = "-"; $username = "-" }
    
    try {
        $disks = @(Get-CimInstance Win32_LogicalDisk | Where-Object { $_.DriveType -eq 3 } | ForEach-Object {
                @{ drive = $_.DeviceID; size = "{0:N2} GB" -f ($_.Size / 1GB); free = "{0:N2} GB" -f ($_.FreeSpace / 1GB) }
            })
    }
    catch { $disks = @() }
    
    $ipConfig = Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway -ne $null -and $_.NetAdapter.Status -eq "Up" } | Select-Object -First 1
    $ip = $ipConfig.IPv4Address.IPAddress; $mac = $ipConfig.NetAdapter.MacAddress

    return @{
        agentKey = $AgentKey; hostname = $env:COMPUTERNAME; ip = $ip; mac = $mac
        os = $os; cpu = $cpu; ram = $ram; serial = $serial
        manufacturer = $manufacturer; model = $model; username = $username; disks = $disks
    }
}

# Register with server
function Send-DeviceInfo {
    param($info)
    $endpoint = "$ServerUrl/api/discovery/agent"
    Write-Log "Registering..." "Yellow"
    try {
        $resp = Invoke-RestMethod -Uri $endpoint -Method Post -Body ($info | ConvertTo-Json -Depth 3) -ContentType "application/json" -TimeoutSec 30
        if ($resp.success) { Write-Log "Registered!" "Green"; return $true }
        else { Write-Log "Error: $($resp.error)" "Red"; return $false }
    }
    catch { Write-Log "Connection failed: $_" "Red"; return $false }
}

# Poll for commands
function Get-Commands {
    $endpoint = "$ServerUrl/api/automation/commands?agentKey=$AgentKey"
    Write-Log "Polling..." "DarkGray"
    try {
        $resp = Invoke-RestMethod -Uri $endpoint -Method Get -TimeoutSec 10
        
        # Ensure we treat commands as array
        if ($resp.commands) {
            $cmds = @($resp.commands)
        }
        else {
            $cmds = @()
        }
        
        Write-Log "Found $($cmds.Count) command(s)" "DarkGray"
        
        # Return commands if we have any, regardless of 'success' flag nuance
        if ($cmds.Count -gt 0) { 
            return $cmds 
        }
    }
    catch { Write-Log "Poll failed: $_" "Red" }
    return @()
}

# File System Helper
function Get-FileSystemItems {
    param($Path)
    $items = @()
    
    # Handle Drives request
    if ($Path -eq "/" -or $Path -eq "" -or $Path -eq "ROOT") {
        $drives = Get-PSDrive -PSProvider FileSystem
        foreach ($d in $drives) {
            $items += @{
                name     = $d.Name
                path     = $d.Root
                type     = "drive"
                size     = if ($d.Used) { "{0:N2} GB" -f ($d.Used / 1GB) } else { "" }
                modified = ""
            }
        }
    }
    else {
        try {
            $dirItems = Get-ChildItem -Path $Path -ErrorAction Stop
            foreach ($i in $dirItems) {
                $type = if ($i.PSIsContainer) { "folder" } else { "file" }
                $size = if (-not $i.PSIsContainer) { "{0:N2} KB" -f ($i.Length / 1KB) } else { "" }
                $items += @{
                    name     = $i.Name
                    path     = $i.FullName
                    type     = $type
                    size     = $size
                    modified = $i.LastWriteTime.ToString("yyyy-MM-dd HH:mm")
                }
            }
        }
        catch {
            return @{ error = $_.Exception.Message }
        }
    }
    return $items
}

# Execute command
function Invoke-Cmd {
    param($id, $script)
    Write-Log "Executing: $($script.Substring(0, [Math]::Min(40, $script.Length)))..." "Cyan"
    $result = @{ commandId = $id; success = $false; result = ""; error = "" }
    try {
        $output = Invoke-Expression $script 2>&1 | Out-String
        $result.success = $true; $result.result = $output.Trim()
        Write-Log "Done!" "Green"
    }
    catch {
        $result.error = $_.Exception.Message
        Write-Log "Failed: $($_.Exception.Message)" "Red"
    }
    return $result
}

# Send result
function Send-Result {
    param($result)
    $endpoint = "$ServerUrl/api/automation/commands"
    try {
        Invoke-RestMethod -Uri $endpoint -Method Post -Body ($result | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 30 | Out-Null
        Write-Log "Result sent" "Green"
    }
    catch { Write-Log "Send failed: $_" "Red" }
}

# Main
$deviceInfo = Get-DeviceInfo
Write-Log "Device: $($deviceInfo.hostname) ($($deviceInfo.ip))" "Green"
Send-DeviceInfo $deviceInfo | Out-Null

if ($RunOnce) { Write-Log "RunOnce - Exit" "Yellow"; exit }

Write-Host "`n--- Polling every $PollingInterval sec (Ctrl+C to stop) ---`n" -ForegroundColor DarkGray
$lastHB = Get-Date

while ($true) {
    if ((Get-Date) - $lastHB -gt [TimeSpan]::FromMinutes(5)) {
        $deviceInfo = Get-DeviceInfo
        Send-DeviceInfo $deviceInfo | Out-Null
        $lastHB = Get-Date
    }
    
    $cmds = @(Get-Commands)
    if ($cmds.Count -gt 0) {
        Write-Log "Received $($cmds.Count) command(s)!" "Yellow"
        foreach ($cmd in $cmds) {
            # Handle Internal Commands
            if ($cmd.command -match "^SET_POLLING (\d+)") {
                $PollingInterval = [int]$matches[1]
                Write-Log "Polling interval changed to $PollingInterval sec" "Cyan"
                Send-Result @{ commandId = $cmd.id; success = $true; result = "Polling set to $PollingInterval" }
                continue
            }
            
            if ($cmd.command -match "^FILE_LS (.*)") {
                $path = $matches[1]
                Write-Log "Listing files in: $path" "Cyan"
                $files = Get-FileSystemItems -Path $path
                $json = $files | ConvertTo-Json -Depth 2 -Compress
                Send-Result @{ commandId = $cmd.id; success = $true; result = $json }
                continue
            }

            if ($cmd.command -match "^FILE_GET (.*)") {
                $path = $matches[1]
                Write-Log "Reading file: $path" "Cyan"
                try {
                    $bytes = [System.IO.File]::ReadAllBytes($path)
                    $base64 = [Convert]::ToBase64String($bytes)
                    Send-Result @{ commandId = $cmd.id; success = $true; result = $base64 }
                }
                catch {
                    Write-Log "Error reading file: $_" "Red"
                    Send-Result @{ commandId = $cmd.id; success = $false; error = $_.Exception.Message }
                }
                continue
            }

            if ($cmd.command -eq "GET_SCREENSHOT") {
                Write-Log "Taking screenshot..." "Cyan"
                try {
                    Add-Type -AssemblyName System.Windows.Forms
                    Add-Type -AssemblyName System.Drawing
                    
                    $width = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Width
                    $height = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Height
                    $bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
                    $bmp = New-Object System.Drawing.Bitmap $width, $height
                    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
                    $graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
                    
                    $ms = New-Object System.IO.MemoryStream
                    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Jpeg)
                    $base64 = [Convert]::ToBase64String($ms.ToArray())
                    
                    $graphics.Dispose()
                    $bmp.Dispose()
                    $ms.Dispose()
                    
                    Send-Result @{ commandId = $cmd.id; success = $true; result = $base64 }
                }
                catch {
                    Write-Log "Screenshot failed: $_" "Red"
                    Send-Result @{ commandId = $cmd.id; success = $false; error = $_.Exception.Message }
                }
                continue
            }

            $result = Invoke-Cmd -id $cmd.id -script $cmd.command
            Send-Result $result
        }
    }
    
    Start-Sleep -Seconds $PollingInterval
}
