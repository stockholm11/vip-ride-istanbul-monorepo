# Frontend Deployment Rehberi - Hostinger

## 📋 Ön Hazırlık

### 1. Environment Variables Hazırlama

Frontend için gerekli environment variables:

```bash
VITE_API_URL=https://vip-ride-api.onrender.com
VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

**Not:** `VITE_` prefix'i önemli! Vite sadece `VITE_` ile başlayan değişkenleri client-side'a expose eder.

### 2. Production Build Test (Local)

Önce local'de production build'i test edin:

```bash
cd packages/web

# Environment variable'ı set edin (PowerShell)
$env:VITE_API_URL="https://vip-ride-api.onrender.com"
$env:VITE_GOOGLE_PLACES_API_KEY="your_key_here"

# Build
pnpm build

# Preview (test için)
pnpm preview
```

Build başarılı olursa `packages/web/dist` klasörü oluşur.

## 🚀 Hostinger Deployment Adımları

### Yöntem 1: File Manager ile (Önerilen)

#### Adım 1: Build Dosyalarını Hazırlama

1. **Local'de build yapın:**
   ```bash
   cd packages/web
   pnpm build
   ```

2. **`packages/web/dist` klasörünün içeriğini kontrol edin:**
   - `index.html`
   - `assets/` klasörü
   - Diğer static dosyalar

#### Adım 2: Hostinger File Manager'a Yükleme

1. **Hostinger hPanel'e giriş yapın**
2. **File Manager**'ı açın
3. **`public_html`** klasörüne gidin (veya domain'inizin root klasörüne)
4. **Mevcut dosyaları yedekleyin** (varsa)
5. **`dist` klasörünün içindeki TÜM dosyaları seçin:**
   - `index.html`
   - `assets/` klasörü
   - Diğer tüm dosyalar
6. **Upload** butonuna tıklayın
7. **Dosyaları `public_html` içine yükleyin**

#### Adım 3: .htaccess Dosyası Oluşturma (React Router için)

`public_html` klasöründe `.htaccess` dosyası oluşturun:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

Bu dosya React Router'ın client-side routing'ini çalıştırması için gereklidir.

### Yöntem 2: Git ile (Gelişmiş)

#### Adım 1: Git Repository Hazırlama

1. **GitHub'da repository oluşturun** (veya mevcut repo'yu kullanın)
2. **Build script'i ekleyin** (root `package.json`'a):

```json
{
  "scripts": {
    "build:web": "cd packages/web && pnpm build"
  }
}
```

#### Adım 2: Hostinger Git Deployment

1. **Hostinger hPanel** > **Advanced** > **Git**
2. **"Create Repository"** tıklayın
3. **Repository URL'ini girin** (GitHub repo URL)
4. **Branch:** `main` veya `master`
5. **Deploy Path:** `public_html`
6. **Build Command:** `pnpm install && pnpm build:web`
7. **Output Directory:** `packages/web/dist`

**Not:** Hostinger'ın Git özelliği sınırlı olabilir. File Manager yöntemi daha güvenilir.

## 🔧 Environment Variables Ayarlama

### Hostinger'da Environment Variables

Hostinger'da environment variables ayarlamak için:

1. **hPanel** > **Advanced** > **Environment Variables**
2. Şu değişkenleri ekleyin:

```
VITE_API_URL=https://vip-ride-api.onrender.com
VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

**ÖNEMLİ:** Hostinger'da environment variables build sırasında kullanılır. Eğer Git deployment kullanıyorsanız, build command'de bu değişkenler mevcut olmalı.

### Alternatif: Build Script ile

Eğer Hostinger environment variables desteklemiyorsa, build script'i güncelleyin:

`packages/web/package.json`:

```json
{
  "scripts": {
    "build": "VITE_API_URL=https://vip-ride-api.onrender.com vite build --outDir dist"
  }
}
```

**Not:** Bu yöntem güvenli değildir (API key'ler kodda görünür). Mümkünse environment variables kullanın.

## ✅ Deployment Sonrası Kontroller

### 1. Site Erişilebilirliği

Tarayıcıda domain'inizi açın:
```
https://yourdomain.com
```

### 2. API Bağlantısı

Browser Console'u açın (F12) ve şu hataları kontrol edin:
- CORS hataları
- API connection hataları
- 404 hataları

### 3. Test Endpoints

```javascript
// Browser Console'da test edin
fetch('https://vip-ride-api.onrender.com/api/health')
  .then(r => r.json())
  .then(console.log)
```

### 4. React Router Test

- Ana sayfaya gidin
- Farklı sayfalara navigate edin
- Sayfayı yenileyin (refresh)
- 404 hatası almamalısınız

## 🐛 Sorun Giderme

### Sorun 1: 404 Hatası (Sayfa Yenilendiğinde)

**Çözüm:** `.htaccess` dosyasını kontrol edin. React Router için rewrite rules gerekli.

### Sorun 2: API Bağlantı Hatası

**Kontrol:**
- Browser Console'da network tab'ı açın
- API isteklerini kontrol edin
- CORS hatası varsa, backend'de `FRONTEND_BASE_URL` doğru mu?

### Sorun 3: Google Maps Çalışmıyor

**Kontrol:**
- `VITE_GOOGLE_PLACES_API_KEY` doğru mu?
- Google Cloud Console'da API key'in domain'i authorized mı?
- Browser Console'da Google Maps hatalarını kontrol edin

### Sorun 4: Build Başarısız

**Kontrol:**
- Node.js versiyonu (v18+ gerekli)
- `pnpm install` başarılı mı?
- Environment variables build sırasında mevcut mu?

## 📝 Checklist

- [ ] Local'de production build başarılı
- [ ] `dist` klasörü oluşturuldu
- [ ] Environment variables ayarlandı
- [ ] Dosyalar `public_html`'e yüklendi
- [ ] `.htaccess` dosyası oluşturuldu
- [ ] Site erişilebilir
- [ ] API bağlantısı çalışıyor
- [ ] React Router çalışıyor
- [ ] Google Maps çalışıyor (varsa)
- [ ] Admin panel erişilebilir
- [ ] Tüm sayfalar çalışıyor

## 🎯 Hızlı Deployment Komutları

```bash
# 1. Build
cd packages/web
pnpm build

# 2. Test (local)
pnpm preview

# 3. Dosyaları hazırla
# packages/web/dist klasörünü zip'le veya File Manager'a yükle
```

## 📞 Destek

Sorun yaşarsanız:
1. Browser Console hatalarını kontrol edin
2. Hostinger logs'ları kontrol edin
3. API health check yapın
4. Network tab'ında istekleri kontrol edin


