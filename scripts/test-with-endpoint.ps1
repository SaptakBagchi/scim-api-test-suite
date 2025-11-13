# PowerShell test runner with endpoint type support
# Usage: .\scripts\test-with-endpoint.ps1 [scim|apiserver] [playwright-args...]

param(
    [Parameter(Position=0)]
    [ValidateSet("scim", "apiserver", "help")]
    [string]$EndpointType,
    
    [Parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]]$PlaywrightArgs
)

function Show-Help {
    Write-Host "Test Runner with Endpoint Type Support" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor White
    Write-Host ".\scripts\test-with-endpoint.ps1 [endpoint-type] [playwright-args...]" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Endpoint Types:" -ForegroundColor White
    Write-Host "scim      Run tests against SCIM endpoints (/obscim/v2)" -ForegroundColor Gray
    Write-Host "apiserver Run tests against API Server endpoints (/ApiServer/onbase/SCIM/v2)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor White
    Write-Host ".\scripts\test-with-endpoint.ps1 scim" -ForegroundColor Gray
    Write-Host ".\scripts\test-with-endpoint.ps1 apiserver --workers=1" -ForegroundColor Gray
    Write-Host '.\scripts\test-with-endpoint.ps1 scim --grep="User" --reporter=line' -ForegroundColor Gray
    Write-Host '.\scripts\test-with-endpoint.ps1 apiserver --headed --grep="ServiceProviderConfig"' -ForegroundColor Gray
    Write-Host ""
    Write-Host "Default Playwright args: --workers=1 --reporter=line" -ForegroundColor Yellow
}

function Start-Tests {
    param(
        [string]$EndpointType,
        [string[]]$PlaywrightArgs
    )
    
    Write-Host "Running tests with $($EndpointType.ToUpper()) endpoints..." -ForegroundColor Green
    
    # Set default args if none provided
    if ($PlaywrightArgs.Count -eq 0) {
        $PlaywrightArgs = @("--workers=1", "--reporter=line")
    }
    
    $argsString = $PlaywrightArgs -join " "
    Write-Host "Command: npx playwright test $argsString" -ForegroundColor Cyan
    Write-Host "Endpoint Type: $($EndpointType.ToUpper())" -ForegroundColor Yellow
    Write-Host ""
    
    # Set environment variable and run Playwright
    $env:ENDPOINT_TYPE = $EndpointType
    
    try {
        $process = Start-Process -FilePath "npx" -ArgumentList @("playwright", "test") + $PlaywrightArgs -NoNewWindow -Wait -PassThru
        
        Write-Host ""
        if ($process.ExitCode -eq 0) {
            Write-Host "Tests completed successfully with $($EndpointType.ToUpper()) endpoints" -ForegroundColor Green
        } else {
            Write-Host "Tests failed with exit code $($process.ExitCode)" -ForegroundColor Red
        }
        
        exit $process.ExitCode
        
    } catch {
        Write-Host "Error running tests: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Main execution
if (-not $EndpointType -or $EndpointType -eq "help") {
    Show-Help
    exit 0
}

Start-Tests -EndpointType $EndpointType -PlaywrightArgs $PlaywrightArgs