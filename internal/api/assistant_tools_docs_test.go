// Copyright 2026 NetCracker Technology Corporation
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package api

import (
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

func TestTheUserGuideListsEveryAssistantTool(t *testing.T) {
	content, err := os.ReadFile(filepath.Join("..", "..", "ui", "src", "pages", "docs", "content.ts"))
	if err != nil {
		t.Fatal(err)
	}
	guide := string(content)
	start := strings.Index(guide, "id: 'mcp'")
	if start < 0 {
		t.Fatal("the MCP guide is missing from the user guide")
	}
	table := guide[start:]
	toolsTopic := strings.Index(table, "id: 'tools'")
	if toolsTopic < 0 {
		t.Fatal("the MCP guide has no tools topic")
	}
	table = table[toolsTopic:]
	if end := strings.Index(table, "warn:"); end > 0 {
		table = table[:end]
	}
	for _, tool := range buildMockServerWithK8s().toolRegistry() {
		if !regexp.MustCompile(`(^|[^a-z_])` + regexp.QuoteMeta(tool.Name) + `([^a-z_]|$)`).MatchString(table) {
			t.Errorf("the MCP tools table in ui/src/pages/docs/content.ts does not list %s", tool.Name)
		}
	}
}
