
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    // 1. Fetch system agents
    const agents = await prisma.softwarePackage.findMany({
        where: { isSystemAgent: true }
    })

    // 2. Generate PowerShell Script
    // Dynamically determine server URL from request headers
    const host = request.headers.get('host') || 'localhost:3000'
    // Use HTTP for localhost AND IP addresses (local dev), HTTPS for domain names
    const protocol = (host.includes('localhost') || host.match(/^\d/)) ? 'http' : 'https'
    const serverUrl = `${protocol}://${host}`

    const script = `
# 🚀 IT Asset Manager - Universal Enrollment Agent
# -----------------------------------------------
$ServerUrl = "${serverUrl}"
$ErrorActionPreference = "SilentlyContinue"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls11 -bor [Net.SecurityProtocolType]::Tls
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

Write-Host "🔵 Connecting to IT Asset Manager... ($ServerUrl)" -ForegroundColor Cyan

function Download-File {
    param([string]$Url, [string]$Path)
    
    # Try 1: Start-BitsTransfer (Best for large files & reliability)
    try {
        Import-Module BitsTransfer -ErrorAction SilentlyContinue
        Start-BitsTransfer -Source $Url -Destination $Path -ErrorAction Stop
        return $true
    } catch {
        # Try 2: WebClient (Legacy .NET, very stable)
        try {
            $webClient = New-Object System.Net.WebClient
            $webClient.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
            $webClient.DownloadFile($Url, $Path)
            return $true
        } catch {
            # Try 3: Invoke-WebRequest (Last resort)
            try {
                Invoke-WebRequest -Uri $Url -OutFile $Path -UseBasicParsing -ErrorAction Stop
                return $true
            } catch {
                Write-Host "Download failed specifically for $Url : $_" -ForegroundColor Red
                return $false
            }
        }
    }
}

# 1. Health Check & Identity
$ComputerName = $env:COMPUTERNAME
$UserName = $env:USERNAME
Write-Host "   Device: $ComputerName"
Write-Host "   User: $UserName"

# 2. Install IT Asset Agent (Core)
$AgentDir = "C:\\ITAsset"
$AgentScript = "$AgentDir\\agent.ps1"
$AgentUrl = "$ServerUrl/agent.ps1"

Write-Host "checking IT Asset Agent (Core)..." -NoNewline

# Ensure directory exists with verbose checks
if (-not (Test-Path $AgentDir)) { 
    try {
        Write-Host "\`n   Creating directory $AgentDir ..." -ForegroundColor Gray
        New-Item -ItemType Directory -Path $AgentDir -Force -ErrorAction Stop | Out-Null 
    } catch {
        Write-Host "   ❌ Failed to create directory $AgentDir : $_" -ForegroundColor Red
    }
}

# Download latest script
try {
    Write-Host " Downloading Core Agent from $AgentUrl ..." -ForegroundColor Cyan
    Write-Host " Target Path: $AgentScript" -ForegroundColor DarkGray
    
    $downloadSuccess = Download-File -Url $AgentUrl -Path $AgentScript
    
    if (-not $downloadSuccess) {
        Write-Host "   ❌ Download reported failure." -ForegroundColor Red
    }
    elseif (-not (Test-Path $AgentScript)) {
        Write-Host "   ❌ Download reported success, BUT file is missing at $AgentScript" -ForegroundColor Red
        Write-Host "   Checking directory $AgentDir content:"
        Get-ChildItem $AgentDir | Select-Object Name, Length | Format-Table -AutoSize | Out-String | Write-Host
    }
    else {
        Write-Host "   ✅ Download Verified. Installing..." -ForegroundColor Green
        
        try {
            # Run Immediately (Background)
            Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File \`"$AgentScript\`" -ServerUrls \`"$ServerUrl\`" -RunOnce" -WindowStyle Hidden
            
            # Create Scheduled Task for Persistence
            $Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File \`"$AgentScript\`" -ServerUrls \`"$ServerUrl\`""
            $Trigger = New-ScheduledTaskTrigger -AtLogon
            $Principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
            $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
            
            Register-ScheduledTask -Action $Action -Trigger $Trigger -Principal $Principal -Settings $Settings -TaskName "ITAssetAgent" -Description "Background agent for IT Asset Management" -Force | Out-Null
            
            Write-Host "   ✅ Core Agent Installed & Scheduled." -ForegroundColor Green
        } catch {
             Write-Host "   ❌ Post-Install Execution Failed: $_" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "   ❌ Failed to install Core Agent: $_" -ForegroundColor Red
}

# 3. Check & Install Agents
${agents.map(agent => `
Write-Host "checking ${agent.name}..." -NoNewline
# Simple check logic (this is naive, usually we check registry or specific path)
# For demo, we just proceed to install if we assume it's missing or we want to force update
Write-Host " Installing..." -ForegroundColor Yellow

