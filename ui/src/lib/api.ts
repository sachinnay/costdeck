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

import type { CostEstimate, Recommendations } from './types'

// apiError extracts the server's {"error": "..."} message from a failed response.
export async function apiError(res: Response): Promise<string> {
  const text = await res.text()
  try {
    const parsed = JSON.parse(text)
    if (parsed && typeof parsed.error === 'string') return parsed.error
  } catch {
    // Not JSON: fall through to the raw body.
  }
  return text || res.statusText
}

// fetchNamespaceCost prices a namespace via POST /api/costing; it resolves to null when
// the server cannot price it.
export async function fetchNamespaceCost(namespace: string): Promise<CostEstimate | null> {
  const res = await fetch('/api/costing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetType: 'namespace', targetName: namespace }),
  })
  return res.ok ? res.json() : null
}

// getJSON fetches a JSON document and throws the server's error message for a failed
// response, so an error body is never taken for data.
export async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(await apiError(res))
  return res.json()
}

// errorMessage turns a caught value into display text.
export const errorMessage = (err: unknown): string => (err instanceof Error ? err.message : String(err))

// fetchRecommendations loads read-only right-sizing advice; it resolves to null when the
// namespace has no usage data yet.
export async function fetchRecommendations(namespace: string): Promise<Recommendations | null> {
  const res = await fetch(`/api/namespaces/${namespace}/recommendations`)
  return res.ok ? res.json() : null
}
