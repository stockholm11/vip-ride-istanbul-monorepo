# FRONTEND_BASE_URL Production Ayarlama Rehberi

## 📋 Ne İşe Yarar?

`FRONTEND_BASE_URL` CORS (Cross-Origin Resource Sharing) ayarlarında kullanılır. API'nizin hangi domain'lerden istek kabul edeceğini belirler.

**Önemli:** Bu değer yanlış ayarlanırsa, frontend'den API'ye istekler CORS hatası verir!

---

## 🔧 Production'da Ayarlama

### 1. `.env` Dosyasını Güncelleyin

`packages/infrastructure/.env` dosyasını açın ve şunu ekleyin/güncelleyin:

```env
# Development (localhost)
# FRONTEND_BASE_URL=http://localhost:5173

# Production (gerçek domain'iniz)
FRONTEND_BASE_URL=https://yourdomain.com
```

**Örnekler:**

```env
# Tek domain
FRONTEND_BASE_URL=https://viprideistanbul.com

# www ile
FRONTEND_BASE_URL=https://www.viprideistanbul.com

# Subdomain
FRONTEND_BASE_URL=https://app.viprideistanbul.com
```

### 2. Önemli Noktalar

✅ **HTTPS kullanın:** Production'da mutlaka `https://` ile başlamalı
✅ **Protokol ekleyin:** `https://` veya `http://` mutlaka olmalı
✅ **Trailing slash yok:** Sonunda `/` olmamalı
✅ **Port numarası:** Standart portlar (80, 443) için port eklemeyin

**Doğru:**
```env
FRONTEND_BASE_URL=https://viprideistanbul.com
FRONTEND_BASE_URL=https://www.viprideistanbul.com
```

**Yanlış:**
```env
FRONTEND_BASE_URL=viprideistanbul.com          # ❌ Protokol yok
FRONTEND_BASE_URL=https://viprideistanbul.com/ # ❌ Trailing slash var
FRONTEND_BASE_URL=https://viprideistanbul.com:443 # ❌ Port gerekli değil
```

---

## 🌐 Birden Fazla Domain Desteği

Eğer hem `www` hem de `non-www` domain'leriniz varsa, kodda küçük bir değişiklik yapabiliriz.

**Şu anki kod:** Sadece tek domain destekliyor
**Önerilen:** Production'da genellikle tek domain yeterli (www veya non-www seçin)

Eğer gerçekten birden fazla domain gerekiyorsa, `packages/api/src/server.ts` dosyasını güncelleyebiliriz.

---

## 🔍 Test Etme

### 1. Development'ta Test

```env
FRONTEND_BASE_URL=http://localhost:5173
```

API'yi başlatın ve frontend'den istek gönderin. CORS hatası olmamalı.

### 2. Production'da Test

1. `.env` dosyasını production domain'inizle güncelleyin
2. API'yi yeniden başlatın
3. Frontend'den API'ye istek gönderin
4. Browser console'da CORS hatası olmamalı

**CORS hatası görürseniz:**
```
Access to fetch at 'https://api.yourdomain.com/...' from origin 'https://yourdomain.com' 
has been blocked by CORS policy
```

Bu durumda:
- `FRONTEND_BASE_URL`'in doğru olduğundan emin olun
- API'yi yeniden başlatın
- Browser cache'ini temizleyin

---

## 📝 Environment Variables Özeti

### Development
```env
FRONTEND_BASE_URL=http://localhost:5173
```

### Production
```env
FRONTEND_BASE_URL=https://yourdomain.com
```

### Staging (Opsiyonel)
```env
FRONTEND_BASE_URL=https://staging.yourdomain.com
```

---

## 🚀 Deployment Checklist

Production'a deploy etmeden önce:

- [ ] `FRONTEND_BASE_URL` production domain'inizle güncellendi
- [ ] HTTPS kullanılıyor (`https://`)
- [ ] Trailing slash yok
- [ ] Port numarası yok (standart portlar için)
- [ ] API'yi yeniden başlattınız
- [ ] Frontend'den test ettiniz (CORS hatası yok)

---

## 🆘 Sorun Giderme

### CORS hatası alıyorum

1. **FRONTEND_BASE_URL kontrolü:**
   ```bash
   # API loglarında görebilirsiniz
   # veya .env dosyasını kontrol edin
   ```

2. **API'yi yeniden başlatın:**
   ```bash
   # Environment variable değişiklikleri için gerekli
   pnpm dev:api
   # veya production'da
   pm2 restart api
   ```

3. **Browser cache temizleyin:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) veya `Cmd+Shift+R` (Mac)

4. **Domain eşleşmesi:**
   - Frontend URL: `https://yourdomain.com`
   - FRONTEND_BASE_URL: `https://yourdomain.com`
   - İkisi de tam olarak eşleşmeli!

### www vs non-www

Eğer hem `www.yourdomain.com` hem de `yourdomain.com` kullanıyorsanız:

**Çözüm 1:** Sadece birini kullanın (önerilen)
```env
FRONTEND_BASE_URL=https://www.yourdomain.com
```

**Çözüm 2:** Kodda birden fazla origin desteği ekleyin (gerekirse)

---

## 💡 İpuçları

1. **Production'da mutlaka HTTPS kullanın**
2. **Domain'i bir kez doğru ayarlayın, sonra unutun**
3. **Staging ve production için farklı .env dosyaları kullanın**
4. **Environment variable'ları asla git'e commit etmeyin**

---

## 📋 Örnek .env Dosyası

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=vip_ride

# Frontend URL
FRONTEND_BASE_URL=https://viprideistanbul.com

# Admin
ADMIN_EMAIL=admin@viprideistanbul.com
ADMIN_PASSWORD_HASH=$2b$12$...
JWT_SECRET=your-64-character-secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Iyzico
IYZI_API_KEY=your_api_key
IYZI_SECRET_KEY=your_secret_key
IYZI_BASE_URL=https://api.iyzipay.com
```

---

**Sorularınız için:** API loglarını kontrol edin veya test scriptini çalıştırın.

