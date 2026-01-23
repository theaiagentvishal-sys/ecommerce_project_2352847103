#!/bin/bash
# Simple HTTP Server starter for Mac/Linux
# Usage: bash start-server.sh

cd "$(dirname "$0")"

echo "=================================="
echo "  E-SHOP Local Server"
echo "=================================="
echo ""
echo "Starting server on http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Try Python first (most common)
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000 --directory .
elif command -v python &> /dev/null; then
    python -m http.server 8000 --directory .
# Try PHP if available
elif command -v php &> /dev/null; then
    php -S localhost:8000
# Try Node.js if available
elif command -v npx &> /dev/null; then
    npx http-server -p 8000
else
    echo "Error: No suitable server found!"
    echo "Please install Python, PHP, or Node.js"
    exit 1
fi
