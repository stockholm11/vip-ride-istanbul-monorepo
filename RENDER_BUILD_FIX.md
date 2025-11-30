# Render Build Fix - Detaylı Analiz ve Çözüm

## 🔍 HATA ANALİZİ

**Hata Mesajı:**
```
Error: Cannot find module 'packages/api/dist/server.js'
```

## ✅ KONTROL SONUÇLARI

### 1. packages/api/package.json
- ✅ **build script:** `tsc -p tsconfig.json && tscpaths -p tsconfig.json -s src -o dist` - DOĞRU
- ✅ **start script:** `node dist/server.js` - DOĞRU

### 2. pnpm-workspace.yaml
- ✅ **İçerik:** `packages: - 'packages/*'` - DOĞRU

### 3. Root package.json
- ✅ **build script:** `pnpm -r build` - DOĞRU

### 4. Build Çıktısı (Local)
- ✅ **dist/server.js:** MEVCUT (local'de)
- ⚠️ **Render'da:** Build log kontrol edilmeli

### 5. tsconfig.json
- ✅ **outDir:** `"dist"` - DOĞRU
- ✅ **baseUrl:** `"."` - DOĞRU
- ✅ **rootDir:** YOK (TypeScript otomatik belirler) - NORMAL

## 🎯 SORUNUN KÖK NEDENİ

**Olası Nedenler:**
1. **Build başarısız oldu** - Render'da TypeScript veya tscpaths hatası
2. **Workspace bağımlılık sırası** - domain → application → infrastructure → api sırası önemli
3. **NODE_PATH eksik** - Start command'da workspace bağımlılıkları bulunamıyor

## 🔧 ÇÖZÜM ADIMLARI

### Adım 1: Build Command Güncelle (Önerilen)

**Render Dashboard → Build Command:**
```bash
pnpm install && pnpm --filter @vip-ride/domain build && pnpm --filter @vip-ride/application build && pnpm --filter @vip-ride/infrastructure build && pnpm --filter @vip-ride/api build
```

**Veya daha basit (eğer bağımlılık sırası otomatik çözülüyorsa):**
```bash
pnpm install && pnpm -r build
```

### Adım 2: Start Command Güncelle

**Render Dashboard → Start Command:**
```bash
cd packages/api && NODE_PATH=../../node_modules:../../packages/infrastructure/dist:../../packages/application/dist:../../packages/domain/dist node dist/server.js
```

### Adım 3: Build Log Kontrolü

1. Render Dashboard → **Logs** sekmesine gidin
2. **Build Log'larını** kontrol edin
3. Şu hataları arayın:
   - TypeScript compilation errors
   - tscpaths errors
   - Module not found errors
   - Build timeout

### Adım 4: Root Directory Kontrolü

**Render Dashboard → Settings:**
- **Root Directory:** (Boş bırakın - proje root'u)

## 📋 ALTERNATİF ÇÖZÜMLER

### Çözüm A: Tek Komut Build (Basit)
```bash
pnpm install && pnpm -r build
```

### Çözüm B: Sıralı Build (Güvenli)
```bash
pnpm install && pnpm --filter @vip-ride/domain build && pnpm --filter @vip-ride/application build && pnpm --filter @vip-ride/infrastructure build && pnpm --filter @vip-ride/api build
```

### Çözüm C: Manuel Build (En Güvenli)
```bash
pnpm install && cd packages/domain && pnpm build && cd ../application && pnpm build && cd ../infrastructure && pnpm build && cd ../api && pnpm build
```

## 🚨 ÖNEMLİ NOTLAR

1. **Build Log'larını mutlaka kontrol edin** - Hatanın gerçek nedeni orada
2. **Workspace bağımlılık sırası önemli** - domain → application → infrastructure → api
3. **NODE_PATH gerekli** - Start command'da workspace bağımlılıkları için
4. **Root Directory boş olmalı** - Render proje root'undan başlamalı

## 🔍 DEBUG ADIMLARI

1. Render'da **Manual Deploy** yapın
2. **Build Log'larını** tam olarak okuyun
3. **Runtime Log'larını** kontrol edin
4. Hata mesajını buraya ekleyin

## ✅ BAŞARILI BUILD KONTROLÜ

Build başarılı olduğunda şunlar görünmeli:
- ✅ `packages/api/dist/server.js` dosyası oluşmalı
- ✅ `packages/api/dist/server.d.ts` dosyası oluşmalı
- ✅ Tüm bağımlı paketler build edilmiş olmalı

