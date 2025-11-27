# Güvenlik Düzeltmeleri Sonrası Yapmanız Gerekenler

## ✅ Otomatik Yapılan Düzeltmeler

Aşağıdaki güvenlik açıkları otomatik olarak düzeltildi:

1. ✅ **CORS yapılandırması** - Sadece frontend URL'ine izin veriliyor
2. ✅ **Rate limiting** - Login endpoint'i ve genel API için eklendi
3. ✅ **Helmet middleware** - HTTP güvenlik başlıkları eklendi
4. ✅ **File upload authentication** - Upload endpoint'i artık admin authentication gerektiriyor
5. ✅ **Email HTML injection koruması** - Kullanıcı girdileri escape ediliyor
6. ✅ **XSS sanitization** - PaymentPage'de DOMPurify kullanılıyor
7. ✅ **.gitignore güncellemesi** - .env dosyaları artık git'e commit edilmeyecek

---

## 🔧 MANUEL YAPMANIZ GEREKENLER

### 1. **Admin Şifresini Bcrypt ile Hash'leyin** ⚠️ ÖNEMLİ

Eski SHA-256 hash'i artık desteklenmiyor. Yeni bcrypt hash'i oluşturmanız gerekiyor:

#### Yöntem 1: Node.js ile (Önerilen)
```bash
node -e "require('bcrypt').hash('YENİ_ADMIN_ŞİFRENİZ', 12).then(h => console.log(h))"
```

Bu komut size bcrypt hash'i verecek. Örnek çıktı:
```
$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5
```

#### Yöntem 2: Online Tool (Güvenli değil, sadece test için)
⚠️ Production'da kullanmayın! Sadece test için: https://bcrypt-generator.com/

#### Environment Variable'ı Güncelleyin

`packages/infrastructure/.env` dosyasında:

```env
# Eski (artık çalışmaz):
# ADMIN_PASSWORD=your_password

# Yeni (bcrypt hash):
ADMIN_PASSWORD_HASH=$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5
```

**Not**: Eski SHA-256 hash'ler hala destekleniyor (migration için), ancak yeni şifreler için bcrypt kullanmanız önerilir.

---

### 2. **JWT_SECRET Kontrolü**

`packages/infrastructure/.env` dosyasında `JWT_SECRET` en az 32 karakter olmalı:

```env
JWT_SECRET=your-very-long-and-random-secret-key-at-least-32-characters-long
```

Eğer "change-me" veya 32 karakterden kısa ise, API başlatıldığında hata verecek.

**Güvenli Secret Oluşturma:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 3. **FRONTEND_BASE_URL Kontrolü**

`packages/infrastructure/.env` dosyasında frontend URL'inizi kontrol edin:

```env
FRONTEND_BASE_URL=http://localhost:5173  # Development
# veya
FRONTEND_BASE_URL=https://yourdomain.com  # Production
```

Bu URL CORS ayarlarında kullanılıyor. Production'da mutlaka doğru domain'i yazın!

---

### 4. **Test Etme**

#### 4.1. API'yi Başlatın
```bash
pnpm dev:api
```

#### 4.2. Login Endpoint'ini Test Edin
- 5'ten fazla başarısız login denemesi yapın → Rate limit mesajı almalısınız
- Doğru şifre ile giriş yapın → Başarılı olmalı

#### 4.3. File Upload'u Test Edin
- Admin olmadan upload yapmayı deneyin → 401 Unauthorized almalısınız
- Admin token ile upload yapın → Başarılı olmalı

#### 4.4. CORS'u Test Edin
- Farklı bir origin'den API'ye istek gönderin → CORS hatası almalısınız
- Frontend'den istek gönderin → Başarılı olmalı

---

### 5. **Production Deployment Checklist**

Production'a deploy etmeden önce:

- [ ] `ADMIN_PASSWORD_HASH` bcrypt hash ile güncellendi
- [ ] `JWT_SECRET` en az 32 karakter, güçlü bir değer
- [ ] `FRONTEND_BASE_URL` production domain'i ile güncellendi
- [ ] `.env` dosyaları git'e commit edilmedi (`.gitignore` kontrol edildi)
- [ ] HTTPS kullanılıyor (production'da zorunlu)
- [ ] Environment variables production sunucuda güvenli bir şekilde saklanıyor

---

### 6. **Ek Güvenlik Önerileri (Opsiyonel)**

#### 6.1. CSRF Protection (İleride eklenebilir)
Şu an CSRF protection yok. Eğer eklemek isterseniz:
```bash
pnpm add csurf
```

#### 6.2. Input Validation (İleride eklenebilir)
Zod veya Joi ile input validation eklenebilir:
```bash
pnpm add zod
```

#### 6.3. Logging & Monitoring
Güvenlik olaylarını loglamak için bir logging servisi ekleyebilirsiniz.

---

## 📝 Özet

**Hemen Yapılması Gerekenler:**
1. ✅ Admin şifresini bcrypt ile hash'leyin ve `ADMIN_PASSWORD_HASH` environment variable'ını güncelleyin
2. ✅ `JWT_SECRET`'ı en az 32 karakter yapın
3. ✅ `FRONTEND_BASE_URL`'i production domain'iniz ile güncelleyin
4. ✅ Test edin

**Production'a Deploy Etmeden Önce:**
- Tüm environment variables'ları kontrol edin
- HTTPS kullandığınızdan emin olun
- `.env` dosyalarının git'e commit edilmediğini doğrulayın

---

## 🆘 Sorun Giderme

### "JWT_SECRET must be set and at least 32 characters long" hatası
→ `JWT_SECRET` environment variable'ını en az 32 karakter yapın

### "ADMIN_PASSWORD_HASH must be set" hatası
→ Bcrypt hash oluşturup `ADMIN_PASSWORD_HASH` environment variable'ını ayarlayın

### Login çalışmıyor
→ Bcrypt hash'in doğru oluşturulduğundan emin olun. Hash `$2b$12$...` ile başlamalı.

### CORS hatası alıyorum
→ `FRONTEND_BASE_URL` environment variable'ının doğru olduğundan emin olun

---

**Sorularınız için**: Güvenlik raporunu (`SECURITY_AUDIT_REPORT.md`) inceleyebilirsiniz.