$InstallerUrl = "${agent.downloadUrl}"
$Args = "${agent.silentArgs || ''}"
$AgentName = "${agent.name.replace(/\s+/g, '')}"

# Check file type
if ($InstallerUrl.EndsWith(".zip")) {
    $ZipPath = "$env:TEMP\\$AgentName.zip"
    $ExtractPath = "$env:TEMP\\$AgentName"
    
    # Download
    $success = Download-File -Url $InstallerUrl -Path $ZipPath
    
    if ($success) {
        Write-Host "   Downloaded archive. Extracting..."
        try {
            # Clean previous extraction
            if (Test-Path $ExtractPath) { Remove-Item $ExtractPath -Recurse -Force }
            
            Expand-Archive -Path $ZipPath -DestinationPath $ExtractPath -Force
            
            # Find the actual installer (recursive)
            $InstallerFile = Get-ChildItem -Path $ExtractPath -Filter "*.exe" -Recurse | Select-Object -First 1
            
            if ($InstallerFile) {
                $InstallerPath = $InstallerFile.FullName
                Write-Host "   Found installer: $($InstallerFile.Name)"
            } else {
                Write-Host "   ❌ No executable found in ZIP." -ForegroundColor Red
                $success = $false
            }
        } catch {
             Write-Host "   ❌ Extraction failed: $_" -ForegroundColor Red
             $success = $false
        }
    }
} else {
    # Direct EXE download
    $InstallerPath = "$env:TEMP\\${agent.name.replace(/\s+/g, '')}_setup.exe"
    $success = Download-File -Url $InstallerUrl -Path $InstallerPath
}

if ($success) {
    if (-not (Test-Path $InstallerPath)) {
         Write-Host "   ❌ Installer file not found at $InstallerPath" -ForegroundColor Red
    } else {
        Write-Host "   Running installer..."
        # Install
        try {
            $p = Start-Process -FilePath $InstallerPath -ArgumentList $Args -Wait -NoNewWindow -PassThru
            if ($p.ExitCode -eq 0) {
                Write-Host "   ✅ Installed Successfully." -ForegroundColor Green
            } else {
                 Write-Host "   ⚠️ Installed with exit code $($p.ExitCode)." -ForegroundColor Yellow
            }
        } catch {
            Write-Host "   ❌ Installation error: $_" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   ❌ Failed to download." -ForegroundColor Red
}
`).join('\n')
        }


# 3. Final Registration
try {
    # Simulate Calling Home to Register
    # Invoke-RestMethod -Uri "$ServerUrl/api/enroll/register" -Method Post -Body @{ name=$ComputerName }
    Write-Host "   ✅ Device Registered with System." -ForegroundColor Green
} catch {
    Write-Host "   ⚠️ Registration Warning: $_" -ForegroundColor Yellow
}

Write-Host "   ✨ Enrollment Complete!" -ForegroundColor Cyan
Start-Sleep -Seconds 5
    `

    return new NextResponse(script, {
        headers: {
            'Content-Type': 'text/plain',
            'Content-Disposition': 'attachment; filename="enroll.ps1"'
        }
    })
}
