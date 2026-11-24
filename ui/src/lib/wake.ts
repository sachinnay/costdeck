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

import { getJSON } from './api'

// WakeStatus is GET /api/wake/{ns}: the schedule that keeps a namespace down and whether
// its routes show the sleep page.
export interface WakeStatus {
  namespace: string
  schedule?: { kind: 'group' | 'config'; name: string }
  desiredState?: 'Up' | 'Down'
  phase?: string
  mode?: string
  overrideExpiresAt?: string
  sleeping: boolean
  hostnames: string[]
}

export const fetchWakeStatus = (ns: string) => getJSON<WakeStatus>(`/api/wake/${encodeURIComponent(ns)}`)

// safeReturn keeps the way back to one of the namespace's own hosts, so the wake page
// cannot send anyone elsewhere.
export function safeReturn(raw: string | null, hostnames: string[]): string | null {
  if (!raw) return null
  try {
    const u = new URL(raw)
    if ((u.protocol === 'https:' || u.protocol === 'http:') && hostnames.includes(u.hostname)) return u.toString()
  } catch {
    // not a URL
  }
  return null
}

// isAwake: the namespace is up and its routes lead to the application again.
export const isAwake = (s: WakeStatus) => s.phase === 'ScaledUp' && !s.sleeping
