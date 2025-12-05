@echo off
REM Frontend production build script with VITE_API_URL
REM Usage: scripts\build-frontend-production.bat [API_URL]
REM Example: scripts\build-frontend-production.bat https://api.example.com

setlocal enabledelayedexpansion

REM Get API URL from argument or environment variable
if "%~1"=="" (
    if defined VITE_API_URL (
        set "API_URL=!VITE_API_URL!"
    ) else (
        echo ❌ Error: VITE_API_URL is required
        echo Usage: scripts\build-frontend-production.bat [API_URL]
        echo    or: set VITE_API_URL=https://api.example.com ^&^& scripts\build-frontend-production.bat
        exit /b 1
    )
) else (
    set "API_URL=%~1"
)

echo 🚀 Building frontend with VITE_API_URL=!API_URL!
echo 📦 Building packages/web...

cd packages\web

REM Set VITE_API_URL and build
set "VITE_API_URL=!API_URL!"
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo ✅ Build completed successfully!
    echo 📁 Output: packages\web\dist
) else (
    echo ❌ Build failed!
    exit /b 1
)

endlocal

