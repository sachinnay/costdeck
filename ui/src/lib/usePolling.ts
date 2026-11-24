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

import { useEffect, useEffectEvent } from 'react'

// usePolling calls load right away and then every intervalMs (never, when intervalMs is
// null), starting over whenever key changes. load is an effect event: it always sees the
// current props and state without re-arming the timer, and the state it sets lands after
// its fetches resolve rather than synchronously inside the effect.
export function usePolling(load: () => void, intervalMs: number | null, key?: unknown) {
  const tick = useEffectEvent(load)
  useEffect(() => {
    tick()
    if (intervalMs === null) return
    const id = setInterval(() => tick(), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs, key])
}
