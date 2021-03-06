module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-param-reassign': 'warn',
    'no-bitwise': 0,
    'no-nested-ternary': 0,
    'import/extensions': [
      'error',
      'always',
      {
        js: 'never',
        vue: 'never',
      },
    ],
  },
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2019,
    sourceType: 'module',
  },
  globals: {
    // window: true,
    // document: true,
  },
};
