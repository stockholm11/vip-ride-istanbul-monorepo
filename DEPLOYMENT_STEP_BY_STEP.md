# Production Deployment - Adım Adım Checklist

Bu dosya, deployment sürecini adım adım takip etmeniz için hazırlanmıştır. Her adımı tamamladıktan sonra ✅ işaretleyin.

---

## 📋 ÖN HAZIRLIK

### Adım 0: Proje Hazırlığı

- [ ] Projeyi build edin: `pnpm build` (hata yok mu kontrol edin)
- [ ] Git repository'niz güncel mi?
- [ ] .env dosyaları git'e commit edilmemiş mi? (`.gitignore` kontrolü)
- [ ] Tüm environment variable'ları listeleyin (aşağıdaki tabloyu doldurun)

**Environment Variables Listesi:**

| Variable | Değer | Nereden Alınacak | Durum |
|----------|-------|-----------------|-------|
| DB_HOST | | Hostinger hPanel | ⬜ |
| DB_USER | | Hostinger hPanel | ⬜ |
| DB_PASSWORD | | Hostinger hPanel | ⬜ |
| DB_NAME | | Hostinger hPanel | ⬜ |
| REDIS_URL | | Upstash Dashboard | ⬜ |
| ADMIN_EMAIL | | Kendi belirleyin | ⬜ |
| ADMIN_PASSWORD_HASH | | `migrate-password.js` ile | ⬜ |
| JWT_SECRET | | Kendi oluşturun (64 char) | ⬜ |
| FRONTEND_BASE_URL | | Domain'iniz | ⬜ |
| EMAIL_HOST | | SMTP sağlayıcınız | ⬜ |
| EMAIL_USER | | Email adresiniz | ⬜ |
| EMAIL_PASSWORD | | App password | ⬜ |
| IYZI_API_KEY | | Iyzico panel | ⬜ |
| IYZI_SECRET_KEY | | Iyzico panel | ⬜ |
| GOOGLE_MAPS_API_KEY | | Google Cloud Console | ⬜ |
| VITE_API_URL | | Render URL (deploy sonrası) | ⬜ |

---

## 🗄️ ADIM 1: DATABASE (HOSTINGER)

### 1.1. Hostinger hPanel'e Giriş

- [ ] Hostinger hesabınıza giriş yapın
- [ ] hPanel'e erişin

### 1.2. MySQL Database Oluşturma

- [ ] **MySQL Databases** bölümüne gidin
- [ ] **Create New Database** tıklayın
- [ ] Database adı: `vipride_db` (veya istediğiniz isim)
- [ ] **Create Database** tıklayın
- [ ] Database adını not edin: `_________________`

### 1.3. Database User Oluşturma

- [ ] **MySQL Users** bölümüne gidin
- [ ] **Create New User** tıklayın
- [ ] Kullanıcı adı: `_________________`
- [ ] Güçlü şifre oluşturun: `_________________`
- [ ] **Create User** tıklayın

### 1.4. User'a Yetki Verme

- [ ] **Add User To Database** bölümüne gidin
- [ ] User'ı seçin: `_________________`
- [ ] Database'i seçin: `_________________`
- [ ] **All Privileges** seçin
- [ ] **Add** tıklayın

### 1.5. Bağlantı Bilgilerini Not Etme

Hostinger hPanel'deki database bilgilerinden:

- [ ] **DB_HOST:** `_________________` (genellikle `localhost` veya `mysql.hostinger.com`)
- [ ] **DB_USER:** `_________________`
- [ ] **DB_PASSWORD:** `_________________`
- [ ] **DB_NAME:** `_________________`
- [ ] **DB_PORT:** `3306` (genellikle)

**Not:** Hostinger'de `localhost` yerine özel bir hostname olabilir. Database bilgilerinde tam hostname'i görebilirsiniz.

### 1.6. Database Schema'yı Yükleme

**Yöntem: phpMyAdmin (Önerilen)**

- [ ] Hostinger hPanel'den **phpMyAdmin**'e gidin
- [ ] Oluşturduğunuz database'i seçin (sol menüden)
- [ ] Üst menüden **SQL** sekmesine tıklayın
- [ ] `packages/infrastructure/migrations/000_initial_schema.sql` dosyasını açın
- [ ] Tüm içeriği kopyalayın
- [ ] phpMyAdmin SQL alanına yapıştırın
- [ ] **Go** butonuna tıklayın
- [ ] Başarılı mesajını görün

**Kontrol:**

- [ ] Sol menüde tablolar görünüyor mu?
  - [ ] `tour_categories`
  - [ ] `vehicles`
  - [ ] `tours`
  - [ ] `bookings`
  - [ ] `booking_passengers`
  - [ ] `booking_addons`
  - [ ] `add_ons`
  - [ ] `featured_transfers`

