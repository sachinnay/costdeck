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
	"context"
	"slices"
	"sort"

	"github.com/migalsp/costdeck-operator/internal/finops"
)

// toolGPUUsage is the GPU part of the cost overview for the assistant and MCP: what the
// GPUs cost, which namespaces hold them and how busy they are, and the GPU advice.
func (s *Server) toolGPUUsage(ctx context.Context) (string, error) {
	o, err := s.finopsOverview(ctx)
	if err != nil {
		return "", err
	}
	rows := []map[string]any{}
	namespaces := slices.Clone(o.Namespaces)
	sort.Slice(namespaces, func(i, j int) bool { return gpuCost(namespaces[i]) > gpuCost(namespaces[j]) })
	for _, n := range namespaces {
		if n.GPU == nil {
			continue
		}
		row := map[string]any{"namespace": n.Name, "environment": n.Environment, "gpus": round2(n.GPU.Requested),
			"models": n.GPU.Models, "monthlyGpuCost": round2(n.GPU.MonthlyCost)}
		if n.GPU.Utilization != nil {
			row["utilizationLastDay"] = round2(*n.GPU.Utilization)
		}
		if n.GPU.MemoryUsedGiB != nil {
			row["peakMemoryGiBLastWeek"] = round2(*n.GPU.MemoryUsedGiB)
		}
		if n.Schedule != nil {
			row["schedule"] = n.Schedule.Name
		}
		rows = append(rows, row)
	}
	advice := []finops.Opportunity{}
	for _, op := range o.Opportunities {
		if op.Kind == finops.OpportunityIdleGPU || op.Kind == finops.OpportunityShareGPU || op.Kind == finops.OpportunityGPUModel {
			advice = append(advice, op)
		}
	}
	note := ""
	if len(rows) > 0 && rows[0]["utilizationLastDay"] == nil {
		note = "No GPU utilization: connect VictoriaMetrics with NVIDIA's DCGM exporter in Kubernetes mode to see idle GPUs."
	}
	return toJSON(map[string]any{
		"currency": o.Currency, "gpus": round2(o.Cluster.GPUs), "gpusRequested": round2(o.Cluster.GPURequested),
		"monthlyGpuCost": round2(o.Monthly.GPU), "monthlyIdleGpu": round2(o.Monthly.IdleGPU), "averageGpuHour": round2(o.Rates.GPUHour),
		"namespaces": rows, "advice": advice, "note": note,
	})
}

func gpuCost(n finops.NamespaceRow) float64 {
	if n.GPU == nil {
		return 0
	}
	return n.GPU.MonthlyCost
}
