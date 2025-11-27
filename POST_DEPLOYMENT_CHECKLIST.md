# Deployment Sonrası Kontrol Listesi

## ✅ Yüklenen Dosyalar

- [x] `index.html` - Yüklendi
- [x] `assets/` klasörü - Yüklendi

## ⚠️ Eksik Olabilecek Dosyalar

### 1. .htaccess Dosyası (ÖNEMLİ!)

`.htaccess` dosyası React Router için kritiktir. Eğer yüklemediyseniz:

1. **File Manager'da:**
   - `public_html` klasörüne gidin
   - **"Show Hidden Files"** seçeneğini aktif edin
   - `.htaccess` dosyası var mı kontrol edin

2. **Eğer yoksa:**
   - Local'de `packages/web/dist/.htaccess` dosyasını bulun
   - File Manager'da **"Upload"** ile yükleyin
   - VEYA File Manager'da **"New File"** > `.htaccess` oluşturup içeriğini yapıştırın

**İçerik:**
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

### 2. Diğer Dosyalar (Opsiyonel)

- `robots.txt` - SEO için (yeni build'de var)
- `sitemap.xml` - SEO için (yeni build'de var)
- `site.webmanifest` - PWA için
- Icon dosyaları (`favicon.ico`, `android-chrome-*.png`, vb.)

**Not:** Bu dosyalar yeni build'de var, ama eski versiyonları koruyabilirsiniz.

---

## 🧪 Site Testi

### 1. Ana Sayfa Testi

1. Tarayıcıda domain'inizi açın: `https://yourdomain.com`
2. Site açılıyor mu kontrol edin
3. **404 hatası alıyorsanız:** `.htaccess` dosyası eksik olabilir

### 2. Browser Console Kontrolü

1. **F12** tuşuna basın (Developer Tools)
2. **Console** tab'ına gidin
3. **Hataları kontrol edin:**
   - ❌ Kırmızı hatalar var mı?
   - ⚠️ Sarı uyarılar var mı?
   - ✅ Hata yoksa iyi!

### 3. Network Tab Kontrolü

1. **F12** > **Network** tab
2. Sayfayı yenileyin (F5)
3. **API isteklerini kontrol edin:**
   - İstekler `https://vip-ride-api.onrender.com` adresine gidiyor mu?
   - **Status:** 200 OK mi?
   - **CORS hatası** var mı?

### 4. React Router Testi

1. Ana sayfadan başka bir sayfaya gidin (örn: `/tr/transfer`)
2. Sayfa açılıyor mu?
3. **Sayfayı yenileyin (F5)**
4. **404 hatası alıyorsanız:** `.htaccess` dosyası eksik veya yanlış!

### 5. API Bağlantı Testi

Browser Console'da (F12 > Console) şunu çalıştırın:

```javascript
fetch('https://vip-ride-api.onrender.com/api/health')
  .then(r => r.json())
  .then(data => {
    console.log('✅ API çalışıyor:', data);
  })
  .catch(err => {
    console.error('❌ API hatası:', err);
  });
```

**Beklenen:** `{status: "ok"}`

---

## 🐛 Yaygın Sorunlar ve Çözümleri

### Sorun 1: 404 Hatası (Sayfa Yenilendiğinde)

**Belirtiler:**
- Ana sayfa açılıyor
- Başka sayfaya gidince çalışıyor
- Ama sayfayı yenileyince 404 hatası

**Çözüm:**
- `.htaccess` dosyasını yükleyin (yukarıdaki içerikle)
- File Manager'da "Show Hidden Files" aktif edin
- Dosya izinlerini kontrol edin (644 olmalı)

### Sorun 2: CSS/JS Yüklenmiyor

**Belirtiler:**
- Site açılıyor ama stil yok
- Console'da 404 hataları var

**Çözüm:**
- `assets/` klasörünün TÜM içeriği yüklendi mi kontrol edin
- Dosya yolları doğru mu kontrol edin
- Browser Console'da hangi dosyaların yüklenemediğini görün

### Sorun 3: API Bağlantı Hatası

**Belirtiler:**
- Console'da CORS hatası
- Network tab'ında API istekleri başarısız

**Çözüm:**
- API URL doğru mu? (`https://vip-ride-api.onrender.com`)
- Backend çalışıyor mu? (`https://vip-ride-api.onrender.com/api/health`)
- CORS ayarları doğru mu? (Backend'de `FRONTEND_BASE_URL` kontrol edin)

### Sorun 4: Google Maps Çalışmıyor

**Belirtiler:**
- Location autocomplete çalışmıyor
- Console'da Google Maps hatası

**Çözüm:**
- Google Places API key doğru mu?
- Build sırasında `VITE_GOOGLE_PLACES_API_KEY` ayarlı mıydı?
- Google Cloud Console'da API key'in domain'i authorized mı?

---

## ✅ Başarı Kriterleri

- [ ] Site açılıyor: `https://yourdomain.com`
- [ ] Browser Console'da hata yok
- [ ] Network tab'ında API istekleri başarılı (200 OK)
- [ ] React Router çalışıyor (sayfa yenilendiğinde 404 yok)
- [ ] API bağlantısı çalışıyor
- [ ] Google Maps çalışıyor (varsa)
- [ ] Formlar çalışıyor
- [ ] Admin panel erişilebilir

---

## 📞 Sonraki Adımlar

1. ✅ Dosyalar yüklendi
2. ⏳ `.htaccess` kontrolü yapın
3. ⏳ Siteyi test edin
4. ⏳ Browser Console'u kontrol edin
5. ⏳ API bağlantısını test edin

**Başarılar! 🚀**