✅ **ADIM 1 TAMAMLANDI**

---

## 🚀 ADIM 2: BACKEND (RENDER)

### 2.1. Render Hesabı

- [ ] [Render.com](https://render.com) adresine gidin
- [ ] **Sign Up** ile hesap oluşturun (GitHub ile bağlayabilirsiniz)
- [ ] Email doğrulamasını yapın

### 2.2. Repository Bağlama

- [ ] Render dashboard'da **New +** tıklayın
- [ ] **Web Service** seçin
- [ ] GitHub repository'nizi seçin (veya manuel deploy)
- [ ] Repository bağlandı mı?

### 2.3. Build Ayarları

**Name:** `vip-ride-api` (veya istediğiniz isim)

**Environment:** `Node`

**Region:** Size en yakın region'ı seçin

**Branch:** `main` (veya `master`)

**Root Directory:** (Boş bırakın)

**Build Command:**
```bash
cd packages/api && pnpm install && pnpm build
```

- [ ] Build command'i yapıştırdınız mı?

**Start Command:**
```bash
cd packages/api && node dist/server.js
```

- [ ] Start command'i yapıştırdınız mı?

### 2.4. Environment Variables Ekleme

Render dashboard'da **Environment** sekmesine gidin:

**Database Variables:**
- [ ] `DB_HOST` = `_________________` (Hostinger'den)
- [ ] `DB_USER` = `_________________` (Hostinger'den)
- [ ] `DB_PASSWORD` = `_________________` (Hostinger'den)
- [ ] `DB_NAME` = `_________________` (Hostinger'den)
- [ ] `DB_PORT` = `3306`

**Redis (Şimdilik boş bırakın, sonraki adımda ekleyeceğiz):**
- [ ] `REDIS_URL` = (Şimdilik eklemeyin)

**Admin Variables:**
- [ ] `ADMIN_EMAIL` = `_________________`
- [ ] `ADMIN_PASSWORD_HASH` = `_________________` (bcrypt hash)
- [ ] `JWT_SECRET` = `_________________` (64 karakter)

**Frontend:**
- [ ] `FRONTEND_BASE_URL` = `https://yourdomain.com` (domain'iniz)

**Email:**
- [ ] `EMAIL_HOST` = `smtp.gmail.com` (veya sağlayıcınız)
- [ ] `EMAIL_PORT` = `465`
- [ ] `EMAIL_USER` = `_________________`
- [ ] `EMAIL_PASSWORD` = `_________________` (app password)

**Iyzico:**
- [ ] `IYZI_API_KEY` = `_________________`
- [ ] `IYZI_SECRET_KEY` = `_________________`
- [ ] `IYZI_BASE_URL` = `https://api.iyzipay.com`

**Google Maps:**
- [ ] `GOOGLE_MAPS_API_KEY` = `_________________`

**Node:**
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = (Render otomatik set eder, eklemeyin)

### 2.5. İlk Deploy

- [ ] **Create Web Service** tıklayın
- [ ] Deploy başladı mı? (5-10 dakika sürebilir)
- [ ] Deploy tamamlandı mı?
- [ ] Backend URL'i not edin: `https://_________________.onrender.com`

### 2.6. Backend Test

- [ ] Browser'da şu URL'i açın: `https://your-api.onrender.com/api/health`
- [ ] `{"status":"ok"}` görünüyor mu?
- [ ] Hata var mı? (Logs sekmesine bakın)

✅ **ADIM 2 TAMAMLANDI**

---

## 🔴 ADIM 3: REDIS (UPSTASH)

### 3.1. Upstash Hesabı

- [ ] [Upstash.com](https://upstash.com) adresine gidin
- [ ] **Sign Up** ile hesap oluşturun
- [ ] Email doğrulamasını yapın

### 3.2. Redis Database Oluşturma

- [ ] Dashboard'da **Create Database** tıklayın
- [ ] **Name:** `vip-ride-cache` (veya istediğiniz isim)
- [ ] **Type:** `Regional` (veya `Global`)
- [ ] **Region:** Backend'inize en yakın region'ı seçin
- [ ] **Create** tıklayın

### 3.3. Redis URL'ini Alma

- [ ] Database oluşturulduktan sonra **Details** sayfasına gidin
- [ ] **REST API** veya **Redis URL** bölümünden URL'i kopyalayın
- [ ] Redis URL'i not edin: `_________________`

**Format örneği:**
```
redis://default:password@host:port
```

### 3.4. Redis URL'ini Render'a Ekleme

- [ ] Render dashboard'a dönün
- [ ] Web service'inize gidin
- [ ] **Environment** sekmesine gidin
- [ ] `REDIS_URL` variable'ını ekleyin: `_________________`
- [ ] **Save Changes** tıklayın
- [ ] Render otomatik olarak yeniden deploy edecek (birkaç dakika)

**Not:** Redis opsiyonel. Bağlantı başarısız olursa uygulama çalışmaya devam eder.

✅ **ADIM 3 TAMAMLANDI**

---

## 🌐 ADIM 4: FRONTEND (HOSTINGER)

### 4.1. Environment Variables Hazırlama

- [ ] `packages/web/.env.production` dosyası oluşturun
- [ ] İçine şunu ekleyin:

```env
VITE_API_URL=https://your-api-name.onrender.com
VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

- [ ] `VITE_API_URL` = `_________________` (Render backend URL'i)
- [ ] `VITE_GOOGLE_PLACES_API_KEY` = `_________________`

### 4.2. Frontend Build

- [ ] Proje kök dizininde: `cd packages/web`
- [ ] Build yapın: `pnpm build`
- [ ] Build başarılı mı? (hata var mı?)
- [ ] `packages/web/dist` klasörü oluştu mu?

### 4.3. Hostinger File Manager

- [ ] Hostinger hPanel'e gidin
- [ ] **File Manager** açın
- [ ] `public_html` klasörüne gidin (veya domain'inizin root klasörüne)

### 4.4. Dosyaları Yükleme

**Yöntem: FTP (Önerilen)**

- [ ] FTP client (FileZilla, WinSCP) açın
- [ ] Hostinger FTP bilgilerinizle bağlanın
  - Host: `ftp.yourdomain.com` (veya Hostinger'den aldığınız)
  - User: `_________________`
  - Password: `_________________`
- [ ] `packages/web/dist` klasöründeki TÜM dosyaları seçin
- [ ] `public_html` klasörüne yükleyin

**Yöntem: File Manager**

- [ ] `packages/web/dist` klasöründeki tüm dosyaları ZIP olarak sıkıştırın
- [ ] Hostinger File Manager'da ZIP'i yükleyin
- [ ] ZIP'i çıkarın
- [ ] Dosyalar `public_html` içinde mi?

### 4.5. .htaccess Dosyası

- [ ] `public_html` klasöründe `.htaccess` dosyası oluşturun
- [ ] İçine şunu yapıştırın:

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

- [ ] Dosyayı kaydedin

### 4.6. Domain ve SSL

- [ ] Hostinger hPanel'de **Domains** bölümüne gidin
- [ ] Domain'inizi seçin
- [ ] **SSL** sekmesine gidin
- [ ] **Let's Encrypt SSL** aktif edin
- [ ] SSL aktif oldu mu? (24 saat içinde aktif olur)

✅ **ADIM 4 TAMAMLANDI**

---

## ✅ ADIM 5: TEST VE DOĞRULAMA

### 5.1. Backend Test

- [ ] Health check: `https://your-api.onrender.com/api/health`
  - [ ] `{"status":"ok"}` görünüyor mu?
- [ ] Admin login testi:
  - [ ] Frontend'den admin paneline gidin
  - [ ] Login yapın
  - [ ] Başarılı mı?

### 5.2. Frontend Test

- [ ] Domain'inize gidin: `https://yourdomain.com`
- [ ] Sayfa yükleniyor mu?
- [ ] Browser console'u açın (F12)
- [ ] Hata var mı? (kırmızı mesajlar)
- [ ] API istekleri çalışıyor mu? (Network sekmesi)

### 5.3. CORS Test

- [ ] Frontend'den API'ye istek gönderin
- [ ] Browser console'da CORS hatası var mı?
- [ ] İstekler başarılı mı?

### 5.4. Database Test

- [ ] phpMyAdmin'de test verisi ekleyin
- [ ] Frontend'de görünüyor mu?

### 5.5. Özellik Testleri

- [ ] Ana sayfa yükleniyor mu?
- [ ] Araç listesi görünüyor mu?
- [ ] Tur listesi görünüyor mu?
- [ ] Rezervasyon formu çalışıyor mu?
- [ ] Admin panel çalışıyor mu?

✅ **ADIM 5 TAMAMLANDI**

---

## 🎉 TEBRİKLER!

Production deployment tamamlandı! 

### Son Kontroller

- [ ] Tüm environment variable'lar doğru mu?
- [ ] SSL aktif mi?
- [ ] Backend çalışıyor mu?
- [ ] Frontend çalışıyor mu?
- [ ] Database bağlantısı çalışıyor mu?
- [ ] Admin login çalışıyor mu?

### Önemli Notlar

- Render free plan'da uygulama 15 dakika kullanılmazsa sleep moduna geçer
- İlk request yavaş olabilir (cold start)
- Production için paid plan önerilir
- Düzenli backup alın (database)

---

**Sorun mu var?** `DEPLOYMENT_GUIDE.md` dosyasındaki "Sorun Giderme" bölümüne bakın.

