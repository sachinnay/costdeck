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

import { vi } from 'vitest'

type Handler = (url: string, init?: RequestInit) => Response | Promise<Response> | undefined

// mockFetch answers the dashboard's API calls from handlers (first match wins); anything
// unhandled gets a 404, which the pages show as a load error. It returns the mock, so a
// test can check which calls were made.
export function mockFetch(...handlers: Handler[]) {
  const fn = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.pathname + input.search : input.url
    for (const h of handlers) {
      const res = await h(url, init)
      if (res) return res
    }
    return new Response(JSON.stringify({ error: 'not found' }), { status: 404 })
  })
  vi.stubGlobal('fetch', fn)
  return fn
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

// on matches a method and an exact path (or a path prefix ending in *).
export const on = (method: string, path: string, reply: (url: string, init?: RequestInit) => Response): Handler =>
  (url, init) => {
    const m = (init?.method || 'GET').toUpperCase()
    const p = url.split('?')[0]
    const hit = path.endsWith('*') ? p.startsWith(path.slice(0, -1)) : p === path
    return m === method && hit ? reply(url, init) : undefined
  }
