# Simple PowerShell HTTP Server
# This script creates a basic web server to test the e-commerce app locally

$port = 8000
$webRoot = Get-Location

Write-Host "Starting HTTP Server..." -ForegroundColor Green
Write-Host "Root: $webRoot" -ForegroundColor Cyan
Write-Host "URL: http://localhost:$port" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "✓ Server started successfully" -ForegroundColor Green
    Write-Host ""
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $url = $request.Url.LocalPath
        if ($url -eq "/") { $url = "/index.html" }
        
        $filePath = Join-Path $webRoot $url.TrimStart("/")
        
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] GET $url" -ForegroundColor Cyan
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            
            # Set content type
            $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mimeTypes = @{
                ".html" = "text/html"
                ".css"  = "text/css"
                ".js"   = "application/javascript"
                ".json" = "application/json"
                ".png"  = "image/png"
                ".jpg"  = "image/jpeg"
                ".gif"  = "image/gif"
                ".svg"  = "image/svg+xml"
                ".woff" = "font/woff"
                ".woff2" = "font/woff2"
                ".ttf"  = "font/ttf"
                ".woff" = "font/woff"
            }
            
            $response.ContentType = $mimeTypes[$extension] ?? "application/octet-stream"
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.StatusCode = 200
            Write-Host "  → 200 OK" -ForegroundColor Green
        } else {
            $response.StatusCode = 404
            Write-Host "  → 404 Not Found" -ForegroundColor Red
        }
        
        $response.OutputStream.Close()
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
} finally {
    $listener.Stop()
    $listener.Close()
}
