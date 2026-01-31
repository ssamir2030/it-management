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
    # Server URLs - Public URL first for WAN devices, then LAN servers
    [string[]]$ServerUrls = @(
        "https://it-management-eta.vercel.app",  # Public Cloud (Works from anywhere)
        "http://192.168.8.199:4010",              # Local LAN Server (Primary)
        "http://localhost:3000",                   # Dev Server
        "http://localhost:4002"                    # Alt Dev Server
    ),
    [int]$PollingInterval = 30,
    [switch]$RunOnce = $false
)

# Suppress non-critical errors for cleaner output
$ErrorActionPreference = "SilentlyContinue"
$ProgressPreference = "SilentlyContinue"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   IT Asset Management Agent v2.5.0    " -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan

# Configure TLS for secure connections
try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
}
catch {
    Write-Host "[WARN] Could not set TLS 1.2, using system default" -ForegroundColor Yellow
}

# Create agent directory
$AgentDir = "$env:ProgramData\ITAssetAgent"
if (-not (Test-Path $AgentDir)) { 
    New-Item -ItemType Directory -Path $AgentDir -Force | Out-Null 
}
$AgentKeyFile = "$AgentDir\agent.key"
$LogFile = "$AgentDir\agent.log"

function Write-Log { 
    param($msg, $color = "White") 
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    Write-Host "[$timestamp] $msg" -ForegroundColor $color
    # Also log to file
    "[$timestamp] $msg" | Out-File -FilePath $LogFile -Append -ErrorAction SilentlyContinue
}


# --- Auto-Detect Best Server ---
function Get-BestServerUrl {
    Write-Log "Searching for active server..." "Cyan"
    
    foreach ($url in $ServerUrls) {
        Write-Host "   Testing: $url " -NoNewline
        
        try {
            # Try health endpoint first (preferred)
            $response = Invoke-WebRequest -Uri "$url/api/health" -Method Head -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host "[OK]" -ForegroundColor Green
                return $url
            }
        }
        catch {
            # Try root URL as fallback
            try {
                $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
                if ($response.StatusCode -lt 400) {
                    Write-Host "[OK]" -ForegroundColor Green
                    return $url
                }
            }
            catch {
                Write-Host "[Failed]" -ForegroundColor DarkGray
            }
        }
    }
    return $null
}

# Find best server with retry
$MaxRetries = 3
$RetryDelay = 5
$ActiveServerUrl = $null

for ($i = 1; $i -le $MaxRetries; $i++) {
    $ActiveServerUrl = Get-BestServerUrl
    if ($ActiveServerUrl) { break }
    
    if ($i -lt $MaxRetries) {
        Write-Log "No server found (attempt $i/$MaxRetries). Retrying in $RetryDelay seconds..." "Yellow"
        Start-Sleep -Seconds $RetryDelay
    }
}

