// Simple ESLint configuration for OncoSafeRx
module.exports = {
  ignorePatterns: [
    'node_modules/',
    'build/',
    'dist/',
    'coverage/',
    '*.config.js',
    '*.config.ts',
    '.vite/',
    'vite.config.ts'
  ],
  rules: {
    // Basic rules for code quality
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
  },
};