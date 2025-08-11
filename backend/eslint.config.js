const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const globals = require('globals');
const pluginPrettier = require('eslint-plugin-prettier');
const prettier = require('eslint-config-prettier');

module.exports = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
      semi: ['warn', 'always'],
      quotes: ['warn', 'single'],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      'prettier/prettier': 'warn',
    },
  },
  prettier,
  {
    ignores: ['dist', 'node_modules', 'build'],
  },
];
