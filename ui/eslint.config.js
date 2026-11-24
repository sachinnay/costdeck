/**
 * Copyright 2026 NetCracker Technology Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // tailwindcss-animate classes do nothing here: the plugin is not installed and
      // Tailwind v4 has no such utilities, so the element just appears without the effect.
      'no-restricted-syntax': ['error', ...['Literal[value', 'TemplateElement[value.raw'].map(node => ({
        selector: `${node}=/(^|\\s)(animate-(in|out)|(fade|zoom|spin)-(in|out)(-\\S+)?|slide-(in|out)-(from|to)-\\S+)(\\s|$)/]`,
        message: 'tailwindcss-animate classes are not available; use the animate-* tokens in src/index.css (pop, rise, drop, fade, slide-in).',
      }))],
    },
  },
])
