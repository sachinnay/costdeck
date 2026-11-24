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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

let mod: typeof import('./toast')
beforeEach(async () => {
  vi.resetModules()
  vi.useFakeTimers()
  mod = await import('./toast')
})
afterEach(() => vi.useRealTimers())

describe('toast', () => {
  it('fades confirmations after five seconds', () => {
    const { result } = renderHook(() => mod.useToasts())
    act(() => mod.toast.success('Saved'))
    expect(result.current.map(t => t.text)).toEqual(['Saved'])
    act(() => vi.advanceTimersByTime(4999))
    expect(result.current).toHaveLength(1)
    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toHaveLength(0)
  })
  it('keeps errors until they are closed', () => {
    const { result } = renderHook(() => mod.useToasts())
    act(() => mod.toast.error('Could not save'))
    act(() => vi.advanceTimersByTime(60_000))
    expect(result.current.map(t => [t.tone, t.text])).toEqual([['error', 'Could not save']])
    act(() => mod.dismissToast(result.current[0].id))
    expect(result.current).toHaveLength(0)
  })
  it('shows only the latest four', () => {
    const { result } = renderHook(() => mod.useToasts())
    act(() => { for (let i = 1; i <= 6; i++) mod.toast.error(`e${i}`) })
    expect(result.current.map(t => t.text)).toEqual(['e3', 'e4', 'e5', 'e6'])
  })
})
