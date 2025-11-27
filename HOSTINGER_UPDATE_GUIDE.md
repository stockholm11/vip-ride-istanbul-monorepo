# Hostinger Dosya Güncelleme Rehberi

## 📋 Mevcut Durum

Eski projeden kalan dosyalar `public_html` klasöründe:
- ✅ `assets/` klasörü (eski)
- ✅ `.htaccess` dosyası (eski)
- ✅ `index.html` (eski)
- ✅ Icon dosyaları (favicon, android-chrome, apple-touch-icon)
- ✅ `robots.txt`, `sitemap.xml`, `site.webmanifest`
- ✅ **Google Search Console verification dosyaları** (google*.html, google*.txt) - **KORUNMALI!**
- ✅ Diğer SEO dosyaları
- ✅ Diğer dosyalar

## ⚠️ ÖNEMLİ: Google Search Console Dosyaları

**Google Search Console verification dosyalarını KESINLIKLE silmeyin veya değiştirmeyin!**

Bu dosyalar genellikle şu isimlerle olur:
- `google*.html` (örn: `google1234567890abcdef.html`)
- `google*.txt` (örn: `google1234567890abcdef.txt`)
- `google-site-verification.html`

**Bu dosyalar Google'ın sitenizi tanıması için gereklidir. Silerseniz Google Search Console'dan doğrulamanızı yeniden yapmanız gerekir!**

## 🚀 Güncelleme Adımları

### Yöntem 1: File Manager ile (Önerilen)

#### Adım 1: Eski Dosyaları Yedekleme

1. **File Manager**'da `public_html` klasörüne gidin
2. **Tüm dosyaları seçin** (Ctrl+A veya checkbox ile)
3. **Sağ tıklayın** > **"Kopyala"** (Copy)
4. **Yeni klasör oluşturun:** `backup_old_$(tarih)` (örn: `backup_old_2024_11_28`)
5. **Yedek klasörüne yapıştırın**

**VEYA daha kolay:**
- Tüm dosyaları seçin
- **"Taşı"** (Move) ile `backup_old` klasörüne taşıyın

#### Adım 2: Yeni Dosyaları Yükleme

