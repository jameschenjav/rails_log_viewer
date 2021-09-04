const extensions = ['.ts'];

module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['airbnb'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    'no-console': ['warn', { allow: ['error'] }],
    'no-debugger': process.env.NODE_ENV !== 'production' ? 'warn' : 'error',
    'max-len': ['error', 120],

    // fix require `.ts` warning which is invalid in ts
    'import/extensions': [
      'error',
      'always',
      {
        ts: 'never',
        js: 'never',
      },
    ],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: ['airbnb', 'airbnb-typescript'],
      settings: {
        'import/resolver': {
          node: { extensions },
          typescript: {},
        },
      },
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      rules: {
        'max-classes-per-file': 'off',
      },
    },
    {
      files: ['vite.config.ts'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};
