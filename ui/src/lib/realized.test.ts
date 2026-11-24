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

import { describe, expect, it } from 'vitest'
import { nodeVerdict } from './realized'
import type { NodeCheck } from './types'

const node = (n: Partial<NodeCheck>): NodeCheck => ({ name: 'n', hourlyCost: 0.2, gone: false, blockers: [], tenants: [], requestedShare: 0, ...n })

describe('nodeVerdict', () => {
  it('says why a node went or stayed', () => {
    expect(nodeVerdict(node({ gone: true }), true)).toEqual({ tone: 'success', text: 'removed' })
    expect(nodeVerdict(node({ blockers: [{ reason: 'pdb', pod: 'shop/db-0', detail: 'x' }] }), true).text).toBe('kept by one blocker on shop/db-0')
    expect(nodeVerdict(node({ blockers: [{ reason: 'node', detail: 'x' }, { reason: 'pdb', pod: 'a/b', detail: 'y' }, { reason: 'local-storage', pod: 'a/b', detail: 'z' }] }), true).text)
      .toBe('kept by 3 blockers on a/b')
    expect(nodeVerdict(node({ requestedShare: 0.62, tenants: [{ namespace: 'billing', pods: 2, cpu: 2, memoryGiB: 4 }] }), true))
      .toEqual({ tone: 'neutral', text: 'still needed: 62% requested by billing' })
    expect(nodeVerdict(node({ requestedShare: 0.1 }), false).text).toBe('waiting for the autoscaler')
    expect(nodeVerdict(node({ requestedShare: 0.1 }), true)).toEqual({ tone: 'warning', text: 'not removed although only 10% is requested: does Cluster Autoscaler or Karpenter manage its pool?' })
  })
})
