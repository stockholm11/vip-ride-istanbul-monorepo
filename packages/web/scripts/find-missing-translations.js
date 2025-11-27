import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.join(__dirname, '../src/locales');
const locales = ['tr', 'en', 'ar'];

// Read all translation files
const translations = {};
locales.forEach(locale => {
  const filePath = path.join(localesDir, locale, 'translation.json');
  if (fs.existsSync(filePath)) {
    translations[locale] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } else {
    console.warn(`Warning: Translation file not found for locale: ${locale}`);
    translations[locale] = {};
  }
});

// Function to get all keys from nested object
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Get all keys from all locales
const allKeys = new Set();
locales.forEach(locale => {
  const keys = getAllKeys(translations[locale]);
  keys.forEach(key => allKeys.add(key));
});

// Find missing translations
const missing = {};
locales.forEach(locale => {
  missing[locale] = [];
  allKeys.forEach(key => {
    const keys = key.split('.');
    let value = translations[locale];
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        value = undefined;
        break;
      }
    }
    if (value === undefined) {
      missing[locale].push(key);
    }
  });
});

// Print results
console.log('\n=== Missing Translations Report ===\n');
let hasMissing = false;
locales.forEach(locale => {
  if (missing[locale].length > 0) {
    hasMissing = true;
    console.log(`\n${locale.toUpperCase()} - Missing ${missing[locale].length} translation(s):`);
    missing[locale].forEach(key => {
      console.log(`  - ${key}`);
    });
  } else {
    console.log(`\n${locale.toUpperCase()} - All translations present ✓`);
  }
});

if (!hasMissing) {
  console.log('\n✓ All translations are complete!\n');
  process.exit(0);
} else {
  console.log('\n⚠ Some translations are missing. Please add them to the respective translation files.\n');
  process.exit(1);
}

