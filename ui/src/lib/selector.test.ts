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

import { describe, expect, it } from 'vitest'
import { formatSelector, groupNamespaces } from './selector'
import type { ScalingGroup } from './types'

describe('formatSelector', () => {
  it('writes kubectl syntax, labels first and sorted', () => {
    expect(formatSelector({
      matchLabels: { team: 'shop', env: 'preview' },
      matchExpressions: [
        { key: 'tier', operator: 'In', values: ['a', 'b'] },
        { key: 'zone', operator: 'NotIn', values: ['x'] },
        { key: 'owner', operator: 'Exists' },
        { key: 'legacy', operator: 'DoesNotExist' },
      ],
    })).toBe('env=preview,team=shop,tier in (a,b),zone notin (x),owner,!legacy')
  })
  it('is empty without a selector', () => expect(formatSelector(undefined)).toBe(''))
})

describe('groupNamespaces', () => {
  const g = (spec: Partial<ScalingGroup['spec']>, selected?: string[]) =>
    ({ metadata: { name: 'g' }, spec: { category: 'x', ...spec }, status: { selectedNamespaces: selected } }) as ScalingGroup
  it('joins listed and selected namespaces, sorted, without duplicates', () => {
    expect(groupNamespaces(g({ namespaces: ['b', 'a'], namespaceSelector: { matchLabels: { env: 'p' } } }, ['c', 'a']))).toEqual(['a', 'b', 'c'])
  })
  it('ignores a stale selection once the selector is gone, and a missing list', () => {
    expect(groupNamespaces(g({ namespaces: ['a'] }, ['c']))).toEqual(['a'])
    expect(groupNamespaces(g({}))).toEqual([])
  })
})
