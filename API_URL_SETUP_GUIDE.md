# API URL Ayarlama Rehberi

## 📍 API URL Nerede Kullanılıyor?

API URL'i şu dosyalarda kullanılıyor:
- `packages/web/src/api/index.ts` - Ana API client
- `packages/web/src/api/admin/adminUploadApi.ts` - Admin upload API

**Kod:**
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // ...
});
```

## 🔧 API URL Nasıl Ayarlanır?

### Yöntem 1: .env Dosyası (Önerilen - Development)

1. **`packages/web/.env` dosyası oluşturun:**
   ```bash
   cd packages/web
   cp .env.example .env
   ```

2. **`.env` dosyasını düzenleyin:**
   ```env
   VITE_API_URL=https://vip-ride-api.onrender.com
   VITE_GOOGLE_PLACES_API_KEY=your_key_here
   ```

3. **Dev server'ı yeniden başlatın:**
   ```bash
   pnpm dev
   ```

**Not:** `.env` dosyası sadece development için kullanılır. Build sırasında environment variable olarak ayarlanmalıdır.

---

### Yöntem 2: Build Sırasında Environment Variable (Production)

#### Windows PowerShell:
```powershell
cd packages/web
$env:VITE_API_URL="https://vip-ride-api.onrender.com"
$env:VITE_GOOGLE_PLACES_API_KEY="your_key_here"
pnpm build
```

#### Linux/Mac:
```bash
cd packages/web
export VITE_API_URL="https://vip-ride-api.onrender.com"
export VITE_GOOGLE_PLACES_API_KEY="your_key_here"
pnpm build
```

#### Tek Satırda (PowerShell):
```powershell
$env:VITE_API_URL="https://vip-ride-api.onrender.com"; $env:VITE_GOOGLE_PLACES_API_KEY="your_key"; cd packages/web; pnpm build
```

---

### Yöntem 3: Build Script ile

`packages/web/package.json` dosyasına script ekleyin:

```json
{
  "scripts": {
    "build:prod": "VITE_API_URL=https://vip-ride-api.onrender.com vite build --outDir dist"
  }
}
```

**Kullanım:**
```bash
pnpm build:prod
```

**Not:** Bu yöntem güvenli değildir (API key'ler kodda görünür). Mümkünse environment variable kullanın.

---

## 🎯 Production Build için (Hostinger)

### Adım 1: Environment Variable Ayarla

**Windows PowerShell:**
```powershell
cd packages/web
$env:VITE_API_URL="https://vip-ride-api.onrender.com"
```

**Linux/Mac:**
```bash
cd packages/web
export VITE_API_URL="https://vip-ride-api.onrender.com"
```

### Adım 2: Build Yap

```bash
pnpm build
```

### Adım 3: Kontrol Et

Build edilmiş `dist/index.html` veya `dist/assets/*.js` dosyalarında API URL'in doğru olduğunu kontrol edin:

```bash
# Windows PowerShell
Select-String -Path "packages/web/dist/assets/*.js" -Pattern "vip-ride-api.onrender.com"

# Linux/Mac
grep -r "vip-ride-api.onrender.com" packages/web/dist/assets/
```

---

## 📝 Önemli Notlar

### 1. VITE_ Prefix Gerekli
Vite sadece `VITE_` ile başlayan environment variable'ları client-side'a expose eder:
- ✅ `VITE_API_URL` - Çalışır
- ❌ `API_URL` - Çalışmaz

### 2. Build Sırasında Ayarlanmalı
API URL build sırasında kod içine gömülür. Build'den sonra değiştirmek için yeniden build yapmanız gerekir.

### 3. Development vs Production
- **Development:** `.env` dosyası kullanılır
- **Production:** Build sırasında environment variable ayarlanmalı

### 4. .env Dosyası Git'e Eklenmemeli
`.env` dosyası `.gitignore`'da olmalı. `.env.example` dosyasını commit edin.

---

## 🔍 API URL Kontrolü

### Build Öncesi Kontrol
```bash
# Windows PowerShell
echo $env:VITE_API_URL

# Linux/Mac
echo $VITE_API_URL
```

### Build Sonrası Kontrol
Build edilmiş dosyalarda API URL'i arayın:
```bash
# Windows PowerShell
Get-ChildItem -Path "packages/web/dist/assets/*.js" -Recurse | Select-String "vip-ride-api"

# Linux/Mac
grep -r "vip-ride-api" packages/web/dist/assets/
```

---

## 🚨 Sorun Giderme

### Sorun 1: API URL undefined
**Sebep:** Environment variable ayarlanmamış veya `VITE_` prefix'i eksik.

**Çözüm:**
```bash
# Kontrol et
echo $VITE_API_URL  # Linux/Mac
echo $env:VITE_API_URL  # Windows PowerShell

# Ayarla ve build yap
export VITE_API_URL="https://vip-ride-api.onrender.com"  # Linux/Mac
$env:VITE_API_URL="https://vip-ride-api.onrender.com"  # Windows PowerShell
pnpm build
```

### Sorun 2: Eski API URL Kullanılıyor
**Sebep:** Build cache veya eski build dosyaları.

**Çözüm:**
```bash
# dist klasörünü sil
rm -rf packages/web/dist  # Linux/Mac
Remove-Item -Recurse -Force packages/web/dist  # Windows PowerShell

# Yeniden build yap
pnpm build
```

### Sorun 3: Development'ta API Çalışmıyor
**Sebep:** `.env` dosyası yok veya yanlış.

**Çözüm:**
1. `packages/web/.env` dosyası oluşturun
2. `VITE_API_URL=http://localhost:3000` ekleyin
3. Dev server'ı yeniden başlatın

---

## ✅ Checklist

- [ ] `.env.example` dosyası oluşturuldu
- [ ] Development için `.env` dosyası oluşturuldu
- [ ] Production build için environment variable ayarlandı
- [ ] Build yapıldı
- [ ] Build edilmiş dosyalarda API URL doğru
- [ ] Site test edildi, API bağlantısı çalışıyor

---

## 📋 Hızlı Referans

### Development
```bash
# .env dosyası oluştur
cd packages/web
echo "VITE_API_URL=http://localhost:3000" > .env

# Dev server başlat
pnpm dev
```

### Production Build
```bash
# Windows PowerShell
cd packages/web
$env:VITE_API_URL="https://vip-ride-api.onrender.com"
pnpm build

# Linux/Mac
cd packages/web
export VITE_API_URL="https://vip-ride-api.onrender.com"
pnpm build
```

---

## 🔗 İlgili Dosyalar

- `packages/web/src/api/index.ts` - API client konfigürasyonu
- `packages/web/.env.example` - Environment variable örneği
- `packages/web/vite.config.ts` - Vite konfigürasyonu


