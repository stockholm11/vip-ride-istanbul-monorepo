# Güvenlik Denetim Raporu - VIP Ride Istanbul

**Tarih**: 2024  
**Kapsam**: Tüm proje (Backend API, Frontend Web, Infrastructure)

---

## 🔴 KRİTİK GÜVENLİK AÇIKLARI

### 1. **CORS Yapılandırması - Tüm Origin'lere Açık**
**Dosya**: `packages/api/src/server.ts:202`
```typescript
app.use(cors()); // ⚠️ Tüm origin'lere açık!
```

**Risk**: Herhangi bir web sitesi API'nize istek gönderebilir (CSRF, veri çalma).

**Önerilen Çözüm**:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_BASE_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

### 2. **Rate Limiting Yok - Brute Force Saldırılarına Açık**
**Risk**: Login endpoint'i ve diğer API endpoint'leri brute force saldırılarına karşı korunmuyor.

**Önerilen Çözüm**:
```bash
pnpm add express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // 5 deneme
  message: 'Too many login attempts, please try again later.'
});

router.post("/admin/auth/login", loginLimiter, deps.adminAuthController.login);
```

---

### 3. **Zayıf Şifre Hashleme - SHA-256 Kullanımı**
**Dosya**: `packages/application/src/services/AdminAuthService.ts:23-25`
```typescript
static hashPassword(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
```

**Risk**: SHA-256 hash'leri hızlı kırılabilir. Rainbow table saldırılarına açık.

**Önerilen Çözüm**: bcrypt veya argon2 kullanın:
```bash
pnpm add bcrypt
pnpm add -D @types/bcrypt
```

```typescript
import bcrypt from 'bcrypt';

static async hashPassword(value: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(value, saltRounds);
}

async validateCredentials(email: string, password: string): Promise<AdminUserDTO | null> {
  // ...
  const isValid = await bcrypt.compare(password, this.adminUser.passwordHash);
  // ...
}
```

---

### 4. **File Upload Endpoint'i Authentication Kontrolü Yok**
**Dosya**: `packages/api/src/routes/uploadRoutes.ts:31`
```typescript
router.post("/", upload.single("file"), (req: Request, res: Response) => {
  // ⚠️ Admin auth middleware yok!
```

**Risk**: Herkes dosya yükleyebilir, sunucu kaynaklarını tüketebilir.

**Önerilen Çözüm**:
```typescript
import { adminAuthMiddleware } from '../middleware/adminAuthMiddleware';

router.post("/", adminAuthMiddleware, upload.single("file"), (req: Request, res: Response) => {
  // ...
});
```

**Ek Güvenlik Önlemleri**:
- Dosya boyutu limiti ekleyin (örn: 5MB)
- Dosya içeriği kontrolü (magic bytes kontrolü)
- Tehlikeli dosya uzantılarını engelleyin

```typescript
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, and WebP images allowed"));
    }
    cb(null, true);
  },
});
```

---

## 🟠 YÜKSEK ÖNCELİKLİ GÜVENLİK AÇIKLARI

### 5. **XSS Riski - dangerouslySetInnerHTML Kullanımı**
**Dosya**: `packages/web/src/pages/PaymentPage.tsx:123`
```typescript
dangerouslySetInnerHTML={{ __html: formHtml }}
```

**Risk**: Iyzico formu için kullanılıyor ancak sanitize edilmiyor.

**Not**: Iyzico güvenilir bir kaynak olduğu için risk düşük, ancak yine de sanitize edilmeli.

**Önerilen Çözüm**:
```bash
pnpm add dompurify
pnpm add -D @types/dompurify
```

```typescript
import DOMPurify from 'dompurify';

dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formHtml) }}
```

---

### 6. **Email Injection Riski - HTML Template'lerde Sanitization Yok**
**Dosya**: `packages/application/src/use-cases/notification/SendContactEmail.ts:17-29`

**Risk**: Kullanıcı girdileri (`name`, `email`, `phone`, `message`) doğrudan HTML'e ekleniyor.

**Önerilen Çözüm**: HTML escape yapın:
```typescript
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

const userEmailHtml = `
  <p>Sayın ${escapeHtml(name)},</p>
  <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
`;
```

---

### 7. **CSRF Protection Yok**
**Risk**: Cross-Site Request Forgery saldırılarına açık.

**Önerilen Çözüm**:
```bash
pnpm add csurf
pnpm add cookie-parser
```

```typescript
import csrf from 'csurf';
import cookieParser from 'cookie-parser';

app.use(cookieParser());
const csrfProtection = csrf({ cookie: true });

// Public API'ler için CSRF koruması ekleyin
app.post('/api/reservations', csrfProtection, ...);
```

