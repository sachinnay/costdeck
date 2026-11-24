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

package controller

import (
	"reflect"
	"testing"

	finopsv1 "github.com/migalsp/costdeck-operator/api/v1"
)

func TestScalingStagesTakeOnlyMembersAndCloudTargetsFromTheSequence(t *testing.T) {
	group := &finopsv1.ScalingGroup{Spec: finopsv1.ScalingGroupSpec{
		Namespaces: []string{"db", "api", "web"},
		Sequence:   []string{"db kube-system", "ext:orders-db", "stranger", "api"},
	}}
	r := &ScalingGroupReconciler{}
	for _, tt := range []struct {
		name string
		skip []string
		want [][]string
	}{
		{"names outside the group are ignored, members left out are started last", nil, [][]string{{"db"}, {"ext:orders-db"}, {"api"}, {"web"}}},
		{"a namespace an older group owns is never scaled", []string{"api"}, [][]string{{"db"}, {"ext:orders-db"}, {"web"}}},
	} {
		t.Run(tt.name, func(t *testing.T) {
			if got := r.getScalingStages(group, true, tt.skip); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("stages = %v, want %v", got, tt.want)
			}
		})
	}
}
