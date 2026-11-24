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

import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { json, mockFetch, on } from '../test/fetch'
import ScheduleWizard from './ScheduleWizard'
import type { Suggestion } from '../lib/suggest'

const grid = () => Array.from({ length: 7 }, () => Array(24).fill(false))
const suggestion = (s: Partial<Suggestion>): Suggestion => ({
  namespace: 'shop-dev', reason: 'pattern', upShare: 50 / 168, busy: grid(), up: grid(), days: 7, timezone: 'Europe/Berlin',
  monthlySaving: 142.4, currency: 'USD', source: 'victoriametrics',
  schedules: [{ days: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '18:00', timezone: 'Europe/Berlin' }], ...s,
})

describe('Schedule suggested from usage', () => {
  it('fills the schedule with the busy hours and saves them', async () => {
    const fetch = mockFetch(
      on('GET', '/api/settings', () => json({ calendars: [] })),
      on('GET', '/api/namespaces/shop-dev/schedule-suggestion', () => json(suggestion({}))),
      on('POST', '/api/scaling/groups', (_, init) => json(JSON.parse(init!.body as string), 201)),
    )
    const onSaved = vi.fn()
    render(<ScheduleWizard kind="group" namespaces={['shop-dev', 'shop-qa']} groups={[]} onClose={() => {}} onSaved={onSaved} />)
    const user = userEvent.setup()
    expect(screen.queryByRole('button', { name: 'Suggest from usage' })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'shop-dev' }))
    await user.click(screen.getByRole('button', { name: 'Suggest from usage' }))
    expect(await screen.findByText(/From 7 days of usage: up 30% of the week.*about \$142 a month\./)).toBeTruthy()
    const url = String(fetch.mock.calls.find(([u]) => String(u).includes('schedule-suggestion'))![0])
    expect(url).toContain(`timezone=${encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone)}`)
    await user.click(screen.getByRole('button', { name: 'Create schedule' }))
    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    const body = JSON.parse(fetch.mock.calls.find(([u, init]) => u === '/api/scaling/groups' && init?.method === 'POST')![1]!.body as string)
    expect(body.spec.schedules).toEqual([{ days: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '18:00', timezone: 'Europe/Berlin' }])
  })

  it('says why there is no suggestion, and leaves the schedule alone', async () => {
    mockFetch(
      on('GET', '/api/settings', () => json({ calendars: [] })),
      on('GET', '/api/namespaces/shop-dev/schedule-suggestion', () => json(suggestion({ reason: 'insufficient', schedules: [], source: 'costdeck', days: 0 }))),
    )
    render(<ScheduleWizard kind="group" namespaces={['shop-dev']} groups={[]} onClose={() => {}} onSaved={() => {}} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'shop-dev' }))
    await user.click(screen.getByRole('button', { name: 'Suggest from usage' }))
    expect(await screen.findByText(/Suggestions need the usage history VictoriaMetrics keeps/)).toBeTruthy()
  })
})
