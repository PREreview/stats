import importPlugin from 'eslint-plugin-import'
import markdown from 'eslint-plugin-markdown'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['.dev/', 'dist/', 'integration-results/', 'node_modules/', 'src/.observablehq/'],
  },
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  ...markdown.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    settings: {
      'import/resolver': {
        typescript: true,
      },
    },
    rules: {
      '@typescript-eslint/array-type': ['error', { default: 'generic' }],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': ['error', { ignoreConditionalTests: true }],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/strict-boolean-expressions': 'error',
      'import/no-cycle': 'error',
      'import/no-duplicates': ['error', { 'prefer-inline': true }],
      'import/no-extraneous-dependencies': ['error'],
      'import/no-internal-modules': [
        'error',
        { allow: ['*/lib/*', 'vitest/config', 'world_countries_lists/data/**/*.json'] },
      ],
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
      quotes: ['error', 'single', { avoidEscape: true }],
    },
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: ['**/*.md/*.js'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'import/no-unresolved': 'off',
    },
  },
  {
    files: ['integration/**/*.ts'],
    rules: {
      'no-empty-pattern': 'off',
    },
  },
)
