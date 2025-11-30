# API URL Doğrulama Rehberi

## ✅ Build Sonrası Kontrol

### Yöntem 1: Otomatik Script (Önerilen)

```bash
node scripts/check-api-url.js
```

Bu script:
- ✅ Doğru API URL'i (`https://vip-ride-api.onrender.com`) arar
- ❌ Yanlış API URL'leri (`localhost:3000`, vb.) arar
- 📊 Sonuçları gösterir

### Yöntem 2: Manuel Kontrol

#### Windows PowerShell:
```powershell
# Doğru URL'i ara
Select-String -Path "packages/web/dist/assets/*.js" -Pattern "vip-ride-api\.onrender\.com"

# Yanlış URL'i ara (bulunmamalı)
Select-String -Path "packages/web/dist/assets/*.js" -Pattern "localhost:3000"
```

#### Linux/Mac:
```bash
# Doğru URL'i ara
grep -r "vip-ride-api.onrender.com" packages/web/dist/assets/

# Yanlış URL'i ara (bulunmamalı)
grep -r "localhost:3000" packages/web/dist/assets/
```

### Yöntem 3: Browser'da Test

1. **Siteyi açın:** `https://yourdomain.com`
2. **F12** tuşuna basın (Developer Tools)
3. **Network** tab'ına gidin
4. **Sayfayı yenileyin** (F5)
5. **API isteklerini kontrol edin:**
   - İstekler `https://vip-ride-api.onrender.com` adresine gidiyor mu?
   - CORS hatası var mı?
   - 200 OK yanıtları alıyor musunuz?

### Yöntem 4: Browser Console

Browser Console'da (F12 > Console) şunu çalıştırın:

```javascript
// API base URL'i kontrol et
console.log('API URL:', import.meta.env.VITE_API_URL);

// Veya axios instance'ını kontrol et
// (Eğer global olarak expose edilmişse)
```

**Not:** Build edilmiş kodda `import.meta.env` minified olabilir, bu yöntem her zaman çalışmayabilir.

---

## 📊 Beklenen Sonuçlar

### ✅ Başarılı Build

- ✅ JavaScript dosyalarında `vip-ride-api.onrender.com` bulunmalı
- ❌ JavaScript dosyalarında `localhost:3000` bulunmamalı
- ✅ Browser Network tab'ında API istekleri `https://vip-ride-api.onrender.com` adresine gidiyor
- ✅ API istekleri başarılı (200 OK)

### ❌ Hatalı Build

- ❌ JavaScript dosyalarında `localhost:3000` bulunuyor
- ❌ API istekleri `localhost:3000` adresine gidiyor
- ❌ CORS hatası alıyorsunuz
- ❌ Network tab'ında 404 veya connection refused hataları

---

## 🔧 Sorun Giderme

### Sorun 1: Hala localhost:3000 Görünüyor

**Çözüm:**
```powershell
# 1. dist klasörünü sil
Remove-Item -Recurse -Force packages/web/dist

# 2. Environment variable'ı ayarla
$env:VITE_API_URL="https://vip-ride-api.onrender.com"

# 3. Yeniden build yap
cd packages/web
pnpm build
```

### Sorun 2: API URL undefined

**Sebep:** Environment variable build sırasında ayarlanmamış.

**Çözüm:**
```powershell
# Kontrol et
echo $env:VITE_API_URL

# Ayarla ve build yap
$env:VITE_API_URL="https://vip-ride-api.onrender.com"
pnpm build
```

### Sorun 3: Browser'da API Çalışmıyor

**Kontrol:**
1. Browser Console'da hata var mı?
2. Network tab'ında API istekleri görünüyor mu?
3. CORS hatası var mı?
4. Backend çalışıyor mu? (`https://vip-ride-api.onrender.com/api/health`)

---

## ✅ Hızlı Test

### 1. Script ile Kontrol
```bash
node scripts/check-api-url.js
```

### 2. Browser'da Test
1. Siteyi açın
2. F12 > Network
3. Sayfayı yenileyin
4. API isteklerini kontrol edin

### 3. API Health Check
Browser Console'da:
```javascript
fetch('https://vip-ride-api.onrender.com/api/health')
  .then(r => r.json())
  .then(console.log)
```

**Beklenen:** `{status: "ok"}`

---

## 📝 Notlar

- **CSP (Content Security Policy):** `index.html`'deki CSP ayarları sadece güvenlik için. API çağrıları JavaScript kodundan yapılır.
- **Minified Kod:** Build edilmiş kod minified olduğu için API URL farklı formatta görünebilir (normal).
- **Environment Variable:** Build sırasında ayarlanmalı, build sonrası değiştirilemez.

---

## 🎯 Özet

**Başarılı build için:**
- ✅ Script: `vip-ride-api.onrender.com` bulundu, `localhost:3000` bulunmadı
- ✅ Browser: API istekleri doğru adrese gidiyor
- ✅ Network: 200 OK yanıtları alınıyor

**Şu anki durumunuz:** ✅ API URL doğru ayarlanmış!


