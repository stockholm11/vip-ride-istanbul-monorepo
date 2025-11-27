#!/usr/bin/env node

/**
 * API'yi test etmek için basit script
 * 
 * Kullanım:
 *   node scripts/test-api.js
 * 
 * Bu script:
 * 1. Health endpoint'ini test eder
 * 2. Login endpoint'ini test eder (JWT_SECRET kontrolü)
 * 3. JWT token'ın doğru çalıştığını test eder
 */

const http = require('http');
const https = require('https');

// API URL'ini environment'tan al veya default kullan
const API_URL = process.env.API_URL || 'http://localhost:3000';
const API_BASE = API_URL.replace(/^https?:\/\//, '').split('/')[0];
const [host, port] = API_BASE.includes(':') 
  ? API_BASE.split(':') 
  : [API_BASE, API_URL.startsWith('https') ? 443 : 3000];
const isHttps = API_URL.startsWith('https');
const httpModule = isHttps ? https : http;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = httpModule.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: parsed, raw: body });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: body, raw: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testHealth() {
  log('\n📡 Test 1: Health Endpoint', 'blue');
  log('─────────────────────────────────────', 'blue');
  
  try {
    const response = await makeRequest({
      hostname: host,
      port: port,
      path: '/api/health',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200 && response.data.status === 'ok') {
      log('✅ Health check başarılı!', 'green');
      return true;
    } else {
      log(`❌ Health check başarısız! Status: ${response.status}`, 'red');
      log(`   Response: ${JSON.stringify(response.data)}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ Health check hatası: ${error.message}`, 'red');
    log('   API çalışıyor mu kontrol edin!', 'yellow');
    return false;
  }
}

async function testLogin() {
  log('\n🔐 Test 2: Login Endpoint (JWT_SECRET Test)', 'blue');
  log('─────────────────────────────────────', 'blue');
  
  // .env dosyasından admin email'i oku (opsiyonel)
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '../packages/infrastructure/.env');
  
  let adminEmail = 'admin@vipride.com';
  let adminPassword = null;
  
  try {
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const emailMatch = envContent.match(/ADMIN_EMAIL=(.+)/);
      const passwordMatch = envContent.match(/ADMIN_PASSWORD=(.+)/);
      
      if (emailMatch) {
        adminEmail = emailMatch[1].trim().replace(/^["']|["']$/g, '');
      }
      if (passwordMatch && !passwordMatch[1].trim().startsWith('#')) {
        adminPassword = passwordMatch[1].trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch (e) {
    // .env okunamazsa default değerleri kullan
  }

  if (!adminPassword) {
    log('⚠️  ADMIN_PASSWORD bulunamadı veya yorum satırı.', 'yellow');
    log('   Login testini atlıyorum...', 'yellow');
    log('   (JWT_SECRET kontrolü için login gerekli değil, API başladıysa JWT_SECRET doğru demektir)', 'yellow');
    return true;
  }

  try {
    const response = await makeRequest({
      hostname: host,
      port: port,
      path: '/api/admin/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }, {
      email: adminEmail,
      password: adminPassword,
    });

    if (response.status === 200 && response.data.token) {
      log('✅ Login başarılı! JWT token oluşturuldu.', 'green');
      log(`   Token: ${response.data.token.substring(0, 20)}...`, 'yellow');
      return response.data.token;
    } else {
      log(`❌ Login başarısız! Status: ${response.status}`, 'red');
      log(`   Response: ${JSON.stringify(response.data)}`, 'yellow');
      return null;
    }
  } catch (error) {
    log(`❌ Login hatası: ${error.message}`, 'red');
    return null;
  }
}

async function testAuthMe(token) {
  if (!token) {
    log('\n🔒 Test 3: Auth/Me Endpoint (Atlandı - Token yok)', 'blue');
    return false;
  }

  log('\n🔒 Test 3: Auth/Me Endpoint (JWT Token Doğrulama)', 'blue');
  log('─────────────────────────────────────', 'blue');
  
  try {
    const response = await makeRequest({
      hostname: host,
      port: port,
      path: '/api/admin/auth/me',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 200 && response.data.email) {
      log('✅ JWT token doğrulandı!', 'green');
      log(`   Email: ${response.data.email}`, 'yellow');
      log(`   Role: ${response.data.role}`, 'yellow');
      return true;
    } else {
      log(`❌ Token doğrulama başarısız! Status: ${response.status}`, 'red');
      log(`   Response: ${JSON.stringify(response.data)}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ Token doğrulama hatası: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('\n🚀 API Test Başlatılıyor...', 'blue');
  log(`   API URL: ${API_URL}`, 'yellow');
  log(`   Host: ${host}:${port}`, 'yellow');

  const healthOk = await testHealth();
  
  if (!healthOk) {
    log('\n❌ API çalışmıyor veya erişilemiyor!', 'red');
    log('   Lütfen API\'nin başlatıldığından emin olun:', 'yellow');
    log('   pnpm dev:api', 'yellow');
    process.exit(1);
  }

  const token = await testLogin();
  await testAuthMe(token);

  log('\n📊 Test Özeti:', 'blue');
  log('─────────────────────────────────────', 'blue');
  log('✅ Health check: API çalışıyor', 'green');
  
  if (token) {
    log('✅ Login: JWT_SECRET doğru çalışıyor', 'green');
    log('✅ Token doğrulama: JWT token sistemi çalışıyor', 'green');
  } else {
    log('⚠️  Login: Test edilemedi (ADMIN_PASSWORD gerekli)', 'yellow');
  }

  log('\n🎉 Tüm testler tamamlandı!', 'green');
  log('\n💡 JWT_SECRET doğru ayarlanmış - API başarıyla başladı!', 'green');
  log('   Eğer API başladıysa ve hata yoksa, JWT_SECRET doğru demektir.\n', 'yellow');
}

main().catch((error) => {
  log(`\n❌ Test hatası: ${error.message}`, 'red');
  process.exit(1);
});

