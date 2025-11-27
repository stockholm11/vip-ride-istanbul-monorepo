# Hostinger Deployment - Özel Ayarlar

Bu dosya Hostinger platformuna özel detayları içerir.

---

## 📁 File Manager Kullanımı

### Dosya Yükleme

1. **File Manager** açın
2. `public_html` klasörüne gidin
3. **Upload** butonuna tıklayın
4. Dosyaları seçin ve yükleyin

**Öneri:** FTP kullanın (daha hızlı ve kolay)

---

## 🔧 FTP Ayarları

### FTP Bilgilerini Alma

1. Hostinger hPanel'de **FTP Accounts** bölümüne gidin
2. Mevcut FTP hesabınızı görün veya yeni oluşturun
3. Bilgileri not edin:
   - **Host:** `ftp.yourdomain.com` (veya Hostinger'den verilen)
   - **User:** `_________________`
   - **Password:** `_________________`
   - **Port:** `21`

### FTP Client Ayarları

**FileZilla örneği:**

1. FileZilla'yı açın
2. **File** > **Site Manager**
3. **New Site** tıklayın
4. Bilgileri girin:
   - **Host:** `ftp.yourdomain.com`
   - **Protocol:** `FTP - File Transfer Protocol`
   - **Encryption:** `Use explicit FTP over TLS if available`
   - **Logon Type:** `Normal`
   - **User:** `_________________`
   - **Password:** `_________________`
5. **Connect** tıklayın

### Dosya Yükleme (FTP)

1. FTP ile bağlanın
2. Sol tarafta: `packages/web/dist` klasörünü açın
3. Sağ tarafta: `public_html` klasörüne gidin
4. Sol taraftaki TÜM dosyaları seçin
5. Sağ tarafa sürükleyin (drag & drop)
6. Yükleme tamamlanana kadar bekleyin

---

## 📄 .htaccess Dosyası

### Neden Gerekli?

React Router client-side routing kullanır. Tüm route'lar `index.html`'e yönlendirilmeli.

### Oluşturma

1. `public_html` klasöründe `.htaccess` dosyası oluşturun
2. İçine şunu yapıştırın:

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

3. Dosyayı kaydedin

**Not:** `.htaccess` dosyası görünmeyebilir (hidden file). File Manager'da "Show Hidden Files" seçeneğini aktif edin.

---

## 🗄️ MySQL Database Ayarları

### Database Hostname

Hostinger'de `localhost` yerine özel bir hostname kullanılabilir:

**Örnekler:**
- `localhost`
- `mysql.hostinger.com`
- `mysql.yourdomain.com`

**Nasıl Bulunur:**
1. hPanel'de **MySQL Databases** bölümüne gidin
2. Database'inizin yanında hostname görünür
3. Veya phpMyAdmin'de connection bilgilerinde görünür

### Remote Connection

Hostinger'de remote connection (dışarıdan bağlantı) için:

1. **MySQL Databases** > **Remote MySQL**
2. Render'ın IP adresini ekleyin
3. Veya `%` ekleyerek tüm IP'lere izin verin (güvenlik riski!)

**Öneri:** Render'ın IP adresini öğrenin ve sadece onu ekleyin.

---

## 🔒 SSL Sertifikası

### Let's Encrypt SSL

1. hPanel'de **Domains** bölümüne gidin
2. Domain'inizi seçin
3. **SSL** sekmesine gidin
4. **Let's Encrypt SSL** seçeneğini bulun
5. **Install** veya **Activate** tıklayın
6. 24 saat içinde aktif olur

### SSL Kontrolü

SSL aktif olduğunda:
- URL `https://` ile başlamalı
- Browser'da kilit ikonu görünmeli
- Mixed content uyarısı olmamalı

---

## 📊 phpMyAdmin Kullanımı

### Giriş

1. hPanel'de **phpMyAdmin** tıklayın
2. Otomatik giriş yapılır

### SQL Dosyası Yükleme

1. phpMyAdmin'de database'inizi seçin (sol menü)
2. Üst menüden **SQL** sekmesine tıklayın
3. **Import** butonuna tıklayın
4. `000_initial_schema.sql` dosyasını seçin
5. **Go** tıklayın

**Veya:**

1. **SQL** sekmesine gidin
2. SQL dosyasının içeriğini kopyalayın
3. SQL alanına yapıştırın
4. **Go** tıklayın

---

## 🐛 Hostinger'de Yaygın Sorunlar

### 1. Dosyalar Görünmüyor

**Çözüm:**
- File Manager'da "Show Hidden Files" aktif edin
- `.htaccess` dosyası görünmeyebilir

### 2. 404 Hatası (Sayfa Bulunamadı)

**Çözüm:**
- `.htaccess` dosyası var mı kontrol edin
- `index.html` dosyası `public_html` içinde mi?
- File permissions doğru mu? (644)

### 3. Database Bağlantı Hatası

**Çözüm:**
- `DB_HOST` değerini kontrol edin (localhost yerine tam hostname)
- Remote connection izni var mı?
- Database user'ın yetkileri doğru mu?

### 4. SSL Sertifika Aktif Olmuyor

**Çözüm:**
- 24 saat bekleyin
- DNS kayıtları doğru mu kontrol edin
- Hostinger support'a başvurun

### 5. Dosya Yükleme Limit Aşımı

**Çözüm:**
- FTP kullanın (daha büyük dosyalar için)
- Veya dosyaları ZIP olarak yükleyip çıkarın

---

## 📁 Dosya Yapısı

### Doğru Yapı

```
public_html/
├── index.html
├── assets/
│   ├── index-xxx.js
│   ├── index-xxx.css
│   └── ...
├── .htaccess
└── (diğer dosyalar)
```

### Kontrol

- [ ] `index.html` `public_html` içinde mi?
- [ ] `assets` klasörü var mı?
- [ ] `.htaccess` dosyası var mı?
- [ ] Tüm dosyalar yüklendi mi?

---

## 🔐 Güvenlik

### File Permissions

- Dosyalar: `644`
- Klasörler: `755`
- `.htaccess`: `644`

### .htaccess Güvenlik (Opsiyonel)

Daha fazla güvenlik için `.htaccess`'e ekleyebilirsiniz:

```apache
# Directory listing'i kapat
Options -Indexes

# .env dosyalarını engelle
<FilesMatch "\.env$">
  Order allow,deny
  Deny from all
</FilesMatch>
```

---

## 📞 Hostinger Support

Sorun yaşarsanız:
1. Hostinger hPanel'deki **Support** bölümüne gidin
2. Ticket açın
3. Veya canlı destek kullanın

---

**Not:** Bu dosya Hostinger'a özeldir. Genel deployment rehberi için `DEPLOYMENT_GUIDE.md` dosyasına bakın.

