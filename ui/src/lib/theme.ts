/**
 * Copyright 2024-2025 NetCracker Technology Corporation
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

import { useSyncExternalStore } from 'react'

// The colour theme: follow the operating system, or always light or dark. The choice is
// a per-browser convenience kept in localStorage; public/theme-init.js applies it before the first
// paint with the same rules, so a reload never flashes the other theme.
export type Theme = 'system' | 'light' | 'dark'

const KEY = 'costdeck.theme'
const systemDark = window.matchMedia('(prefers-color-scheme: dark)')
const listeners = new Set<() => void>()

function stored(): Theme {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

let theme = stored()

function apply() {
  document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && systemDark.matches))
}

function changed() {
  apply()
  listeners.forEach(l => l())
}

apply()
systemDark.addEventListener('change', apply)
// Another tab changed the theme.
window.addEventListener('storage', e => {
  if (e.key !== KEY) return
  theme = stored()
  changed()
})

export function setTheme(t: Theme) {
  theme = t
  try {
    if (t === 'system') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, t)
  } catch {
    // Not remembered; it still applies until the page is reloaded.
  }
  changed()
}

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  return () => { listeners.delete(onChange) }
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, () => theme)
}
