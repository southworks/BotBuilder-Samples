module.exports = {
    ...
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ...
      project: './tslint.json',
    },
    rules: {
      ...
      '@typescript-eslint/no-floating-promises': ['error'],
    },
  }
