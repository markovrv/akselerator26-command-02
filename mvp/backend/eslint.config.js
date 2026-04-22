module.exports = [
  {
    languageOptions: {
      globals: {
        node: true,
        es2021: true,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'semi': 'off',
      'quotes': ['error', 'single'],
    },
  },
];
