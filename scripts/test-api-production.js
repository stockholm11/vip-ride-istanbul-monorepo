#!/usr/bin/env node

/**
 * Production API Test Script
 * 
 * Kullanım:
 *   node scripts/test-api-production.js
 * 
 * Bu script Render'da deploy edilmiş API'yi test eder.
 */

const https = require('https');
const http = require('http');

const API_URL = process.env.API_URL || 'https://vip-ride-api.onrender.com';
const BASE_URL = API_URL.replace(/^https?:\/\//, '');

// Test sonuçları
const results = {
  passed: 0,
  failed: 0,
  errors: []
};

// HTTP request helper
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const isHttps = API_URL.startsWith('https');
    const client = isHttps ? https : http;
    
    const options = {
      hostname: BASE_URL.split('/')[0],
      port: isHttps ? 443 : 80,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    };

    const req = client.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody || body
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test function
async function test(name, testFn) {
  try {
    await testFn();
    console.log(`✅ ${name}`);
    results.passed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    results.failed++;
    results.errors.push({ name, error: error.message });
  }
}

// Test cases
async function runTests() {
  console.log('🚀 API Test Başlatılıyor...\n');
  console.log(`📍 API URL: ${API_URL}\n`);
  console.log('─'.repeat(50) + '\n');

  // 1. Health Check
  await test('Health Check', async () => {
    const response = await makeRequest('/api/health');
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }
    if (!response.body || response.body.status !== 'ok') {
      throw new Error('Health check failed');
    }
  });

  // 2. Public Vehicles
  await test('GET /api/public/vehicles', async () => {
    const response = await makeRequest('/api/public/vehicles');
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }
    if (!Array.isArray(response.body)) {
      throw new Error('Response should be an array');
    }
  });

  // 3. Public Tours
  await test('GET /api/public/tours', async () => {
    const response = await makeRequest('/api/public/tours');
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }
    if (!Array.isArray(response.body)) {
      throw new Error('Response should be an array');
    }
  });

  // 4. Tour Categories
  await test('GET /api/public/tour-categories', async () => {
    const response = await makeRequest('/api/public/tour-categories');
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }
    if (!Array.isArray(response.body)) {
      throw new Error('Response should be an array');
    }
  });

  // 5. Add-ons
  await test('GET /api/public/add-ons', async () => {
    const response = await makeRequest('/api/public/add-ons');
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }
    if (!Array.isArray(response.body)) {
      throw new Error('Response should be an array');
    }
  });

  // 6. Featured Transfers
  await test('GET /api/public/featured-transfers', async () => {
    const response = await makeRequest('/api/public/featured-transfers');
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }
    if (!Array.isArray(response.body)) {
      throw new Error('Response should be an array');
    }
  });

  // 7. Contact Form (POST)
  await test('POST /api/public/contact (validation)', async () => {
    const response = await makeRequest('/api/public/contact', 'POST', {
      name: '',
      email: '',
      phone: '',
      message: ''
    });
    // Should return 400 for validation error
    if (response.status !== 400) {
      throw new Error(`Expected 400 for invalid data, got ${response.status}`);
    }
  });

  // 8. Admin Login (should fail without credentials)
  await test('POST /api/admin/auth/login (unauthorized)', async () => {
    const response = await makeRequest('/api/admin/auth/login', 'POST', {
      username: 'test',
      password: 'wrong'
    });
    // Should return 401 or 400
    if (response.status !== 401 && response.status !== 400) {
      throw new Error(`Expected 401 or 400, got ${response.status}`);
    }
  });

  // Summary
  console.log('\n' + '─'.repeat(50));
  console.log('\n📊 Test Sonuçları:');
  console.log(`   ✅ Başarılı: ${results.passed}`);
  console.log(`   ❌ Başarısız: ${results.failed}`);
  console.log(`   📈 Toplam: ${results.passed + results.failed}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Hatalar:');
    results.errors.forEach(({ name, error }) => {
      console.log(`   - ${name}: ${error}`);
    });
  }

  if (results.failed === 0) {
    console.log('\n🎉 Tüm testler başarılı! API çalışıyor.\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Bazı testler başarısız oldu.\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('❌ Test script hatası:', error);
  process.exit(1);
});

