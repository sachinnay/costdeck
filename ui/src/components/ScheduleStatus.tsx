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

import type { StatusLine, StatusTone } from '../lib/schedule'

const toneStyle: Record<StatusTone, { dot: string; text: string }> = {
  up: { dot: 'bg-emerald-500', text: 'text-emerald-700' },
  down: { dot: 'bg-slate-300', text: 'text-slate-700' },
  busy: { dot: 'bg-sky-500 animate-pulse', text: 'text-sky-700' },
  manual: { dot: 'bg-amber-500', text: 'text-amber-800' },
  blocked: { dot: 'bg-sky-400 animate-pulse', text: 'text-sky-700' },
}

// ScheduleStatusLine renders statusLine(): a coloured dot, the state and what happens next.
export default function ScheduleStatusLine({ line, size = 'md' }: { line: StatusLine; size?: 'md' | 'lg' }) {
  const tone = toneStyle[line.tone]
  return (
    <div className={`flex items-start gap-2 ${size === 'lg' ? 'text-base' : 'text-sm'}`}>
      <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${tone.dot}`} />
      <div className="min-w-0">
        <span className={`font-semibold ${tone.text}`}>{line.title}</span>
        {line.detail && <span className="text-slate-500"> · {line.detail}</span>}
      </div>
    </div>
  )
}