if (-not $ActiveServerUrl) {
    Write-Log "ERROR: No reachable server after $MaxRetries attempts." "Red"
    Write-Log "Please check your network connection and try again." "Red"
    Write-Host "`nPress any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Log "Connected to: $ActiveServerUrl" "Green"

# Override the global ServerUrl variable for the rest of the script
$ServerUrl = $ActiveServerUrl

# Check Admin
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    if ($PSCommandPath) {
        Write-Host "Restarting as Administrator..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" -ServerUrl `"$ServerUrl`"" -Verb RunAs
        exit
    }
    else {
        Write-Warning "Script is running from memory and you are NOT Administrator."
        Write-Warning "Some features (System Info, Software Inventory) might be limited."
        Write-Host "Continuing anyway..." -ForegroundColor Yellow
    }
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
    
    # OS & RAM
    try { 
        $osInfo = Get-CimInstance Win32_OperatingSystem -ErrorAction Stop
        $os = $osInfo.Caption
        $ramBytes = $osInfo.TotalVisibleMemorySize * 1024
        $ram = "{0:N2} GB" -f ($ramBytes / 1GB)
        $productId = $osInfo.SerialNumber
    }
    catch { 
        # Fallback to WMI
        try {
            $osInfo = Get-WmiObject Win32_OperatingSystem
            $os = $osInfo.Caption
            $ramBytes = $osInfo.TotalVisibleMemorySize * 1024
            $ram = "{0:N2} GB" -f ($ramBytes / 1GB)
            $productId = $osInfo.SerialNumber
        }
        catch {
            $os = "Unknown Windows (WMI Failed)"
            $ram = "Unknown"
            $productId = "Unknown"
        }
    }
    
    # CPU
    try { 
        $cpuInfo = Get-CimInstance Win32_Processor -ErrorAction Stop | Select-Object -First 1
        $cpu = $cpuInfo.Name 
    } 
    catch { 
        try {
            $cpuInfo = Get-WmiObject Win32_Processor | Select-Object -First 1
            $cpu = $cpuInfo.Name
        }
        catch { 
            # Fallback to Env Var
            $cpu = $env:PROCESSOR_IDENTIFIER 
            if (-not $cpu) { $cpu = "Unknown CPU" }
        }
    }
    
    # System Info (msinfo32 equivalent data)
    try {
        $cs = Get-CimInstance Win32_ComputerSystem -ErrorAction Stop
        $bios = Get-CimInstance Win32_BIOS -ErrorAction Stop
        $manufacturer = $cs.Manufacturer
        $model = $cs.Model
        $serial = $bios.SerialNumber
        $systemType = $cs.SystemType
        $username = if ($cs.UserName) { $cs.UserName } else { $env:USERNAME }
        
        # Domain/Workgroup - FIXED logic
        # PartOfDomain is a boolean that tells us directly if the computer is domain-joined
        if ($cs.PartOfDomain) {
            $domain = $cs.Domain
            $workgroup = $null
        }
        else {
            $domain = $null
            $workgroup = $cs.Workgroup
        }
        $domainRole = $cs.DomainRole # 0=Standalone, 1=Member Workgroup, 2=Standalone Server, 3=Member Server, 4=Backup DC, 5=Primary DC
    }
    catch { 
        try {
            $cs = Get-WmiObject Win32_ComputerSystem
            $bios = Get-WmiObject Win32_BIOS
            $manufacturer = $cs.Manufacturer
            $model = $cs.Model
            $serial = $bios.SerialNumber
            $systemType = $cs.SystemType
            $username = if ($cs.UserName) { $cs.UserName } else { $env:USERNAME }
            # Domain/Workgroup - FIXED logic
            if ($cs.PartOfDomain) {
                $domain = $cs.Domain
                $workgroup = $null
            }
            else {
                $domain = $null
                $workgroup = $cs.Workgroup
            }
            $domainRole = $cs.DomainRole
        }
        catch {
            $manufacturer = "Generic"
            $model = "PC"
            $serial = "Unknown"
            $systemType = if ([Environment]::Is64BitOperatingSystem) { "x64-based PC" } else { "x86-based PC" }
            $username = $env:USERNAME
            $domain = $null
            $workgroup = $env:USERDOMAIN
            $domainRole = 0
        }
    }
    
    # ========== NEW: Additional msinfo32-like data ==========
    
    # Motherboard
    try {
        $baseboard = Get-CimInstance Win32_BaseBoard -ErrorAction Stop
        $motherboard = @{
            manufacturer = $baseboard.Manufacturer
            product      = $baseboard.Product
            serialNumber = $baseboard.SerialNumber
        }
    }
    catch { $motherboard = $null }
    
    # GPU
    try {
        $gpuList = @(Get-CimInstance Win32_VideoController -ErrorAction Stop | ForEach-Object {
                @{
                    name          = $_.Name
                    adapterRAM    = if ($_.AdapterRAM) { "{0:N0} MB" -f ($_.AdapterRAM / 1MB) } else { $null }
                    driverVersion = $_.DriverVersion
                    resolution    = "$($_.CurrentHorizontalResolution)x$($_.CurrentVerticalResolution)"
                }
            })
        $gpu = if ($gpuList.Count -gt 0) { $gpuList[0].name } else { $null }
    }
    catch { $gpuList = @(); $gpu = $null }
    
    # BIOS Extended Info
    try {
        $biosInfo = @{
            manufacturer = $bios.Manufacturer
            version      = $bios.SMBIOSBIOSVersion
            releaseDate  = if ($bios.ReleaseDate) { $bios.ReleaseDate.ToString("yyyy-MM-dd") } else { $null }
        }
    }
    catch { $biosInfo = $null }
    
    # Battery (for laptops)
    try {
        $battery = Get-CimInstance Win32_Battery -ErrorAction Stop
        if ($battery) {
            $batteryInfo = @{
                status                   = switch ($battery.BatteryStatus) {
                    1 { "Discharging" }; 2 { "AC Power" }; 3 { "Fully Charged" }
                    4 { "Low" }; 5 { "Critical" }; default { "Unknown" }
                }
                estimatedChargeRemaining = $battery.EstimatedChargeRemaining
            }
        }
        else { $batteryInfo = $null }
    }
    catch { $batteryInfo = $null }
    
    # Network Adapters (all)
    try {
        $networkAdapters = @(Get-CimInstance Win32_NetworkAdapterConfiguration -ErrorAction Stop | 
            Where-Object { $_.IPEnabled } | ForEach-Object {
                @{
                    description = $_.Description
                    ip          = ($_.IPAddress | Select-Object -First 1)
                    mac         = $_.MACAddress
                    dhcpEnabled = $_.DHCPEnabled
                    gateway     = ($_.DefaultIPGateway | Select-Object -First 1)
                    dns         = $_.DNSServerSearchOrder
                }
            })
    }
    catch { $networkAdapters = @() }
    
    # Installed Memory Modules
    try {
        $memoryModules = @(Get-CimInstance Win32_PhysicalMemory -ErrorAction Stop | ForEach-Object {
                @{
                    capacity     = "{0:N0} GB" -f ($_.Capacity / 1GB)
                    speed        = "$($_.Speed) MHz"
                    manufacturer = $_.Manufacturer
                    partNumber   = $_.PartNumber
                }
            })
        $totalMemorySlots = (Get-CimInstance Win32_PhysicalMemoryArray -ErrorAction SilentlyContinue).MemoryDevices
    }
    catch { $memoryModules = @(); $totalMemorySlots = $null }
    
    # Physical Disks (not just logical)
    try {
        $physicalDisks = @(Get-CimInstance Win32_DiskDrive -ErrorAction Stop | ForEach-Object {
                @{
                    model     = $_.Model
                    size      = "{0:N0} GB" -f ($_.Size / 1GB)
                    interface = $_.InterfaceType
                    serial    = $_.SerialNumber
                }
            })
    }
    catch { $physicalDisks = @() }
    
    # Monitor Info
    try {
        $monitors = @(Get-CimInstance Win32_DesktopMonitor -ErrorAction Stop | Where-Object { $_.Name } | ForEach-Object {
                @{
                    name         = $_.Name
                    manufacturer = $_.MonitorManufacturer
                }
            })
    }
    catch { $monitors = @() }
    
    # Disks (Logical)
    try {
        $disks = @(Get-CimInstance Win32_LogicalDisk | Where-Object { $_.DriveType -eq 3 } | ForEach-Object {
                @{ drive = $_.DeviceID; size = "{0:N2} GB" -f ($_.Size / 1GB); free = "{0:N2} GB" -f ($_.FreeSpace / 1GB) }
            })
    }
    catch { 
        try {
            $disks = @(Get-WmiObject Win32_LogicalDisk | Where-Object { $_.DriveType -eq 3 } | ForEach-Object {
                    @{ drive = $_.DeviceID; size = "{0:N2} GB" -f ($_.Size / 1GB); free = "{0:N2} GB" -f ($_.FreeSpace / 1GB) }
                })
        }
        catch { $disks = @() }
    }
    
    # Network (Primary)
    try {
        $ipConfig = Get-NetIPConfiguration | Where-Object { $null -ne $_.IPv4DefaultGateway -and $_.NetAdapter.Status -eq "Up" } | Select-Object -First 1
        $ip = $ipConfig.IPv4Address.IPAddress
        $mac = $ipConfig.NetAdapter.MacAddress
    }
    catch {
        $ip = "0.0.0.0"
        $mac = "00-00-00-00-00-00"
    }

    # Get Public IP (for WAN detection)
    $publicIp = $null
    $connectionType = "LAN"
    try {
        $publicIpResponse = Invoke-RestMethod -Uri "https://api.ipify.org?format=json" -TimeoutSec 5 -ErrorAction Stop
        $publicIp = $publicIpResponse.ip
        
        # Determine connection type
        if ($ip -match "^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)") {
            # Private IP - likely behind NAT (LAN)
            $connectionType = "LAN"
        }
        elseif ($ip -eq $publicIp) {
            # Public IP directly - WAN/Internet
            $connectionType = "WAN"
        }
        else {
            $connectionType = "LAN"
        }
        Write-Log "Public IP: $publicIp (Connection: $connectionType)" "Cyan"
    }
    catch {
        Write-Log "Could not detect public IP" "DarkGray"
        $connectionType = "LAN"
    }


    # Build comprehensive payload
    $payload = @{
        agentKey         = $AgentKey
        hostname         = $env:COMPUTERNAME
        ip               = $ip
        mac              = $mac
        os               = $os
        cpu              = $cpu
        ram              = $ram
        serial           = $serial
        manufacturer     = $manufacturer
        model            = $model
        username         = $username
        disks            = $disks
        systemType       = $systemType
        productId        = $productId
        # Domain/Workgroup (fixed)
        domain           = $domain
        workgroup        = $workgroup
        domainRole       = $domainRole
        # New detailed info (msinfo32 equivalent)
        gpu              = $gpu
        gpuList          = $gpuList
        motherboard      = $motherboard
        biosInfo         = $biosInfo
        batteryInfo      = $batteryInfo
        networkAdapters  = $networkAdapters
        memoryModules    = $memoryModules
        totalMemorySlots = $totalMemorySlots
        physicalDisks    = $physicalDisks
        monitors         = $monitors
        # WAN/LAN Detection (v2.5.0)
        publicIp         = $publicIp
        connectionType   = $connectionType
        agentVersion     = "2.5.0"  # Version bump for WAN support
    }

    Write-Log "Payload: $($payload | ConvertTo-Json -Depth 2 -Compress)" "DarkGray"
    return $payload
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

            if ($cmd.command -eq "LOCK") {
                Write-Log "Locking Workstation..." "Cyan"
                Invoke-Cmd -id $cmd.id -script "rundll32.exe user32.dll,LockWorkStation"
                continue
            }

            if ($cmd.command -eq "LOGOFF") {
                Write-Log "Logging off..." "Cyan"
                Invoke-Cmd -id $cmd.id -script "logoff console"
                continue
            }

            if ($cmd.command -match "^OPEN_URL (.*)") {
                $url = $matches[1]
                Write-Log "Opening URL: $url" "Cyan"
                Invoke-Cmd -id $cmd.id -script "Start-Process '$url'"
                continue
            }

            if ($cmd.command -match "^LAUNCH_APP (.*)") {
                $app = $matches[1]
                Write-Log "Launching App: $app" "Cyan"
                Invoke-Cmd -id $cmd.id -script "Start-Process '$app'"
                continue
            }

            if ($cmd.command -match "^MESSAGE (.*)") {
                $msg = $matches[1]
                Write-Log "Showing Message..." "Cyan"
                # Run in a separate thread/job so permission dialog doesn't block agent loop
                $scriptBlock = {
                    param($m)
                    Add-Type -AssemblyName System.Windows.Forms
                    [System.Windows.Forms.MessageBox]::Show($m, 'Administrator Message', 'OK', 'Information')
                }
                Start-Job -ScriptBlock $scriptBlock -ArgumentList $msg | Out-Null
                Send-Result @{ commandId = $cmd.id; success = $true; result = "Message displayed" }
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
                    # Save as Low Quality JPEG to reduce bandwidth
                    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
                    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
                    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]40)

                    $bmp.Save($ms, $codec, $encoderParams)
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
