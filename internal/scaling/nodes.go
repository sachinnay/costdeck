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

package scaling

import (
	"context"
	"sort"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

// WorkloadNodes lists, sorted, the nodes running pods of the workloads a schedule scales
// in a namespace: the nodes scaling it down could free.
func (e *Engine) WorkloadNodes(ctx context.Context, ns string, exclusions []string) ([]string, error) {
	objs, err := e.listScalableResources(ctx, ns, exclusions)
	if err != nil {
		return nil, err
	}
	seen := map[string]bool{}
	for _, obj := range objs {
		st, ok := stateOf(obj)
		if !ok || st.selector == nil {
			continue
		}
		sel, err := metav1.LabelSelectorAsSelector(st.selector)
		if err != nil || sel.Empty() {
			continue
		}
		var pods corev1.PodList
		if err := e.Client.List(ctx, &pods, client.InNamespace(ns), client.MatchingLabelsSelector{Selector: sel}); err != nil {
			return nil, err
		}
		for _, p := range pods.Items {
			if p.Spec.NodeName != "" && p.Status.Phase != corev1.PodSucceeded && p.Status.Phase != corev1.PodFailed {
				seen[p.Spec.NodeName] = true
			}
		}
	}
	out := make([]string, 0, len(seen))
	for n := range seen {
		out = append(out, n)
	}
	sort.Strings(out)
	return out, nil
}
