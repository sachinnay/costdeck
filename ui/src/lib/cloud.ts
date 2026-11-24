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

// Display names of the cloud providers CostDeck can scale.
export const cloudLabel = (provider?: string): string =>
  provider === 'azure' ? 'Azure' : provider === 'gcp' ? 'Google Cloud' : provider === 'aws' ? 'AWS' : provider || 'Cloud'

// targetLabel shows a cloud resource by name where one is known: Azure identifiers are
// long resource IDs.
export const targetLabel = (identifier: string, targets?: { identifier: string; name?: string }[]): string =>
  targets?.find(t => t.identifier === identifier)?.name || identifier.split('/').pop() || identifier
