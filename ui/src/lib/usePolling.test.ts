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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { usePolling } from './usePolling'

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

describe('usePolling', () => {
  it('loads at once and then on every interval until unmounted', () => {
    const load = vi.fn()
    const { unmount } = renderHook(() => usePolling(load, 1000))
    expect(load).toHaveBeenCalledTimes(1)
    act(() => vi.advanceTimersByTime(2999))
    expect(load).toHaveBeenCalledTimes(3)
    unmount()
    act(() => vi.advanceTimersByTime(5000))
    expect(load).toHaveBeenCalledTimes(3)
  })

  it('loads once when there is no interval', () => {
    const load = vi.fn()
    renderHook(() => usePolling(load, null))
    act(() => vi.advanceTimersByTime(60_000))
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('always calls the latest load without restarting the timer', () => {
    const seen: string[] = []
    const { rerender } = renderHook(({ ns }) => usePolling(() => seen.push(ns), 1000), { initialProps: { ns: 'a' } })
    act(() => vi.advanceTimersByTime(500))
    rerender({ ns: 'b' })
    act(() => vi.advanceTimersByTime(500))
    expect(seen).toEqual(['a', 'b'])
  })

  it('starts over when the key changes', () => {
    const seen: string[] = []
    const { rerender } = renderHook(({ ns }) => usePolling(() => seen.push(ns), 1000, ns), { initialProps: { ns: 'a' } })
    act(() => vi.advanceTimersByTime(800))
    rerender({ ns: 'b' })
    expect(seen).toEqual(['a', 'b'])
    act(() => vi.advanceTimersByTime(800))
    expect(seen).toEqual(['a', 'b'])
    act(() => vi.advanceTimersByTime(200))
    expect(seen).toEqual(['a', 'b', 'b'])
  })
})
