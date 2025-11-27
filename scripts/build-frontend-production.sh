#!/bin/bash

# Frontend Production Build Script
# Bu script production için frontend'i build eder

set -e

echo "🚀 Frontend Production Build Başlatılıyor..."

# API URL kontrolü
if [ -z "$VITE_API_URL" ]; then
  echo "⚠️  VITE_API_URL environment variable bulunamadı"
  echo "📝 Varsayılan değer kullanılıyor: https://vip-ride-api.onrender.com"
  export VITE_API_URL="https://vip-ride-api.onrender.com"
fi

echo "📍 API URL: $VITE_API_URL"

# Web klasörüne git
cd packages/web

# Dependencies yükle
echo "📦 Dependencies yükleniyor..."
pnpm install

# Build
echo "🔨 Build yapılıyor..."
pnpm build

# .htaccess dosyasını dist'e kopyala
if [ -f ".htaccess" ]; then
  echo "📄 .htaccess dosyası kopyalanıyor..."
  cp .htaccess dist/.htaccess
fi

echo "✅ Build tamamlandı!"
echo "📁 Build dosyaları: packages/web/dist"
echo ""
echo "📋 Sonraki adımlar:"
echo "   1. packages/web/dist klasöründeki dosyaları Hostinger'a yükleyin"
echo "   2. .htaccess dosyasının yüklendiğinden emin olun"
echo "   3. Environment variables'ı kontrol edin"

