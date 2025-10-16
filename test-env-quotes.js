#!/usr/bin/env node

/**
 * Test script to verify environment variable quote stripping
 * Run this to test the quote stripping logic locally
 */

// Simulate Render's quote wrapping behavior
process.env.TEST_JWT_SECRET = '"N+WILalYI9dJwpo0bZvi94XqFpCZrrYsWNd4adRJyPp5/IKSPmDCExMvsb+NQt0HYF9yk/cmwofSjNhFRu3EYg=="';
process.env.TEST_NORMAL_VAR = 'normalvalue';
process.env.TEST_SINGLE_QUOTES = "'singlequoted'";
process.env.TEST_MIXED = '"mixedquote\'';

import { stripQuotes, getEnv, debugEnvVars } from './src/utils/env.js';

console.log('🧪 Testing environment variable quote stripping...\n');

// Test cases
const testCases = [
  { key: 'TEST_JWT_SECRET', expected: 'N+WILalYI9dJwpo0bZvi94XqFpCZrrYsWNd4adRJyPp5/IKSPmDCExMvsb+NQt0HYF9yk/cmwofSjNhFRu3EYg==' },
  { key: 'TEST_NORMAL_VAR', expected: 'normalvalue' },
  { key: 'TEST_SINGLE_QUOTES', expected: 'singlequoted' },
  { key: 'TEST_MIXED', expected: '"mixedquote\'' }, // Should not strip mixed quotes
];

let passed = 0;
let total = testCases.length;

testCases.forEach(({ key, expected }) => {
  const raw = process.env[key];
  const cleaned = getEnv(key);
  const success = cleaned === expected;
  
  console.log(`Test ${key}:`);
  console.log(`  Raw:      "${raw}"`);
  console.log(`  Cleaned:  "${cleaned}"`);
  console.log(`  Expected: "${expected}"`);
  console.log(`  Result:   ${success ? '✅ PASS' : '❌ FAIL'}\n`);
  
  if (success) passed++;
});

console.log(`\n📊 Results: ${passed}/${total} tests passed`);

// Test the debug function
console.log('\n🔍 Debug output test:');
debugEnvVars(['TEST_JWT_SECRET', 'TEST_NORMAL_VAR']);

// Test JWT verification
console.log('\n🔐 JWT Secret Test:');
const jwtSecret = getEnv('TEST_JWT_SECRET');
console.log(`JWT Secret length: ${jwtSecret.length} chars`);
console.log(`Starts with quote: ${jwtSecret.startsWith('"')}`);
console.log(`Ends with quote: ${jwtSecret.endsWith('"')}`);

if (passed === total) {
  console.log('\n🎉 All tests passed! Quote stripping is working correctly.');
  process.exit(0);
} else {
  console.log('\n💥 Some tests failed. Check the implementation.');
  process.exit(1);
}