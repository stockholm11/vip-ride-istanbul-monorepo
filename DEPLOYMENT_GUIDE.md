# Production Deployment Rehberi - VIP Ride Istanbul

**Platformlar:**
- **Frontend:** Hostinger
- **Database:** Hostinger (MySQL)
- **Backend API:** Render
- **Redis:** Upstash

---

## 📋 İçindekiler

1. [Hazırlık Aşaması](#1-hazırlık-aşaması)
2. [Database Kurulumu (Hostinger)](#2-database-kurulumu-hostinger)
3. [Backend Deployment (Render)](#3-backend-deployment-render)
4. [Redis Kurulumu (Upstash)](#4-redis-kurulumu-upstash)
5. [Frontend Deployment (Hostinger)](#5-frontend-deployment-hostinger)
6. [Environment Variables](#6-environment-variables)
7. [Domain ve SSL Ayarları](#7-domain-ve-ssl-ayarları)
8. [Test ve Doğrulama](#8-test-ve-doğrulama)
9. [Sorun Giderme](#9-sorun-giderme)

---

## 1. Hazırlık Aşaması

### 1.1. Projeyi Build Edin

```bash
# Proje kök dizininde
pnpm build
```

Build başarılı olmalı. Hata varsa önce düzeltin.

### 1.2. Git Repository Hazırlığı

```bash
# .env dosyalarının git'e commit edilmediğinden emin olun
git status

# Eğer .env dosyaları görünüyorsa, .gitignore'u kontrol edin
```

### 1.3. Production Environment Variables Listesi

Aşağıdaki değerleri hazırlayın (sonraki adımlarda kullanacağız):

**Backend için:**
- Database connection bilgileri (Hostinger'den alınacak)
- Redis URL (Upstash'den alınacak)
- JWT_SECRET (64 karakter)
- ADMIN_PASSWORD_HASH (bcrypt hash)
- ADMIN_EMAIL
- Email SMTP bilgileri
- Iyzico API bilgileri
- FRONTEND_BASE_URL (production domain)
- GOOGLE_MAPS_API_KEY

**Frontend için:**
- VITE_API_URL (Render backend URL'i)
- VITE_GOOGLE_PLACES_API_KEY

---

## 2. Database Kurulumu (Hostinger)

### 2.1. MySQL Database Oluşturma

1. **Hostinger hPanel'e giriş yapın**
2. **MySQL Databases** bölümüne gidin
3. **Create New Database** tıklayın
4. Database adı verin (örn: `vipride_db`)
5. **Create Database** tıklayın

### 2.2. Database User Oluşturma

1. **MySQL Users** bölümüne gidin
2. **Create New User** tıklayın
3. Kullanıcı adı ve güçlü şifre oluşturun
4. **Create User** tıklayın

### 2.3. User'a Database Yetkisi Verme

1. **Add User To Database** bölümüne gidin
2. User ve Database'i seçin
3. **All Privileges** seçin
4. **Add** tıklayın

### 2.4. Database Bağlantı Bilgilerini Kaydedin

Şu bilgileri not edin (Render'da kullanacağız):
- **DB_HOST:** Genellikle `localhost` veya `mysql.hostinger.com`
- **DB_USER:** Oluşturduğunuz kullanıcı adı
- **DB_PASSWORD:** Oluşturduğunuz şifre
- **DB_NAME:** Oluşturduğunuz database adı
- **DB_PORT:** Genellikle `3306`

**Not:** Hostinger'de `localhost` yerine özel bir hostname olabilir. Hostinger hPanel'deki database bilgilerinde tam hostname'i görebilirsiniz.

### 2.5. Database Schema'yı Oluşturma

**Yöntem 1: phpMyAdmin ile (Önerilen)**

1. Hostinger hPanel'den **phpMyAdmin**'e gidin
2. Oluşturduğunuz database'i seçin
3. **SQL** sekmesine gidin
4. `packages/infrastructure/migrations/000_initial_schema.sql` dosyasını açın
5. İçeriğini kopyalayıp phpMyAdmin'e yapıştırın
6. **Go** tıklayın

**Yöntem 2: Command Line ile (Eğer erişiminiz varsa)**

```bash
mysql -h HOST -u USER -p DATABASE_NAME < packages/infrastructure/migrations/000_initial_schema.sql
```

### 2.6. Database Bağlantısını Test Edin

phpMyAdmin'de tabloların oluşturulduğunu kontrol edin:
- `tour_categories`
- `vehicles`
- `tours`
- `bookings`
- `booking_passengers`
- `booking_addons`
- `add_ons`
- `featured_transfers`

---

## 3. Backend Deployment (Render)

### 3.1. Render Hesabı Oluşturma

1. [Render.com](https://render.com) adresine gidin
2. **Sign Up** ile hesap oluşturun (GitHub ile bağlayabilirsiniz)

### 3.2. Yeni Web Service Oluşturma

1. Render dashboard'da **New +** tıklayın
2. **Web Service** seçin
3. GitHub repository'nizi bağlayın (veya manuel deploy)

### 3.3. Build Ayarları

**Name:** `vip-ride-api` (veya istediğiniz isim)

**Environment:** `Node`

**Build Command:**
```bash
cd packages/api && pnpm install && pnpm build
```

**Start Command:**
```bash
cd packages/api && node dist/server.js
```

**Root Directory:** (Boş bırakın veya proje kök dizini)

### 3.4. Environment Variables Ekleme

Render dashboard'da **Environment** sekmesine gidin ve şunları ekleyin:

```env
# Database (Hostinger)
DB_HOST=mysql.hostinger.com
DB_USER=u123456789_username
DB_PASSWORD=your_secure_password
DB_NAME=u123456789_dbname
DB_PORT=3306

# Redis (Upstash - sonraki adımda alınacak)
REDIS_URL=redis://default:password@host:port

# Admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD_HASH=$2b$12$... (bcrypt hash)
JWT_SECRET=your-64-character-secret

# Frontend URL
FRONTEND_BASE_URL=https://yourdomain.com

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Iyzico
IYZI_API_KEY=your_iyzi_api_key
IYZI_SECRET_KEY=your_iyzi_secret_key
IYZI_BASE_URL=https://api.iyzipay.com

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Node Environment
NODE_ENV=production
PORT=10000
```

**Önemli:** Render otomatik olarak `PORT` environment variable'ını set eder. Kodunuzda `process.env.PORT || 3000` kullanıyorsanız, Render'ın verdiği port'u kullanacaktır.

### 3.5. Package.json Script Kontrolü

`packages/api/package.json` dosyasında şu script'ler olmalı:

```json
{
  "scripts": {
    "build": "tsc --project tsconfig.json",
    "start": "node dist/server.js"
  }
}
```

### 3.6. Deploy

1. **Create Web Service** tıklayın
2. İlk deploy başlayacak (5-10 dakika sürebilir)
3. Deploy tamamlandığında URL alacaksınız: `https://your-api-name.onrender.com`

### 3.7. Backend URL'ini Not Edin

Render size bir URL verecek:
```
https://vip-ride-api.onrender.com
```

Bu URL'i frontend environment variable'ında kullanacağız.

---

## 4. Redis Kurulumu (Upstash)

### 4.1. Upstash Hesabı Oluşturma

1. [Upstash.com](https://upstash.com) adresine gidin
2. **Sign Up** ile hesap oluşturun

### 4.2. Redis Database Oluşturma

1. Dashboard'da **Create Database** tıklayın
2. **Name:** `vip-ride-cache` (veya istediğiniz isim)
3. **Type:** `Regional` (veya `Global`)
4. **Region:** Backend'inize en yakın region'ı seçin
5. **Create** tıklayın

### 4.3. Redis URL'ini Alın

1. Database oluşturulduktan sonra **Details** sayfasına gidin
2. **REST API** veya **Redis URL** bölümünden URL'i kopyalayın

**Format:**
```
redis://default:password@host:port
```

veya

```
rediss://default:password@host:port (SSL ile)
```

### 4.4. Redis URL'ini Render'a Ekleyin

1. Render dashboard'a dönün
2. **Environment** sekmesine gidin
3. `REDIS_URL` variable'ını ekleyin/güncelleyin:
   ```
   REDIS_URL=redis://default:password@host:port
   ```
4. **Save Changes** tıklayın
5. Render otomatik olarak yeniden deploy edecek

**Not:** Redis opsiyonel. Eğer Redis bağlantısı başarısız olursa, uygulama çalışmaya devam eder (fallback mekanizması var).

---

## 5. Frontend Deployment (Hostinger)

### 5.1. Frontend Build

```bash
# Proje kök dizininde
cd packages/web
pnpm build
```

Build çıktısı `packages/web/dist` klasöründe olacak.

### 5.2. Hostinger File Manager

1. Hostinger hPanel'e gidin
2. **File Manager** açın
3. `public_html` klasörüne gidin (veya domain'inizin root klasörüne)

### 5.3. Dosyaları Yükleme

**Yöntem 1: File Manager ile**

1. `packages/web/dist` klasöründeki tüm dosyaları seçin
2. ZIP olarak sıkıştırın
3. Hostinger File Manager'da yükleyin
4. ZIP'i çıkarın

**Yöntem 2: FTP ile (Önerilen)**

1. FTP client (FileZilla, WinSCP) kullanın
2. Hostinger FTP bilgilerinizle bağlanın
3. `packages/web/dist` klasöründeki tüm dosyaları `public_html` klasörüne yükleyin

**Yöntem 3: Git ile (Eğer Hostinger Git desteği varsa)**

Hostinger bazı planlarda Git desteği sunar. Bu durumda:
1. Repository'nizi clone edin
2. Build yapın
3. Dist klasörünü public_html'e kopyalayın

### 5.4. .htaccess Dosyası Oluşturma (SPA için)

`public_html` klasörüne `.htaccess` dosyası oluşturun:

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

Bu dosya React Router'ın client-side routing'i için gereklidir.

### 5.5. Environment Variables (Build-time)

Frontend build-time'da environment variable'lar kullanılır. `.env` dosyası oluşturun:

`packages/web/.env.production`:

```env
VITE_API_URL=https://your-api-name.onrender.com
VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

**Önemli:** Bu dosyayı build'den ÖNCE oluşturmalısınız!

```bash
# .env.production dosyasını oluşturduktan sonra
cd packages/web
pnpm build
```

Build çıktısında environment variable'lar embed edilmiş olacak.

---

## 6. Environment Variables Özeti

### Backend (Render)

```env
# Database
DB_HOST=mysql.hostinger.com
DB_USER=u123456789_username
DB_PASSWORD=your_password
DB_NAME=u123456789_dbname
DB_PORT=3306

# Redis
REDIS_URL=redis://default:password@host:port

# Admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD_HASH=$2b$12$...
JWT_SECRET=your-64-char-secret

# Frontend
FRONTEND_BASE_URL=https://yourdomain.com

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Iyzico
IYZI_API_KEY=your_key
IYZI_SECRET_KEY=your_secret
IYZI_BASE_URL=https://api.iyzipay.com

# Google Maps
GOOGLE_MAPS_API_KEY=your_key

# Node
NODE_ENV=production
PORT=10000
```

### Frontend (Build-time)

`packages/web/.env.production`:

```env
VITE_API_URL=https://your-api-name.onrender.com
VITE_GOOGLE_PLACES_API_KEY=your_key
```

---

## 7. Domain ve SSL Ayarları

### 7.1. Backend Domain (Render - Opsiyonel)

1. Render dashboard'da **Settings** > **Custom Domain**
2. Domain'inizi ekleyin
3. DNS kayıtlarını Render'ın verdiği bilgilere göre ayarlayın

**Not:** Render'ın verdiği URL (`https://your-api.onrender.com`) SSL ile gelir, ek domain ayarı opsiyonel.

### 7.2. Frontend Domain (Hostinger)

1. Hostinger hPanel'de **Domains** bölümüne gidin
2. Domain'inizi seçin
3. **SSL** sekmesinden ücretsiz SSL sertifikası aktif edin (Let's Encrypt)

### 7.3. DNS Ayarları

Eğer backend için custom domain kullanıyorsanız:

**A Record veya CNAME:**
- **Type:** CNAME
- **Name:** `api` (veya `backend`)
- **Value:** `your-api-name.onrender.com`

---

## 8. Test ve Doğrulama

### 8.1. Backend Test

1. **Health Check:**
   ```
   https://your-api.onrender.com/api/health
   ```
   Beklenen: `{"status":"ok"}`

2. **Admin Login:**
   - Admin paneline gidin
   - Login yapın
   - Başarılı olmalı

### 8.2. Frontend Test

1. Domain'inize gidin
2. Sayfa yüklenmeli
3. Browser console'da hata olmamalı
4. API istekleri çalışmalı

### 8.3. Database Test

1. phpMyAdmin'de veri ekleyin
2. Frontend'de görünmeli

### 8.4. CORS Test

1. Frontend'den API'ye istek gönderin
2. Browser console'da CORS hatası olmamalı

---

## 9. Sorun Giderme

### 9.1. Backend Başlamıyor

**Log kontrolü:**
- Render dashboard'da **Logs** sekmesine bakın
- Hata mesajlarını kontrol edin

**Yaygın sorunlar:**
- Database bağlantı hatası → DB_HOST, DB_USER, DB_PASSWORD kontrol edin
- Port hatası → `PORT` environment variable'ını kontrol edin
- Build hatası → `package.json` script'lerini kontrol edin

### 9.2. Frontend API'ye Bağlanamıyor

**Kontrol listesi:**
- `VITE_API_URL` doğru mu?
- Backend çalışıyor mu? (`/api/health`)
- CORS ayarları doğru mu? (`FRONTEND_BASE_URL`)
- Browser console'da hata var mı?

### 9.3. Database Bağlantı Hatası

**Hostinger özel durumlar:**
- `localhost` yerine özel hostname kullanılabilir
- Port 3306 olmalı
- Remote connection izni gerekebilir (Hostinger support'a sorun)

### 9.4. Redis Bağlantı Hatası

- Redis opsiyonel, uygulama çalışmaya devam eder
- Log'larda Redis uyarısı görünebilir, bu normal

### 9.5. SSL Sertifika Sorunu

- Hostinger'de Let's Encrypt SSL otomatik aktif olmalı
- 24 saat içinde aktif olur
- Manuel olarak aktif edebilirsiniz

---

## 10. Production Checklist

### Deployment Öncesi

- [ ] Proje build edildi (hata yok)
- [ ] .env dosyaları git'e commit edilmedi
- [ ] Database oluşturuldu ve schema yüklendi
- [ ] Environment variable'lar hazırlandı

### Backend (Render)

- [ ] Render'da web service oluşturuldu
- [ ] Environment variable'lar eklendi
- [ ] İlk deploy başarılı
- [ ] Health check çalışıyor
- [ ] Admin login çalışıyor

### Redis (Upstash)

- [ ] Upstash database oluşturuldu
- [ ] Redis URL Render'a eklendi
- [ ] Redis bağlantısı çalışıyor (opsiyonel)

### Frontend (Hostinger)

- [ ] .env.production oluşturuldu
- [ ] Frontend build edildi
- [ ] Dosyalar Hostinger'a yüklendi
- [ ] .htaccess dosyası eklendi
- [ ] Domain'e erişilebiliyor
- [ ] SSL aktif

### Test

- [ ] Backend health check çalışıyor
- [ ] Frontend yükleniyor
- [ ] API istekleri çalışıyor
- [ ] CORS hatası yok
- [ ] Admin login çalışıyor
- [ ] Database bağlantısı çalışıyor

---

## 📞 Destek

Sorun yaşarsanız:
1. Render logs'u kontrol edin
2. Browser console'u kontrol edin
3. Database bağlantısını test edin
4. Environment variable'ları doğrulayın

**Önemli Notlar:**
- Render free plan'da uygulama 15 dakika kullanılmazsa sleep moduna geçer
- İlk request yavaş olabilir (cold start)
- Production için paid plan önerilir

---

**Başarılar! 🚀**

