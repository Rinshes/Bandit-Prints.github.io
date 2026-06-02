# ==========================================
# Download Product Images & Localize JSON
# ==========================================

$json = Get-Content ".\projects.json" -Raw | ConvertFrom-Json

$outputDir = ".\images\products"

New-Item `
    -ItemType Directory `
    -Force `
    -Path $outputDir | Out-Null

foreach ($project in $json) {

    Write-Host ""
    Write-Host "Project: $($project.title)" -ForegroundColor Cyan

    foreach ($product in $project.products) {

        $url = $product.image

        if ([string]::IsNullOrWhiteSpace($url)) {
            Write-Warning "Missing image URL for '$($product.title)'"
            continue
        }

        # Fix protocol-relative URLs
        if ($url.StartsWith("//")) {
            $url = "https:$url"
        }

        # Create safe filename
        $fileName = $product.title.ToLowerInvariant()

        $fileName = $fileName -replace '[\\/:*?"<>|]', ''
        $fileName = $fileName -replace '\s+', '-'
        $fileName = $fileName -replace '-+', '-'

        # Determine extension
        $extension = [System.IO.Path]::GetExtension(($url -split '\?')[0])

        if ([string]::IsNullOrWhiteSpace($extension)) {
            $extension = ".jpg"
        }

        $localFile = Join-Path $outputDir ($fileName + $extension)

        try {

            if (Test-Path $localFile) {

                Write-Host "Skipped: $($product.title)" -ForegroundColor Yellow
            }
            else {

                Invoke-WebRequest `
                    -Uri $url `
                    -OutFile $localFile `
                    -Headers @{
                        "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
                    }

                Write-Host "Downloaded: $($product.title)" -ForegroundColor Green
            }

            # Update JSON with web-friendly path
            $webPath = $localFile -replace '\\', '/'
            $webPath = $webPath -replace '^\./', ''

            $product.image = $webPath
        }
        catch {

            Write-Warning "Failed: $($product.title)"
            Write-Warning $_.Exception.Message
        }
    }
}

# Save updated JSON

$json |
    ConvertTo-Json -Depth 20 |
    Set-Content ".\projects-local.json" -Encoding UTF8

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "Finished!" -ForegroundColor Green
Write-Host "Images saved to: $outputDir"
Write-Host "Updated JSON: projects-local.json"
Write-Host "==================================" -ForegroundColor Green