import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';
import pluginPrettier from 'eslint-plugin-prettier';
import prettier from 'eslint-config-prettier';


export default [
  js.configs.recommended,
  ...tseslint.configs.recommended, 
  {
    files: ['**/*.{js,ts,jsx,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.app.json',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react: pluginReact,
      prettier: pluginPrettier,
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
      'semi': ['warn', 'always'],
      'quotes': ['warn', 'single'],
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      'prettier/prettier': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  prettier,
  {
    ignores: ['dist', 'node_modules', 'build'],
  },
];
