# Render Deployment - Özel Ayarlar

Bu dosya Render platformuna özel detayları içerir.

---

## 📦 Package.json Kontrolü

`packages/api/package.json` dosyasında şu script'ler olmalı:

```json
{
  "scripts": {
    "build": "tsc --project tsconfig.json",
    "start": "node dist/server.js"
  }
}
```

Eğer yoksa ekleyin.

---

## 🔧 Build Ayarları (Render Dashboard)

### Name
```
vip-ride-api
```

### Environment
```
Node
```

### Region
Size en yakın region'ı seçin (örn: `Frankfurt`, `Oregon`)

### Branch
```
main
```
(veya `master` - repository'nizdeki default branch)

### Root Directory
```
(boş bırakın)
```

### Build Command
```bash
cd packages/api && pnpm install && pnpm build
```

**Önemli:** `pnpm` kullanıyoruz. Eğer Render'da `pnpm` yoksa, önce install edin veya `npm` kullanın.

### Start Command
```bash
cd packages/api && node dist/server.js
```

---

## 📝 Environment Variables (Render)

Render dashboard'da **Environment** sekmesine gidin ve şunları ekleyin:

### Zorunlu Variables

```env
# Database
DB_HOST=mysql.hostinger.com
DB_USER=u123456789_username
DB_PASSWORD=your_password
DB_NAME=u123456789_dbname
DB_PORT=3306

# Admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD_HASH=$2b$12$...
JWT_SECRET=your-64-character-secret

# Frontend
FRONTEND_BASE_URL=https://yourdomain.com

# Node
NODE_ENV=production
```

### Opsiyonel Variables

```env
# Redis (Upstash)
REDIS_URL=redis://default:password@host:port

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
```

---

## ⚙️ Render Özel Ayarlar

### Auto-Deploy

Render otomatik olarak GitHub push'larınızda deploy eder. İsterseniz kapatabilirsiniz:

- **Settings** > **Auto-Deploy** > **No**

### Health Check Path

Render otomatik health check yapar. Endpoint'iniz:
```
/api/health
```

### Port

Render otomatik olarak `PORT` environment variable'ını set eder. Kodunuzda:

```typescript
const port = process.env.PORT || 3000;
```

Bu şekilde kullanıyorsanız, Render'ın verdiği port'u otomatik kullanacaktır.

---

## 🐛 Render'da Yaygın Sorunlar

### 1. Build Hatası: "pnpm: command not found"

**Çözüm:** Build command'i şu şekilde değiştirin:

```bash
npm install -g pnpm && cd packages/api && pnpm install && pnpm build
```

Veya `package.json`'da `engines` ekleyin:

```json
{
  "engines": {
    "node": "18.x",
    "pnpm": "8.x"
  }
}
```

### 2. "Cannot find module" Hatası

**Çözüm:** 
- Root directory'yi kontrol edin (boş olmalı)
- Build command'de `cd packages/api` olduğundan emin olun
- `package.json` dosyasının doğru yerde olduğunu kontrol edin

### 3. Database Connection Timeout

**Çözüm:**
- Hostinger'de remote connection izni gerekebilir
- `DB_HOST` değerini kontrol edin (localhost yerine tam hostname)
- Hostinger support'a başvurun

### 4. Port Hatası

**Çözüm:**
- `PORT` environment variable'ını eklemeyin (Render otomatik set eder)
- Kodunuzda `process.env.PORT || 3000` kullanın

### 5. Cold Start (İlk Request Yavaş)

**Çözüm:**
- Free plan'da normal (15 dakika kullanılmazsa sleep moduna geçer)
- Paid plan'da bu sorun yok
- Health check endpoint'i düzenli çağırarak uygulamayı aktif tutabilirsiniz

---

## 📊 Render Logs

Log'ları görmek için:

1. Render dashboard'da web service'inize gidin
2. **Logs** sekmesine tıklayın
3. Real-time log'ları görebilirsiniz

**Log filtreleme:**
- Build log'ları: Build sırasında
- Runtime log'ları: Uygulama çalışırken

---

## 🔄 Deploy Süreci

### İlk Deploy

1. **Create Web Service** tıklayın
2. Build başlar (5-10 dakika)
3. Build tamamlandığında start command çalışır
4. URL aktif olur: `https://your-service.onrender.com`

### Sonraki Deploys

- GitHub'a push yaptığınızda otomatik deploy olur
- Veya **Manual Deploy** butonuna tıklayabilirsiniz

### Rollback

- **Deploys** sekmesinden önceki versiyona dönebilirsiniz

---

## 💰 Render Planları

### Free Plan

- ✅ Ücretsiz
- ⚠️ 15 dakika kullanılmazsa sleep moduna geçer
- ⚠️ İlk request yavaş (cold start)
- ✅ SSL dahil
- ✅ Custom domain desteği

### Starter Plan ($7/ay)

- ✅ Sleep modu yok
- ✅ Daha hızlı
- ✅ Daha fazla kaynak

**Öneri:** Production için Starter plan veya üzeri kullanın.

---

## 🔐 Security

### Environment Variables

- ✅ Render environment variable'ları şifrelenmiş saklar
- ✅ Log'larda görünmezler
- ✅ Sadece siz görebilirsiniz

### SSL

- ✅ Render otomatik SSL sağlar
- ✅ Custom domain için de SSL otomatik

---

## 📞 Render Support

Sorun yaşarsanız:
1. Log'ları kontrol edin
2. [Render Docs](https://render.com/docs) okuyun
3. [Render Support](https://render.com/support) ile iletişime geçin

---

**Not:** Bu dosya Render'a özeldir. Genel deployment rehberi için `DEPLOYMENT_GUIDE.md` dosyasına bakın.

