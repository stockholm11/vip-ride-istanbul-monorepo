# 🚀 Production Deployment - Başlangıç Rehberi

Bu klasörde production deployment için tüm rehberler bulunmaktadır.

---

## 📚 Dosyalar ve Kullanımı

### 1. `DEPLOYMENT_GUIDE.md` ⭐ ANA REHBER
**Ne zaman kullanılır:** Tüm deployment sürecini anlamak için
**İçerik:** 
- Tüm adımların detaylı açıklaması
- Her platform için kurulum
- Sorun giderme
- Checklist

**Başlangıç noktası:** Bu dosyayı önce okuyun!

---

### 2. `DEPLOYMENT_STEP_BY_STEP.md` ✅ ADIM ADIM CHECKLIST
**Ne zaman kullanılır:** Deployment yaparken adım adım takip etmek için
**İçerik:**
- Her adım için checkbox'lar
- Yapılacaklar listesi
- Not alma alanları
**Kullanım:** Her adımı tamamladıkça ✅ işaretleyin

**Öneri:** Bu dosyayı açık tutun ve deployment sırasında takip edin!

---

### 3. `RENDER_SPECIFIC_SETUP.md` 🔧 RENDER ÖZEL AYARLAR
**Ne zaman kullanılır:** Backend'i Render'a deploy ederken
**İçerik:**
- Render build ayarları
- Environment variables
- Render'a özel sorunlar ve çözümleri

**Kullanım:** Adım 2 (Backend) sırasında referans olarak kullanın

---

### 4. `HOSTINGER_SPECIFIC_SETUP.md` 🌐 HOSTINGER ÖZEL AYARLAR
**Ne zaman kullanılır:** Frontend'i Hostinger'a deploy ederken
**İçerik:**
- FTP ayarları
- .htaccess yapılandırması
- Database ayarları
- Hostinger'a özel sorunlar

**Kullanım:** Adım 1 (Database) ve Adım 4 (Frontend) sırasında referans olarak kullanın

---

## 🎯 Hızlı Başlangıç

### İlk Kez Deploy Ediyorsanız:

1. **`DEPLOYMENT_GUIDE.md`** dosyasını okuyun (genel bakış için)
2. **`DEPLOYMENT_STEP_BY_STEP.md`** dosyasını açın
3. Adım adım ilerleyin, her adımı tamamladıkça ✅ işaretleyin
4. Sorun yaşarsanız ilgili platform dosyasına bakın:
   - Render sorunları → `RENDER_SPECIFIC_SETUP.md`
   - Hostinger sorunları → `HOSTINGER_SPECIFIC_SETUP.md`

### Tekrar Deploy Ediyorsanız:

- Sadece `DEPLOYMENT_STEP_BY_STEP.md` dosyasını kullanın
- Gerekirse platform özel dosyalarına bakın

---

## 📋 Deployment Sırası

1. **Database (Hostinger)** → `HOSTINGER_SPECIFIC_SETUP.md`
2. **Backend (Render)** → `RENDER_SPECIFIC_SETUP.md`
3. **Redis (Upstash)** → `DEPLOYMENT_GUIDE.md` (Adım 4)
4. **Frontend (Hostinger)** → `HOSTINGER_SPECIFIC_SETUP.md`
5. **Test** → `DEPLOYMENT_STEP_BY_STEP.md` (Adım 5)

---

## ⚡ Hızlı Referans

### Environment Variables Listesi

**Backend (Render):**
- Database: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
- Redis: `REDIS_URL`
- Admin: `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `JWT_SECRET`
- Frontend: `FRONTEND_BASE_URL`
- Email: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`
- Iyzico: `IYZI_API_KEY`, `IYZI_SECRET_KEY`, `IYZI_BASE_URL`
- Google: `GOOGLE_MAPS_API_KEY`
- Node: `NODE_ENV=production`

**Frontend (Build-time):**
- `VITE_API_URL` (Render backend URL'i)
- `VITE_GOOGLE_PLACES_API_KEY`

---

## 🆘 Acil Durum

### Deployment Sırasında Sorun mu Yaşıyorsunuz?

1. **Hangi adımdasınız?** → İlgili dosyaya bakın
2. **Render sorunu mu?** → `RENDER_SPECIFIC_SETUP.md` > "Yaygın Sorunlar"
3. **Hostinger sorunu mu?** → `HOSTINGER_SPECIFIC_SETUP.md` > "Yaygın Sorunlar"
4. **Genel sorun mu?** → `DEPLOYMENT_GUIDE.md` > "Sorun Giderme"

---

## ✅ Başarı Kriterleri

Deployment başarılı oldu mu kontrol edin:

- [ ] Backend health check çalışıyor: `https://your-api.onrender.com/api/health`
- [ ] Frontend yükleniyor: `https://yourdomain.com`
- [ ] Admin login çalışıyor
- [ ] API istekleri çalışıyor (CORS hatası yok)
- [ ] Database bağlantısı çalışıyor
- [ ] SSL aktif

---

## 📞 Destek

- **Render:** [render.com/docs](https://render.com/docs)
- **Hostinger:** hPanel > Support
- **Upstash:** [upstash.com/docs](https://upstash.com/docs)

---

**Başarılar! 🚀**

Herhangi bir sorunuz olursa, ilgili dosyadaki "Sorun Giderme" bölümüne bakın.

