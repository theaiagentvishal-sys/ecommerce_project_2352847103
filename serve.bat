@echo off
REM Simple batch file to start a local server
REM For Windows, we'll use PowerShell to start a basic HTTP server

echo Starting E-Shop Server...
echo.
echo ===============================================
echo  E-SHOP - Local Development Server
echo ===============================================
echo.
echo The site will be available at: http://localhost:8080
echo.
echo Press Ctrl+C to stop the server
echo.

REM Check if http.sys is available (Windows built-in)
echo Opening your default browser...

REM Try to open the site using the .NET built-in server if available
powershell -NoProfile -Command "^
Add-Type -AssemblyName System.Net.HttpListener; ^
$listener = New-Object System.Net.HttpListener; ^
$listener.Prefixes.Add('http://localhost:8080/'); ^
$listener.Start(); ^
Write-Host 'Server started on http://localhost:8080'; ^
Write-Host 'Press Ctrl+C to stop'; ^
while ($listener.IsListening) { ^
  $context = $listener.GetContext(); ^
  $request = $context.Request; ^
  $response = $context.Response; ^
  $path = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine((Get-Location), $request.RawUrl.TrimStart('/'))); ^
  if (-not (Test-Path $path)) { $path = [System.IO.Path]::Combine((Get-Location), 'index.html') } ^
  $response.ContentType = 'text/html'; ^
  $buffer = [System.IO.File]::ReadAllBytes($path); ^
  $response.ContentLength64 = $buffer.Length; ^
  $response.OutputStream.Write($buffer, 0, $buffer.Length); ^
  $response.OutputStream.Close(); ^
}"

pause
