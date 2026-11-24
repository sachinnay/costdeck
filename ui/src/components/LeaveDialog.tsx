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

import { leavePage, stayOnPage, usePendingLeave } from '../lib/router'
import { Button, Modal } from './ui'

// LeaveDialog asks before a page with unsaved input is left (see useLeaveGuard). Staying
// is the default: it has the focus, and Escape or the close button choose it too.
export default function LeaveDialog() {
  const unsaved = usePendingLeave()
  if (!unsaved) return null
  return (
    <Modal title="Leave without saving?" size="sm" onClose={stayOnPage} dismissOnBackdrop={false}
      footer={<>
        <Button onClick={stayOnPage} autoFocus>Stay</Button>
        <Button variant="danger" onClick={leavePage}>Leave without saving</Button>
      </>}>
      <p className="text-sm text-slate-600">The changes in {unsaved} are not saved yet and will be lost.</p>
    </Modal>
  )
}