1. **Local'de `packages/web/dist` klasörünü açın**
2. **Yüklenecek dosyaları seçin:**
   - ✅ `index.html` (YENİ - API URL güncel)
   - ✅ `assets/` klasörü (YENİ - güncel build)
   - ✅ `.htaccess` (YENİ - React Router için)
   - ⚠️ Icon dosyaları (aynı kalabilir veya yeni)
   - ⚠️ `robots.txt`, `sitemap.xml`, `site.webmanifest` (yeni build'de var, ama eski versiyonları koruyabilirsiniz)

3. **File Manager'da `public_html` klasörüne gidin**
4. **Upload** butonuna tıklayın
5. **Dosyaları seçin ve yükleyin**

**ÖNEMLİ:**
- `.htaccess` dosyası görünmeyebilir. "Show Hidden Files" seçeneğini aktif edin.
- `assets/` klasörünün TÜM içeriğini yükleyin (alt klasörler dahil).
- **Google verification dosyalarını (google*.html, google*.txt) YÜKLEMEYİN - ESKİLERİ KORUYUN!**

#### Adım 3: Eski Dosyaları Silme (Opsiyonel)

Eğer yedek aldıysanız, eski dosyaları silebilirsiniz:
1. Eski `assets/` klasörünü silin
2. Eski `index.html`'i silin (yeni zaten yüklendi)
3. Eski `.htaccess`'i silin (yeni zaten yüklendi)

**⚠️ KORUNMASI GEREKEN DOSYALAR (SİLMEYİN!):**
- ❌ **Google verification dosyaları** (`google*.html`, `google*.txt`) - **KESINLIKLE SİLMEYİN!**
- ⚠️ Icon dosyaları (`favicon.ico`, `android-chrome-*.png`, vb.) - Aynı kalabilir
- ⚠️ `robots.txt`, `sitemap.xml` - Eğer eski versiyonları daha güncelse koruyun

---

### Yöntem 2: FTP ile (Daha Hızlı)

#### Adım 1: Eski Dosyaları Yedekleme

1. **FileZilla ile bağlanın**
2. **Sağ tarafta:** `public_html` klasörüne gidin
3. **Tüm dosyaları seçin**
4. **Local'e indirin** (backup için)

#### Adım 2: Yeni Dosyaları Yükleme

1. **Sol tarafta:** `packages/web/dist` klasörünü açın
2. **Sağ tarafta:** `public_html` klasörüne gidin
3. **Eski dosyaları silin veya yedekleyin:**
   - `index.html` → Sil (yeni gelecek)
   - `assets/` → Sil (yeni gelecek)
   - `.htaccess` → Sil (yeni gelecek)

4. **Yeni dosyaları yükleyin:**
   - Sol taraftan `index.html`'i seçin → Sağ tarafa sürükleyin
   - Sol taraftan `assets/` klasörünü seçin → Sağ tarafa sürükleyin
   - Sol taraftan `.htaccess`'i seçin → Sağ tarafa sürükleyin
   - ⚠️ Diğer dosyalar (icon'lar, robots.txt, sitemap.xml) - Eski versiyonları koruyabilirsiniz

**⚠️ ÖNEMLİ:** Google verification dosyalarını (`google*.html`, `google*.txt`) YÜKLEMEYİN - ESKİLERİ KORUYUN!

---

## ✅ Kontrol Listesi

### Yükleme Öncesi
- [ ] Eski dosyalar yedeklendi
- [ ] Yeni build hazır (`packages/web/dist`)
- [ ] `.htaccess` dosyası dist klasöründe var
- [ ] Google verification dosyaları tespit edildi ve korunacak

### Yükleme Sonrası
- [ ] `index.html` yüklendi (yeni)
- [ ] `assets/` klasörü yüklendi (yeni, tüm içeriğiyle)
- [ ] `.htaccess` yüklendi (yeni)
- [ ] **Google verification dosyaları korundu** (google*.html, google*.txt)
- [ ] Site açılıyor: `https://yourdomain.com`
- [ ] Browser Console'da hata yok
- [ ] API bağlantısı çalışıyor
- [ ] Google Search Console'da site hala doğrulanmış durumda

---

## 🔍 Yeni Build'deki Önemli Değişiklikler

### 1. API URL Güncellendi
- **Eski:** Muhtemelen `localhost:3000` veya eski backend URL'i
- **Yeni:** `https://vip-ride-api.onrender.com` (production API)

### 2. Assets Klasörü Güncellendi
- **Eski:** Eski build'den kalan dosyalar
- **Yeni:** Yeni build'den gelen dosyalar (hash'li isimlerle)

### 3. .htaccess Güncellendi
- **Eski:** Eski routing kuralları
- **Yeni:** React Router için optimize edilmiş kurallar

---

## 🐛 Sorun Giderme

### Sorun 1: Site Açılmıyor
**Kontrol:**
- `index.html` yüklendi mi?
- Dosya izinleri doğru mu? (644 için dosyalar, 755 için klasörler)

### Sorun 2: CSS/JS Yüklenmiyor
**Kontrol:**
- `assets/` klasörü yüklendi mi?
- `assets/` klasörünün içinde dosyalar var mı?
- Browser Console'da 404 hataları var mı?

### Sorun 3: 404 Hatası (Sayfa Yenilendiğinde)
**Kontrol:**
- `.htaccess` dosyası yüklendi mi?
- `.htaccess` dosyasının içeriği doğru mu?
- Apache mod_rewrite aktif mi?

### Sorun 4: API Bağlantı Hatası
**Kontrol:**
- Browser Console > Network tab
- API isteklerinin URL'leri doğru mu?
- CORS hatası varsa, backend'de `FRONTEND_BASE_URL` kontrol edin

---

## 📝 Hızlı Komutlar

### Yeni Build Yapma (API URL ile)
```powershell
cd packages/web
$env:VITE_API_URL="https://vip-ride-api.onrender.com"
pnpm build
```

### Build Dosyalarını Kontrol Etme
```powershell
# dist klasörünü aç
explorer packages/web/dist
```

---

## 🎯 Özet

1. ✅ **Yedek Al:** Eski dosyaları `backup_old` klasörüne taşı
2. ✅ **Yükle:** Yeni `dist` klasöründeki dosyaları `public_html`'e yükle
3. ✅ **Test Et:** Siteyi aç ve kontrol et
4. ✅ **Temizle:** Eski dosyaları sil (yedek varsa)

**Başarılar! 🚀**

