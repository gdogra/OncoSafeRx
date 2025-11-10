module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  extends: ['eslint:recommended'],
  ignorePatterns: [
    'node_modules/',
    'frontend/node_modules/',
    'dist/',
    'frontend/dist/',
    'coverage/',
    'public/',
  ],
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-constant-condition': ['error', { checkLoops: false }],
  },
};

