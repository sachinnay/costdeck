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

import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { json, mockFetch, on } from '../test/fetch'
import NamespaceDetails from './NamespaceDetails'
import ScalingPage from './ScalingPage'

vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })

// A failed API call (an expired session, a server error) used to put the error body into
// the page's data, and the page crashed on it.
describe('pages survive failed API calls', () => {
  it('the namespace page says why its pods are missing', async () => {
    mockFetch(on('GET', '/api/namespaces/shop-dev/pods', () => json({ error: 'session expired' }, 401)))
    render(<NamespaceDetails namespace="shop-dev" onBack={() => {}} />)
    expect(await screen.findByText('Could not load the pods: session expired')).toBeTruthy()
    expect(await screen.findByText(/Could not load the schedules: /)).toBeTruthy()
  })
  it('the schedules page says why it is empty', async () => {
    mockFetch(on('GET', '/api/scaling/groups', () => json({ error: 'boom' }, 500)))
    render(<ScalingPage onSelectNamespace={() => {}} />)
    expect((await screen.findByRole('alert')).textContent).toBe('Could not load the schedules: boom')
  })
  it('the schedules page clears the error once loading works again', async () => {
    let fail = true
    vi.useFakeTimers({ shouldAdvanceTime: true })
    mockFetch(
      on('GET', '/api/scaling/groups', () => (fail ? json({ error: 'boom' }, 500) : json([]))),
      on('GET', '/api/scaling/configs', () => json([])),
      on('GET', '/api/namespaces', () => json([])),
    )
    render(<ScalingPage onSelectNamespace={() => {}} />)
    await screen.findByRole('alert')
    fail = false
    await vi.advanceTimersByTimeAsync(10_000)
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
    vi.useRealTimers()
  })
})
