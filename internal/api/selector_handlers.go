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
	"net/http"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"github.com/migalsp/costdeck-operator/internal/config"
	"github.com/migalsp/costdeck-operator/internal/scaling"
)

// handleSelectNamespaces previews a namespace selector: GET /api/namespace-selector?selector=
// takes kubectl's syntax ("env=dev,team in (a,b),!legacy") and answers with the selector as
// a schedule stores it and the namespaces it matches now, so the dashboard needs no parser.
func (s *Server) handleSelectNamespaces(w http.ResponseWriter, r *http.Request) {
	text := r.URL.Query().Get("selector")
	if text == "" {
		writeError(w, http.StatusBadRequest, "selector is required, for example env=dev")
		return
	}
	selector, err := metav1.ParseToLabelSelector(text)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	var namespaces corev1.NamespaceList
	if err := s.Client.List(r.Context(), &namespaces); err != nil {
		writeK8sError(w, err)
		return
	}
	matched, err := scaling.SelectNamespaces(selector, namespaces.Items, config.OperatorNamespace())
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if matched == nil {
		matched = []string{}
	}
	writeJSON(w, http.StatusOK, map[string]any{"selector": selector, "namespaces": matched})
}
