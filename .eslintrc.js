module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  overrides: [
    {
      files: ['tests/**'],
      env: {
        'jest/globals': true,
      },
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
      rules: { 'jest/prefer-expect-assertions': 'off' },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },

  rules: {
    // Moved to prettier for stylistic rules,
    // see https://typescript-eslint.io/linting/troubleshooting/formatting/
  },
  plugins: ['jest'],
};
