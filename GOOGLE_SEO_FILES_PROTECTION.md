# Google SEO Dosyalarını Koruma Rehberi

## 🎯 Amaç

Frontend deployment sırasında Google Search Console verification dosyalarını ve SEO dosyalarını korumak.

## 📋 Korunması Gereken Dosyalar

### 1. Google Search Console Verification Dosyaları

Bu dosyalar Google'ın sitenizi tanıması için kritiktir. **KESINLIKLE silmeyin veya değiştirmeyin!**

**Olası dosya isimleri:**
- `google*.html` (örn: `google1234567890abcdef.html`)
- `google*.txt` (örn: `google1234567890abcdef.txt`)
- `google-site-verification.html`
- `google*.xml` (nadir)

**Nasıl Tespit Edilir:**
1. File Manager'da `public_html` klasörüne gidin
2. "Show Hidden Files" seçeneğini aktif edin
3. `google` ile başlayan dosyaları arayın

**Ne Yapmalı:**
- ✅ Bu dosyaları **OLDUĞU GİBİ BIRAKIN**
- ✅ Yeni build'de bu dosyalar yok (normal, çünkü Google tarafından oluşturulur)
- ✅ Eski dosyaları koruyun

### 2. SEO Dosyaları

#### `robots.txt`
- **Yeni build'de var:** ✅
- **Eski versiyonu koruyun mu?** 
  - Eğer eski versiyon daha güncel ve özel kurallar içeriyorsa → Koruyun
  - Eğer yeni versiyon daha iyiyse → Yeni versiyonu yükleyin

#### `sitemap.xml`
- **Yeni build'de var:** ✅
- **Eski versiyonu koruyun mu?**
  - Eğer eski versiyon daha güncel ve daha fazla URL içeriyorsa → Koruyun
  - Eğer yeni versiyon daha kapsamlıysa → Yeni versiyonu yükleyin

#### `site.webmanifest`
- **Yeni build'de var:** ✅
- Genellikle aynı kalır, yeni versiyonu yükleyebilirsiniz

## 🔍 Dosyaları Tespit Etme

### File Manager'da

1. `public_html` klasörüne gidin
2. Arama kutusuna `google` yazın
3. Google ile başlayan dosyaları bulun
4. Bu dosyaları **NOT ALIN** (isimlerini)

### FTP ile

```bash
# Google dosyalarını bul
ls -la public_html/google*

# Tüm Google dosyalarını listele
find public_html -name "google*" -type f
```

## ✅ Deployment Sırasında Yapılacaklar

### Adım 1: Google Dosyalarını Tespit Et
- [ ] `google*.html` dosyalarını bul
- [ ] `google*.txt` dosyalarını bul
- [ ] İsimlerini not al

### Adım 2: Yedek Al
- [ ] Google dosyalarını yedek klasörüne kopyala
- [ ] VEYA sadece isimlerini not al (silinmeyecek)

### Adım 3: Yeni Dosyaları Yükle
- [ ] `index.html` yükle
- [ ] `assets/` klasörünü yükle
- [ ] `.htaccess` yükle
- [ ] **Google dosyalarını YÜKLEME** (eski versiyonları koru)

### Adım 4: Kontrol Et
- [ ] Google dosyaları hala `public_html`'de var mı?
- [ ] Google Search Console'da site hala doğrulanmış mı?

## 🚨 Eğer Google Dosyaları Silinirse

### Sorun
Google Search Console'da site doğrulaması kaybolur.

### Çözüm

#### Yöntem 1: HTML Meta Tag (Önerilen)
1. Google Search Console'a gidin
2. **Settings** > **Ownership verification**
3. **HTML tag** yöntemini seçin
4. Meta tag'i kopyalayın
5. `index.html` dosyasının `<head>` bölümüne ekleyin

**Örnek:**
```html
<meta name="google-site-verification" content="rC9vmrakMvCdcoz2R9bSFfToM265L0HnMjgar0HmkYk" />
```

**Not:** Yeni build'de bu meta tag zaten var! (`packages/web/index.html` satır 182)

#### Yöntem 2: HTML Dosyası Yükleme
1. Google Search Console'da **HTML file** yöntemini seçin
2. İndirilen dosyayı `public_html`'e yükleyin
3. Doğrulamayı tamamlayın

#### Yöntem 3: DNS Kaydı
1. Google Search Console'da **DNS record** yöntemini seçin
2. DNS kaydını domain ayarlarınıza ekleyin

## 📝 Best Practices

1. **Her zaman yedek alın** - Deployment öncesi tüm dosyaları yedekleyin
2. **Google dosyalarını listeleyin** - Deployment öncesi Google dosyalarını not alın
3. **Test edin** - Deployment sonrası Google Search Console'u kontrol edin
4. **Dokümantasyon** - Hangi Google dosyalarının olduğunu dokümante edin

## 🔗 İlgili Dosyalar

- `packages/web/index.html` - Google verification meta tag içerir (satır 182)
- `packages/web/dist/index.html` - Build edilmiş versiyon
- `packages/web/public/robots.txt` - Robots.txt kaynağı
- `packages/web/public/sitemap.xml` - Sitemap kaynağı

## ✅ Kontrol Listesi

- [ ] Google verification dosyaları tespit edildi
- [ ] Google dosyalarının isimleri not edildi
- [ ] Yedek alındı
- [ ] Yeni dosyalar yüklendi (Google dosyaları hariç)
- [ ] Google dosyaları korundu
- [ ] Google Search Console'da site hala doğrulanmış
- [ ] `index.html`'de Google meta tag var


