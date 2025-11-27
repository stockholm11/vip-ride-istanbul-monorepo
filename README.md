# VIP Ride Istanbul - Kurulum Rehberi

Bu proje, VIP araç kiralama ve tur hizmetleri için geliştirilmiş bir full-stack uygulamadır.

## 📋 Gereksinimler

- **Node.js** (v18 veya üzeri)
- **pnpm** (paket yöneticisi)
- **MySQL** (veritabanı)
- **Redis** (opsiyonel, cache için)

## 🚀 Kurulum Adımları

### 1. Bağımlılıkları Yükleyin

```bash
# Proje kök dizininde
pnpm install
```

### 2. Veritabanını Hazırlayın

MySQL'de yeni bir veritabanı oluşturun:

```sql
CREATE DATABASE vip_ride CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Environment Dosyalarını Oluşturun

#### Backend (API) Environment Dosyası

`packages/infrastructure/.env` dosyasını oluşturun ve aşağıdaki değişkenleri doldurun:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=vip_ride

# Iyzico Payment Gateway Configuration
IYZI_API_KEY=your_iyzi_api_key
IYZI_SECRET_KEY=your_iyzi_secret_key
IYZI_BASE_URL=https://api.iyzipay.com

# Frontend URL
FRONTEND_BASE_URL=http://localhost:5173

# Admin Authentication
ADMIN_EMAIL=admin@vipride.com
ADMIN_PASSWORD=your_admin_password
JWT_SECRET=your_jwt_secret_key_change_this

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Redis Configuration (optional, defaults to localhost:6379)
REDIS_URL=redis://localhost:6379

# Server Port (optional, defaults to 3000)
PORT=3000

# Node Environment
NODE_ENV=development
```

#### Frontend (Web) Environment Dosyası

`packages/web/.env` dosyasını oluşturun:

```env
# API Configuration
VITE_API_URL=http://localhost:3000

# Google Maps API Key (for Places Autocomplete)
VITE_GOOGLE_PLACES_API_KEY=your_google_maps_api_key_here
```

### 4. Veritabanı Şemasını Oluşturun

Veritabanı tablolarını oluşturmak için:

```bash
# MySQL'e bağlanın ve şemayı oluşturun
mysql -u root -p vip_ride < packages/infrastructure/migrations/000_initial_schema.sql

# Eğer vehicles tablosunda 'type' kolonu varsa, migration'ı çalıştırın
mysql -u root -p vip_ride < packages/infrastructure/migrations/001_add_vehicle_types_column.sql
```

**Not:** İlk kurulumda `000_initial_schema.sql` dosyasını çalıştırmanız yeterlidir. Eğer mevcut bir veritabanınız varsa ve `type` kolonunu `types` JSON kolonuna dönüştürmek istiyorsanız `001_add_vehicle_types_column.sql` migration'ını çalıştırın.

### 5. Projeyi Build Edin

```bash
# Tüm paketleri build edin
pnpm build
```

### 6. Projeyi Çalıştırın

#### Development Modu

**Terminal 1 - Backend (API):**
```bash
pnpm dev:api
```
API `http://localhost:3000` adresinde çalışacak.

**Terminal 2 - Frontend (Web):**
```bash
pnpm dev:web
```
Web uygulaması `http://localhost:5173` adresinde çalışacak.

#### Production Modu

```bash
# Önce build edin
pnpm build

# Backend'i başlatın
cd packages/api
pnpm start

# Frontend'i serve edin (örneğin nginx veya başka bir web server ile)
```

## 📁 Proje Yapısı

```
vip-ride-istanbul/
├── packages/
│   ├── api/              # Express.js API sunucusu
│   ├── web/              # React + Vite frontend
│   ├── application/      # Use case'ler ve business logic
│   ├── domain/           # Domain entities ve contracts
│   └── infrastructure/   # Database, external services
├── package.json          # Root package.json
└── pnpm-workspace.yaml   # pnpm workspace config
```

## 🔧 Kullanışlı Komutlar

```bash
# Tüm paketleri build et
pnpm build

# Lint kontrolü
pnpm lint

# Test çalıştır
pnpm test

# Sadece web'i çalıştır
pnpm dev:web

# Sadece API'yi çalıştır
pnpm dev:api
```

## 🌐 Erişim

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Admin Panel:** http://localhost:5173/{lang}/admin (ör: /tr/admin)

## 📝 Notlar

- Admin girişi için `ADMIN_EMAIL` ve `ADMIN_PASSWORD` değerlerini `.env` dosyasında belirtmeniz gerekir
- Google Maps API key'i hem backend hem frontend için gereklidir
- Email gönderimi için SMTP ayarlarını yapılandırmanız gerekir
- Iyzico ödeme entegrasyonu için API key'lerini almanız gerekir

## 🐛 Sorun Giderme

### Port zaten kullanılıyor hatası
- API portunu değiştirmek için `packages/infrastructure/.env` dosyasında `PORT` değişkenini değiştirin
- Web portunu değiştirmek için `packages/web/vite.config.ts` dosyasını düzenleyin

### Veritabanı bağlantı hatası
- MySQL servisinin çalıştığından emin olun
- `.env` dosyasındaki veritabanı bilgilerini kontrol edin
- Veritabanının oluşturulduğundan emin olun

### Redis bağlantı hatası
- Redis opsiyoneldir, çalışmazsa cache özellikleri devre dışı kalır
- Redis kullanmak istiyorsanız Redis servisini başlatın

## 📚 Ek Kaynaklar

- [pnpm Documentation](https://pnpm.io/)
- [Vite Documentation](https://vitejs.dev/)
- [Express.js Documentation](https://expressjs.com/)

