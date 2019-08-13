module.exports = {
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
    parser: 'babel-eslint',
  },
  parser: 'babel-eslint',
  extends: ['airbnb'],
  plugins: ['svelte3'],
  env: {
    es6: true,
    browser: true,
  },
  overrides: [
    {
      files: ['**/*.svelte'],
      processor: 'svelte3/svelte3',
      rules: {
        'import/first': 0,
        'import/prefer-default-export': 0,
        'import/no-mutable-exports': 0,
      },
    },
  ],
  rules: {
    'no-bitwise': 0,
  },
};
