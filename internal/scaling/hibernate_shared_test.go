// Copyright 2024-2025 NetCracker Technology Corporation
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

package scaling

import (
	"encoding/json"
	"os"
	"testing"

	finopsv1 "github.com/migalsp/costdeck-operator/api/v1"
)

func TestSharedHibernateRuleCases(t *testing.T) {
	raw, err := os.ReadFile("testdata/hibernate.json")
	if err != nil {
		t.Fatal(err)
	}
	var shared struct {
		Cases []struct {
			Name  string                 `json:"name"`
			Rule  finopsv1.HibernateRule `json:"rule"`
			Valid bool                   `json:"valid"`
		} `json:"cases"`
	}
	if err := json.Unmarshal(raw, &shared); err != nil {
		t.Fatal(err)
	}
	for _, c := range shared.Cases {
		err := ValidateHibernate([]finopsv1.HibernateRule{c.Rule})
		if (err == nil) != c.Valid {
			t.Errorf("%s: ValidateHibernate = %v, want valid %v", c.Name, err, c.Valid)
		}
	}
}
