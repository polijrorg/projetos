/* eslint-env node */
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  // base
  expoConfig,

  // ignore de pastas geradas
  {
    ignores: ['dist/**', '.next/**'],
  },

  // overrides/rules globais
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      // avisos listados por você
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react-hooks/rules-of-hooks': 'off',
      '@next/next/no-img-element': 'off',
    },
  },
]);
