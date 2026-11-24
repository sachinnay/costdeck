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
import shared from '../../../internal/scaling/testdata/hibernate.json'
import type { HibernateRule } from './types'
import { describeRule, hibernateIssue, parseNames, ruleIssue } from './hibernate'

describe('ruleIssue matches the operator (internal/scaling/testdata/hibernate.json)', () => {
  for (const c of shared.cases) {
    it(c.name, () => {
      expect(ruleIssue(c.rule as HibernateRule) === null).toBe(c.valid)
    })
  }
})

describe('hibernate rules', () => {
  it('reads names and globs separated by commas or spaces', () => {
    expect(parseNames(' pg-*, analytics  db ')).toEqual(['pg-*', 'analytics', 'db'])
    expect(parseNames(' , ')).toBeUndefined()
  })

  // The same cases as TestValidateHibernate in internal/scaling.
  it('flags what the operator refuses', () => {
    expect(ruleIssue({ preset: 'cnpg' })).toBeNull()
    expect(ruleIssue({ preset: 'zalando-postgres', names: ['pg-*', 'a[bc]'] })).toBeNull()
    expect(ruleIssue({ apiVersion: 'redis.example.com/v1', kind: 'Redis', replicasField: 'spec.size', readyField: 'status.readyNodes' })).toBeNull()
    const bad: [string, Parameters<typeof ruleIssue>[0], string][] = [
      ['a preset with fields', { preset: 'cnpg', replicasField: 'spec.instances' }, 'a preset takes no'],
      ['no kind', { apiVersion: 'redis.example.com/v1', replicasField: 'spec.size' }, 'set the apiVersion'],
      ['a core kind', { apiVersion: 'v1', kind: 'Pod', replicasField: 'spec.replicas' }, 'must be group/version'],
      ['not a group version', { apiVersion: 'a/b/c', kind: 'X', replicasField: 'spec.replicas' }, 'must be group/version'],
      ['a field in metadata', { apiVersion: 'x.io/v1', kind: 'X', replicasField: 'metadata.generation' }, 'dotted paths'],
      ['a field with no dot', { apiVersion: 'x.io/v1', kind: 'X', replicasField: 'replicas' }, 'dotted paths'],
      ['an empty segment', { apiVersion: 'x.io/v1', kind: 'X', replicasField: 'spec..replicas' }, 'dotted paths'],
      ['a bad ready field', { apiVersion: 'x.io/v1', kind: 'X', replicasField: 'spec.replicas', readyField: 'ready' }, 'dotted paths'],
      ['a broken glob', { preset: 'cnpg', names: ['pg-['] }, 'pg-[ is not a name or glob'],
      ['a trailing backslash', { preset: 'cnpg', names: ['pg\\'] }, 'is not a name or glob'],
    ]
    for (const [name, rule, says] of bad) expect(ruleIssue(rule), name).toContain(says)
  })

  it('numbers the first bad rule', () => {
    expect(hibernateIssue([{ preset: 'cnpg' }, { preset: 'strimzi', kind: 'X' }])).toBe('rule 2: a preset takes no apiVersion, kind or fields')
    expect(hibernateIssue([])).toBeNull()
  })

  it('describes a rule', () => {
    expect(describeRule({ preset: 'cnpg' })).toBe('CloudNativePG')
    expect(describeRule({ preset: 'strimzi', names: ['connect-*'] })).toBe('Strimzi named connect-*')
    expect(describeRule({ apiVersion: 'redis.example.com/v1', kind: 'Redis', replicasField: 'spec.size' })).toBe('Redis (redis.example.com/v1)')
  })
})
