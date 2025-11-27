#!/usr/bin/env node

/**
 * ADMIN_PASSWORD'u bcrypt hash'e çevirir ve ADMIN_PASSWORD_HASH olarak ekler
 * 
 * Kullanım:
 *   node scripts/migrate-password.js
 * 
 * Bu script:
 * 1. packages/infrastructure/.env dosyasını okur
 * 2. ADMIN_PASSWORD değerini bulur
 * 3. Bcrypt hash'ini oluşturur
 * 4. ADMIN_PASSWORD_HASH olarak ekler (veya günceller)
 * 5. ADMIN_PASSWORD satırını yorum satırına çevirir
 */

const fs = require('fs');
const path = require('path');

// Workspace'teki bcrypt'i bul
let bcrypt;
try {
  // Önce packages/api'den dene
  bcrypt = require(path.join(__dirname, '../packages/api/node_modules/bcrypt'));
} catch {
  try {
    // Sonra packages/application'dan dene
    bcrypt = require(path.join(__dirname, '../packages/application/node_modules/bcrypt'));
  } catch {
    try {
      // Son olarak root node_modules'den dene
      bcrypt = require('bcrypt');
    } catch (error) {
      console.error('❌ bcrypt modülü bulunamadı!');
      console.error('Lütfen şu komutu çalıştırın:');
      console.error('  cd packages/api');
      console.error('  pnpm install');
      process.exit(1);
    }
  }
}

const envPath = path.join(__dirname, '../packages/infrastructure/.env');

async function migratePassword() {
  try {
    // .env dosyasını oku
    if (!fs.existsSync(envPath)) {
      console.error('❌ .env dosyası bulunamadı:', envPath);
      process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');

    let adminPassword = null;
    let adminPasswordHashExists = false;
    let adminPasswordLineIndex = -1;

    // ADMIN_PASSWORD'u bul
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // ADMIN_PASSWORD satırını bul (yorum satırı değilse)
      if (line.startsWith('ADMIN_PASSWORD=') && !line.startsWith('#')) {
        adminPassword = line.split('=')[1].trim().replace(/^["']|["']$/g, ''); // Tırnak işaretlerini kaldır
        adminPasswordLineIndex = i;
      }
      
      // ADMIN_PASSWORD_HASH zaten varsa
      if (line.startsWith('ADMIN_PASSWORD_HASH=') && !line.startsWith('#')) {
        adminPasswordHashExists = true;
      }
    }

    if (!adminPassword) {
      console.log('ℹ️  ADMIN_PASSWORD bulunamadı veya zaten yorum satırı.');
      console.log('   Eğer şifrenizi hash\'lemek istiyorsanız, .env dosyasına şunu ekleyin:');
      console.log('   ADMIN_PASSWORD=your_password_here');
      console.log('\n   Sonra bu scripti tekrar çalıştırın.\n');
      process.exit(0);
    }

    if (adminPasswordHashExists) {
      console.log('⚠️  ADMIN_PASSWORD_HASH zaten mevcut!');
      console.log('   Mevcut hash\'i korumak için script durduruldu.');
      console.log('   Eğer yeni bir hash oluşturmak istiyorsanız, önce ADMIN_PASSWORD_HASH satırını silin.\n');
      process.exit(0);
    }

    console.log('🔄 Şifre hashleniyor...\n');
    
    // Bcrypt hash oluştur
    const hash = await bcrypt.hash(adminPassword, 12);
    
    console.log('✅ Hash oluşturuldu!');
    console.log('📋 Hash:', hash);
    console.log('\n📝 .env dosyası güncelleniyor...\n');

    // Yeni içeriği oluştur
    const newLines = [];
    for (let i = 0; i < lines.length; i++) {
      if (i === adminPasswordLineIndex) {
        // Eski ADMIN_PASSWORD satırını yorum satırına çevir
        newLines.push(`# ${lines[i]} # Eski - Artık kullanılmıyor (bcrypt hash kullanılıyor)`);
        // ADMIN_PASSWORD_HASH ekle
        newLines.push(`ADMIN_PASSWORD_HASH=${hash}`);
      } else {
        newLines.push(lines[i]);
      }
    }

    // Dosyayı yaz
    fs.writeFileSync(envPath, newLines.join('\n'), 'utf8');

    console.log('✅ .env dosyası güncellendi!');
    console.log('\n📋 Yapılan değişiklikler:');
    console.log('   - ADMIN_PASSWORD yorum satırına çevrildi');
    console.log('   - ADMIN_PASSWORD_HASH eklendi');
    console.log('\n⚠️  ÖNEMLİ:');
    console.log('   - API\'yi yeniden başlatın');
    console.log('   - Login yaparak test edin');
    console.log('   - Eski ADMIN_PASSWORD satırını silebilirsiniz (artık gerekli değil)\n');

  } catch (error) {
    console.error('❌ Hata:', error.message);
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('\n💡 Çözüm:');
      console.error('   cd packages/api');
      console.error('   pnpm install\n');
    }
    process.exit(1);
  }
}

migratePassword();

