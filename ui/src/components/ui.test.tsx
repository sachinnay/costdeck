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
import { render, screen } from '@testing-library/react'
import { Badge } from './ui'

describe('Badge', () => {
  it('stays on one line next to a long title', () => {
    render(<Badge tone="success">On track</Badge>)
    // A budget whose subtitle ran long squeezed its "On track" badge onto two lines.
    const badge = screen.getByText('On track')
    expect(badge.className).toMatch(/\bwhitespace-nowrap\b/)
    expect(badge.className).toMatch(/\bshrink-0\b/)
  })
})
