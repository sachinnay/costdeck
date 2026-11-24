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

// Package metrics provides CPU and memory usage for namespaces and pods from either the
// Kubernetes Metrics API (metrics-server) or a PromQL backend such as VictoriaMetrics.
package metrics

import (
	"context"
	"errors"

	"k8s.io/apimachinery/pkg/api/resource"
)

// ErrUnsupported is returned by a Source that cannot answer a query, for example
// metrics-server, which keeps no history.
var ErrUnsupported = errors.New("not supported by this metrics source")

// Usage is the CPU and memory consumption of a namespace or a pod.
type Usage struct {
	CPU    resource.Quantity
	Memory resource.Quantity
}

// Source reports resource usage.
type Source interface {
	// Name identifies the source in status conditions and the UI.
	Name() string
	// NamespaceUsage returns the current total usage of all containers in a namespace.
	NamespaceUsage(ctx context.Context, namespace string) (Usage, error)
	// PodUsage returns the current usage of every pod in a namespace, keyed by pod name.
	PodUsage(ctx context.Context, namespace string) (map[string]Usage, error)
}

// Source names used in conditions and API responses.
const (
	SourceMetricsServer   = "metrics-server"
	SourceVictoriaMetrics = "victoriametrics"
)