---

### 8. **HTTP Security Headers Yok (Helmet)**
**Risk**: XSS, clickjacking, MIME type sniffing gibi saldırılara açık.

**Önerilen Çözüm**:
```bash
pnpm add helmet
```

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.iyzipay.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

---

## 🟡 ORTA ÖNCELİKLİ GÜVENLİK AÇIKLARI

### 9. **Environment Variables .gitignore'da Yok**
**Dosya**: `.gitignore`

**Risk**: Hassas bilgiler (şifreler, API key'ler) git'e commit edilebilir.

**Önerilen Çözüm**: `.gitignore` dosyasına ekleyin:
```
# Environment variables
.env
.env.local
.env.*.local
packages/infrastructure/.env
packages/web/.env
```

---

### 10. **JWT Secret Zayıf Kontrolü**
**Dosya**: `packages/infrastructure/src/config/env.ts:19`
```typescript
jwtSecret: process.env.JWT_SECRET ?? "change-me", // ⚠️ Default değer zayıf
```

**Risk**: Eğer JWT_SECRET set edilmezse, default zayıf secret kullanılır.

**Önerilen Çözüm**:
```typescript
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret === "change-me" || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be set and at least 32 characters long");
}
```

---

### 11. **Error Handling - Information Disclosure**
**Dosya**: `packages/api/src/middleware/errorHandler.ts:3-6`

**Not**: Şu an genel hata mesajı veriyor, bu iyi. Ancak development modunda stack trace gösterilmemeli production'da.

**Mevcut Durum**: ✅ İyi (genel hata mesajı)

---

### 12. **Input Validation Yetersiz**
**Dosya**: `packages/api/src/controllers/ReservationController.ts`

**Not**: Bazı validation var ama tüm endpoint'lerde tutarlı değil.

**Önerilen Çözüm**: Zod veya Joi gibi bir validation library kullanın:
```bash
pnpm add zod
```

```typescript
import { z } from 'zod';

const createReservationSchema = z.object({
  userEmail: z.string().email(),
  userFullName: z.string().min(1).max(255),
  passengers: z.number().int().positive(),
  totalPrice: z.number().nonnegative(),
  // ...
});
```

---

## ✅ İYİ GÜVENLİK UYGULAMALARI

1. **SQL Injection Koruması**: ✅ Prepared statements kullanılıyor
2. **Authentication Middleware**: ✅ Admin endpoint'leri korunuyor
3. **JWT Token Kullanımı**: ✅ Token-based authentication
4. **HTTPS**: ⚠️ Production'da HTTPS kullanılmalı
5. **Error Handling**: ✅ Genel hata mesajları (information disclosure yok)

---

## 📋 ÖNCELİKLİ DÜZELTME LİSTESİ

### Hemen Düzeltilmeli (Kritik):
1. ✅ CORS yapılandırmasını sınırlandırın
2. ✅ Rate limiting ekleyin (özellikle login endpoint'i)
3. ✅ Şifre hashleme'yi bcrypt'e geçirin
4. ✅ File upload endpoint'ine authentication ekleyin

### Kısa Vadede (Yüksek Öncelik):
5. ✅ Email HTML injection koruması ekleyin
6. ✅ Helmet middleware ekleyin
7. ✅ CSRF protection ekleyin
8. ✅ File upload güvenlik kontrollerini güçlendirin

### Orta Vadede (Orta Öncelik):
9. ✅ .gitignore'a .env dosyalarını ekleyin
10. ✅ JWT secret validation ekleyin
11. ✅ Input validation'ı standardize edin (Zod/Joi)
12. ✅ XSS sanitization ekleyin (dangerouslySetInnerHTML için)

---

## 🔒 EK GÜVENLİK ÖNERİLERİ

1. **Logging & Monitoring**: Güvenlik olaylarını loglayın (başarısız login denemeleri, şüpheli aktiviteler)
2. **Session Management**: JWT token expiration'ı kontrol edin (şu an 8 saat)
3. **API Versioning**: Gelecekte API versioning ekleyin
4. **Security Headers**: Content Security Policy (CSP) ekleyin
5. **Dependency Scanning**: `pnpm audit` ile düzenli dependency taraması yapın
6. **HTTPS**: Production'da mutlaka HTTPS kullanın
7. **Database Connection**: Connection pooling kullanılıyor ✅
8. **Environment Variables**: Production'da environment variables'ları güvenli bir şekilde yönetin (AWS Secrets Manager, etc.)

---

**Rapor Hazırlayan**: AI Security Audit  
**Son Güncelleme**: 2024

