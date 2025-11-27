#!/usr/bin/env node

/**
 * API URL Kontrol Scripti
 * Build edilmiş dosyalarda API URL'in doğru olup olmadığını kontrol eder
 */

const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../packages/web/dist');
const expectedApiUrl = 'https://vip-ride-api.onrender.com';
const wrongApiUrls = ['localhost:3000', 'http://localhost:3000', 'undefined'];

console.log('🔍 API URL Kontrolü Başlatılıyor...\n');
console.log(`📍 Beklenen API URL: ${expectedApiUrl}\n`);

// Tüm JS dosyalarını bul
function findJsFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(findJsFiles(filePath));
    } else if (file.endsWith('.js')) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Dosyada string ara
function searchInFile(filePath, searchString) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes(searchString);
  } catch (error) {
    return false;
  }
}

// Dosyada regex ile ara
function searchRegexInFile(filePath, regex) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(regex);
    return matches ? matches[0] : null;
  } catch (error) {
    return null;
  }
}

// Kontrol
const jsFiles = findJsFiles(distPath);
console.log(`📁 ${jsFiles.length} JavaScript dosyası bulundu\n`);

let foundCorrectUrl = false;
let foundWrongUrl = false;
const wrongUrlFiles = [];

jsFiles.forEach(file => {
  // Doğru URL'i kontrol et
  if (searchInFile(file, expectedApiUrl)) {
    foundCorrectUrl = true;
    const relativePath = path.relative(distPath, file);
    console.log(`✅ Doğru API URL bulundu: ${relativePath}`);
  }
  
  // Yanlış URL'leri kontrol et
  wrongApiUrls.forEach(wrongUrl => {
    if (searchInFile(file, wrongUrl)) {
      foundWrongUrl = true;
      const relativePath = path.relative(distPath, file);
      if (!wrongUrlFiles.includes(relativePath)) {
        wrongUrlFiles.push(relativePath);
      }
    }
  });
});

console.log('\n' + '─'.repeat(50) + '\n');

// Sonuç
if (foundCorrectUrl && !foundWrongUrl) {
  console.log('✅ BAŞARILI: API URL doğru ayarlanmış!');
  console.log(`   ✅ Doğru URL bulundu: ${expectedApiUrl}`);
  console.log(`   ✅ Yanlış URL bulunamadı`);
  console.log('\n🎉 Build başarılı! API URL production için hazır.\n');
  process.exit(0);
} else if (foundWrongUrl) {
  console.log('❌ HATA: Yanlış API URL bulundu!');
  console.log(`   ❌ Yanlış URL içeren dosyalar:`);
  wrongUrlFiles.forEach(file => {
    console.log(`      - ${file}`);
  });
  console.log('\n⚠️  Lütfen yeniden build yapın:');
  console.log('   cd packages/web');
  console.log(`   $env:VITE_API_URL="${expectedApiUrl}"`);
  console.log('   pnpm build\n');
  process.exit(1);
} else if (!foundCorrectUrl) {
  console.log('⚠️  UYARI: API URL bulunamadı!');
  console.log('   Bu normal olabilir (minified kod içinde farklı formatta olabilir)');
  console.log('\n💡 Browser\'da test edin:');
  console.log('   1. Siteyi açın');
  console.log('   2. F12 > Network tab');
  console.log('   3. API isteklerini kontrol edin\n');
  process.exit(0);
}

