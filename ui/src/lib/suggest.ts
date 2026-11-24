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

import { getJSON } from './api'
import type { ScalingSchedule } from './types'

// Suggestion is GET /api/namespaces/{ns}/schedule-suggestion: working hours read from a
// week of CPU usage (internal/scaling/suggest.go).
export interface Suggestion {
  namespace: string
  reason: 'pattern' | 'steady' | 'idle' | 'insufficient'
  schedules: ScalingSchedule[]
  upShare: number
  busy: boolean[][]
  up: boolean[][]
  days: number
  timezone: string
  monthlySaving: number
  currency: string
  source: 'victoriametrics' | 'costdeck'
}

export const fetchSuggestion = (ns: string, timezone: string) =>
  getJSON<Suggestion>(`/api/namespaces/${encodeURIComponent(ns)}/schedule-suggestion?timezone=${encodeURIComponent(timezone)}`)

// suggestionNote says what a suggestion found, for the schedule editor.
export function suggestionNote(s: Suggestion, money: (n: number) => string): string {
  switch (s.reason) {
    case 'pattern':
      return `From ${s.days} days of usage: up ${Math.round(s.upShare * 100)}% of the week, with an hour of margin around use. It would save about ${money(s.monthlySaving)} a month.`
    case 'steady':
      return `${s.namespace} is busy at almost every hour of the last ${s.days} days: a schedule would cut into use.`
    case 'idle':
      return `${s.namespace} did nothing in the last ${s.days} days: it could stay scaled down.`
    default:
      return s.source === 'victoriametrics'
        ? `Not enough usage history for ${s.namespace} yet: a suggestion needs at least a day.`
        : 'Suggestions need the usage history VictoriaMetrics keeps; Cost Deck alone keeps the last hour.'
  }
}
