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

package v1

import "slices"

// OptOutLabel set to "off" on a namespace keeps every namespaceSelector from selecting it.
const OptOutLabel = "costdeck.io/schedule"

// Members returns the namespaces the group scales: those spec.namespaces lists and those
// spec.namespaceSelector matched at the last reconcile, sorted and without duplicates.
func (g *ScalingGroup) Members() []string {
	out := make([]string, 0, len(g.Spec.Namespaces)+len(g.Status.SelectedNamespaces))
	out = append(out, g.Spec.Namespaces...)
	if g.Spec.NamespaceSelector != nil {
		out = append(out, g.Status.SelectedNamespaces...)
	}
	slices.Sort(out)
	return slices.Compact(out)
}
