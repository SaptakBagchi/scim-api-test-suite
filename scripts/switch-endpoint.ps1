# PowerShell script to switch between SCIM and API Server endpoints
# Usage: .\scripts\switch-endpoint.ps1 [scim|apiserver|status]

param(
    [Parameter(Position=0)]
    [ValidateSet("scim", "apiserver", "status", "help")]
    [string]$Command
)

$envFilePath = Join-Path $PSScriptRoot "..\.env"

function Update-EndpointType {
    param([string]$NewType)
    
    if (-not (Test-Path $envFilePath)) {
        Write-Host "Error: .env file not found at: $envFilePath" -ForegroundColor Red
        exit 1
    }
    
    try {
        $envContent = Get-Content $envFilePath -Raw
        $envContent = $envContent -replace "API_ENDPOINT_TYPE=.*", "API_ENDPOINT_TYPE=$NewType"
        Set-Content -Path $envFilePath -Value $envContent -NoNewline
        
        Write-Host "Successfully updated endpoint configuration:" -ForegroundColor Green
        Write-Host "Endpoint Type: $($NewType.ToUpper())" -ForegroundColor Cyan
        
        if ($NewType -eq "scim") {
            Write-Host "API Base: /obscim/v2" -ForegroundColor Yellow
            Write-Host "Testing: SCIM endpoints" -ForegroundColor White
        } else {
            Write-Host "API Base: /ApiServer/onbase/SCIM/v2" -ForegroundColor Yellow
            Write-Host "Testing: API Server endpoints" -ForegroundColor White
        }
        
        Write-Host ""
        Write-Host "Run your tests now with:" -ForegroundColor Blue
        Write-Host "npx playwright test --workers=1 --reporter=line" -ForegroundColor Gray
        
    } catch {
        Write-Host "Error updating .env file: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

function Show-CurrentConfig {
    try {
        $envContent = Get-Content $envFilePath -Raw
        $match = [regex]::Match($envContent, "API_ENDPOINT_TYPE=(.+)")
        $currentType = if ($match.Success) { $match.Groups[1].Value } else { "not set" }
        
        Write-Host "Current endpoint configuration:" -ForegroundColor Blue
        Write-Host "Type: $($currentType.ToUpper())" -ForegroundColor Cyan
        
        if ($currentType -eq "scim") {
            Write-Host "API Base: /obscim/v2" -ForegroundColor Yellow
        } elseif ($currentType -eq "apiserver") {
            Write-Host "API Base: /ApiServer/onbase/SCIM/v2" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "Error reading .env file: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Show-Help {
    Write-Host "Endpoint Switcher Utility" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor White
    Write-Host ".\scripts\switch-endpoint.ps1 [command]" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor White
    Write-Host "scim      Switch to SCIM endpoints (/obscim/v2)" -ForegroundColor Gray
    Write-Host "apiserver Switch to API Server endpoints (/ApiServer/onbase/SCIM/v2)" -ForegroundColor Gray
    Write-Host "status    Show current configuration" -ForegroundColor Gray
    Write-Host "help      Show this help message" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor White
    Write-Host ".\scripts\switch-endpoint.ps1 scim" -ForegroundColor Gray
    Write-Host ".\scripts\switch-endpoint.ps1 apiserver" -ForegroundColor Gray
    Write-Host ".\scripts\switch-endpoint.ps1 status" -ForegroundColor Gray
}

# Main execution
switch ($Command) {
    "scim" {
        Update-EndpointType "scim"
    }
    "apiserver" {
        Update-EndpointType "apiserver"
    }
    "status" {
        Show-CurrentConfig
    }
    "help" {
        Show-Help
    }
    default {
        if ($Command) {
            Write-Host "Unknown command: $Command" -ForegroundColor Red
        }
        Show-Help
        exit 1
    }
}