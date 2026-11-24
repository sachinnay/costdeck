# Copyright 2024-2025 NetCracker Technology Corporation
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# shellcheck shell=bash
# The MCP endpoint (Streamable HTTP, stateless) serves the assistant's tools to API tokens,
# and only the read-only ones to a viewer.

if [[ -z "$DISPOSABLE" ]]; then
  echo "skip: it changes the MCP settings of the installed release"
  return 0
fi

log "MCP lists read-only tools to a viewer token"
MCP_TOKEN=$(api POST /api/tokens '{"name":"smoke-mcp","role":"viewer","expiresInDays":1}' | jq -r .token)
track_call DELETE /api/tokens/smoke-mcp
mcp() {
  curl -s -X POST "localhost:$API_PORT/mcp" -H "Authorization: Bearer $MCP_TOKEN" \
    -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' -d "$1"
}
[[ "$(api_code POST /mcp '{}' -H "Authorization: Bearer $MCP_TOKEN")" == 404 ]] || fail "MCP should be off until enabled"
ok "off until enabled"
track_call PUT /api/settings '{"integrations":{"mcp":{"enabled":false}}}'
api PUT /api/settings '{"integrations":{"mcp":{"enabled":true}}}' >/dev/null || fail "enabling MCP"
mcp '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"e2e","version":"1"}}}' \
  | grep -q '"serverInfo"' || fail "MCP initialize"
TOOLS=$(mcp '{"jsonrpc":"2.0","id":2,"method":"tools/list"}')
grep -q '"list_scaling_groups"' <<<"$TOOLS" || fail "tools/list lacks list_scaling_groups: $TOOLS"
! grep -q '"scale_group"' <<<"$TOOLS" || fail "a viewer token was offered the mutating scale_group tool"
ok "read-only tools listed, mutating ones withheld"
api PUT /api/settings '{"integrations":{"mcp":{"enabled":false}}}' >/dev/null
