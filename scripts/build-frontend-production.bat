@echo off
REM Frontend Production Build Script (Windows)
REM Bu script production için frontend'i build eder

echo 🚀 Frontend Production Build Başlatılıyor...

REM API URL kontrolü
if "%VITE_API_URL%"=="" (
  echo ⚠️  VITE_API_URL environment variable bulunamadı
  echo 📝 Varsayılan değer kullanılıyor: https://vip-ride-api.onrender.com
  set VITE_API_URL=https://vip-ride-api.onrender.com
)

echo 📍 API URL: %VITE_API_URL%

REM Web klasörüne git
cd packages\web

REM Dependencies yükle
echo 📦 Dependencies yükleniyor...
call pnpm install

REM Build
echo 🔨 Build yapılıyor...
call pnpm build

REM .htaccess dosyasını dist'e kopyala
if exist ".htaccess" (
  echo 📄 .htaccess dosyası kopyalanıyor...
  copy .htaccess dist\.htaccess
)

echo ✅ Build tamamlandı!
echo 📁 Build dosyaları: packages\web\dist
echo.
echo 📋 Sonraki adımlar:
echo    1. packages\web\dist klasöründeki dosyaları Hostinger'a yükleyin
echo    2. .htaccess dosyasının yüklendiğinden emin olun
echo    3. Environment variables'ı kontrol edin

pause


