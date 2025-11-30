# Frontend Deployment - Adım Adım Rehber

## ✅ Build Tamamlandı!

Production build başarıyla oluşturuldu:
- 📁 **Build klasörü:** `packages/web/dist`
- 🌐 **API URL:** `https://vip-ride-api.onrender.com`
- 📄 **.htaccess:** Kopyalandı

## 🚀 Hostinger'a Deployment

### Yöntem 1: File Manager (Önerilen - Kolay)

#### Adım 1: Dosyaları Hazırlama
✅ Build tamamlandı - `packages/web/dist` klasörü hazır

#### Adım 2: Hostinger File Manager'a Giriş
1. **Hostinger hPanel**'e giriş yapın
2. **File Manager**'ı açın
3. **`public_html`** klasörüne gidin

#### Adım 3: Mevcut Dosyaları Yedekleme (Varsa)
- Eğer `public_html` içinde dosyalar varsa, önce yedekleyin
- Tüm dosyaları seçip bir klasöre taşıyın (örn: `backup_old`)

#### Adım 4: Yeni Dosyaları Yükleme
1. **Upload** butonuna tıklayın
2. **`packages/web/dist`** klasörünü açın
3. **TÜM dosyaları seçin:**
   - `index.html`
   - `assets/` klasörü (tüm içeriğiyle)
   - `.htaccess` dosyası
   - Diğer tüm dosyalar (favicon, robots.txt, vb.)
4. **Upload** edin

**ÖNEMLİ:** `.htaccess` dosyası görünmeyebilir (hidden file). File Manager'da **"Show Hidden Files"** seçeneğini aktif edin.

#### Adım 5: Kontrol
1. Tarayıcıda domain'inizi açın: `https://yourdomain.com`
2. Site açılıyor mu kontrol edin
3. Browser Console'u açın (F12) ve hataları kontrol edin

---

### Yöntem 2: FTP (Daha Hızlı)

#### Adım 1: FTP Bilgilerini Alma
1. Hostinger hPanel > **FTP Accounts**
2. FTP bilgilerinizi not edin:
   - **Host:** `ftp.yourdomain.com`
   - **User:** `your_ftp_user`
   - **Password:** `your_ftp_password`
   - **Port:** `21`

#### Adım 2: FTP Client ile Bağlanma
**FileZilla kullanımı:**
1. FileZilla'yı açın
2. **File** > **Site Manager** > **New Site**
3. Bilgileri girin:
   - **Host:** `ftp.yourdomain.com`
   - **Protocol:** `FTP - File Transfer Protocol`
   - **Encryption:** `Use explicit FTP over TLS if available`
   - **Logon Type:** `Normal`
   - **User:** FTP kullanıcı adınız
   - **Password:** FTP şifreniz
4. **Connect** tıklayın

#### Adım 3: Dosyaları Yükleme
1. **Sol tarafta:** `packages/web/dist` klasörünü açın
2. **Sağ tarafta:** `public_html` klasörüne gidin
3. **Sol taraftaki TÜM dosyaları seçin:**
   - `index.html`
   - `assets/` klasörü
   - `.htaccess`
   - Diğer tüm dosyalar
4. **Sağ tarafa sürükleyin** (drag & drop)
5. Yükleme tamamlanana kadar bekleyin

---

## 🔧 Environment Variables

### Google Maps API Key

Eğer Google Maps kullanıyorsanız, build sırasında `VITE_GOOGLE_PLACES_API_KEY` ayarlanmalı:

**Windows PowerShell:**
```powershell
$env:VITE_GOOGLE_PLACES_API_KEY="your_api_key_here"
$env:VITE_API_URL="https://vip-ride-api.onrender.com"
pnpm build
```

**Linux/Mac:**
```bash
export VITE_GOOGLE_PLACES_API_KEY="your_api_key_here"
export VITE_API_URL="https://vip-ride-api.onrender.com"
pnpm build
```

**Not:** API key build sırasında kod içine gömülür. Production'da farklı bir key kullanmak istiyorsanız, yeniden build yapmanız gerekir.

---

## ✅ Deployment Sonrası Kontroller

### 1. Site Erişilebilirliği
- [ ] Ana sayfa açılıyor: `https://yourdomain.com`
- [ ] 404 hatası yok

### 2. API Bağlantısı
- [ ] Browser Console'u açın (F12)
- [ ] Network tab'ında API istekleri görünüyor
- [ ] CORS hatası yok
- [ ] API'den veri geliyor

### 3. React Router
- [ ] Farklı sayfalara navigate ediliyor
- [ ] Sayfa yenilendiğinde 404 hatası yok
- [ ] URL'ler doğru çalışıyor

### 4. Özellikler
- [ ] Google Maps çalışıyor (varsa)
- [ ] Formlar çalışıyor
- [ ] Admin panel erişilebilir
- [ ] Ödeme sayfası çalışıyor

---

## 🐛 Sorun Giderme

### Sorun 1: 404 Hatası (Sayfa Yenilendiğinde)
**Çözüm:** `.htaccess` dosyasının `public_html` içinde olduğundan emin olun.

### Sorun 2: API Bağlantı Hatası
**Kontrol:**
- Browser Console > Network tab
- API isteklerinin URL'leri doğru mu?
- CORS hatası varsa, backend'de `FRONTEND_BASE_URL` kontrol edin

### Sorun 3: Google Maps Çalışmıyor
**Kontrol:**
- Build sırasında `VITE_GOOGLE_PLACES_API_KEY` ayarlı mıydı?
- Google Cloud Console'da API key'in domain'i authorized mı?

### Sorun 4: CSS/JS Yüklenmiyor
**Kontrol:**
- `assets/` klasörü yüklendi mi?
- Dosya yolları doğru mu?
- Browser Console'da 404 hataları var mı?

---

## 📋 Hızlı Komutlar

### Yeni Build Yapma
```powershell
# Windows PowerShell
cd packages/web
$env:VITE_API_URL="https://vip-ride-api.onrender.com"
$env:VITE_GOOGLE_PLACES_API_KEY="your_key_here"
pnpm build
Copy-Item .htaccess dist/.htaccess
```

### Build Dosyalarını Kontrol Etme
```powershell
# dist klasörünü aç
explorer packages/web/dist
```

---

## 🎯 Sonraki Adımlar

1. ✅ Build tamamlandı
2. ⏳ Hostinger'a dosyaları yükleyin
3. ⏳ Siteyi test edin
4. ⏳ Domain'i kontrol edin
5. ⏳ SSL sertifikasını kontrol edin (HTTPS)

**Başarılar! 🚀**


