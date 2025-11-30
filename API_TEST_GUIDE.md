# API Test Rehberi

## 🚀 Hızlı Test Yöntemleri

### 1. Tarayıcıdan Test (GET istekleri)

Aşağıdaki URL'leri tarayıcınızda açarak test edebilirsiniz:

#### ✅ Health Check (Çalışıyor)
```
https://vip-ride-api.onrender.com/api/health
```
**Beklenen:** `{"status":"ok"}`

#### 📋 Public Endpoints
```
https://vip-ride-api.onrender.com/api/public/vehicles
https://vip-ride-api.onrender.com/api/public/tours
https://vip-ride-api.onrender.com/api/public/tour-categories
https://vip-ride-api.onrender.com/api/public/add-ons
https://vip-ride-api.onrender.com/api/public/featured-transfers
```

### 2. PowerShell ile Test (Windows)

```powershell
# Health Check
Invoke-WebRequest -Uri "https://vip-ride-api.onrender.com/api/health" | Select-Object -ExpandProperty Content

# Vehicles
Invoke-WebRequest -Uri "https://vip-ride-api.onrender.com/api/public/vehicles" | Select-Object -ExpandProperty Content

# Tours
Invoke-WebRequest -Uri "https://vip-ride-api.onrender.com/api/public/tours" | Select-Object -ExpandProperty Content
```

### 3. curl ile Test (Terminal)

```bash
# Health Check
curl https://vip-ride-api.onrender.com/api/health

# Vehicles
curl https://vip-ride-api.onrender.com/api/public/vehicles

# Tours
curl https://vip-ride-api.onrender.com/api/public/tours

# Contact Form (POST)
curl -X POST https://vip-ride-api.onrender.com/api/public/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","phone":"1234567890","message":"Test message"}'
```

### 4. Node.js Script ile Test

```bash
node scripts/test-api-production.js
```

## 🔍 502 Hatası Çözümü

502 Bad Gateway hatası alıyorsanız, muhtemelen:

1. **Database bağlantısı yok** - Render'da environment variables kontrol edin
2. **API başlatılamadı** - Render logs'u kontrol edin
3. **Environment variables eksik** - `.env` dosyasındaki değişkenler Render'a eklenmeli

### Render'da Kontrol Edilmesi Gerekenler:

1. **Environment Variables:**
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `DB_PORT`
   - `ADMIN_PASSWORD_HASH` (veya `ADMIN_PASSWORD`)
   - `JWT_SECRET`
   - `IYZI_API_KEY`
   - `IYZI_SECRET_KEY`
   - `IYZI_BASE_URL`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `ADMIN_EMAIL`
   - `FRONTEND_BASE_URL`

2. **Render Logs:**
   - Render dashboard > Your Service > Logs
   - Hata mesajlarını kontrol edin

3. **Database Bağlantısı:**
   - Hostinger'da database'in çalıştığından emin olun
   - Remote connection'ın açık olduğundan emin olun

## ✅ Başarılı Test Örneği

Health check çalışıyorsa, API çalışıyor demektir. Diğer endpoint'ler için database bağlantısı gerekir.

```json
{
  "status": "ok"
}
```

## 📝 Test Senaryoları

### Senaryo 1: Health Check ✅
- **Endpoint:** `GET /api/health`
- **Beklenen:** `200 OK` + `{"status":"ok"}`
- **Sonuç:** ✅ Çalışıyor

### Senaryo 2: Public Vehicles
- **Endpoint:** `GET /api/public/vehicles`
- **Beklenen:** `200 OK` + Array of vehicles
- **Not:** Database bağlantısı gerekir

### Senaryo 3: Contact Form
- **Endpoint:** `POST /api/public/contact`
- **Body:** `{name, email, phone, message}`
- **Beklenen:** `200 OK` veya `400 Bad Request` (validation)

### Senaryo 4: Admin Login
- **Endpoint:** `POST /api/admin/auth/login`
- **Body:** `{username, password}`
- **Beklenen:** `200 OK` (token) veya `401 Unauthorized`

