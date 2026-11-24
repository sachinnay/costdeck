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

package api

import (
	"testing"

	corev1 "k8s.io/api/core/v1"
)

func TestPodHealthExplainsUnhealthyPods(t *testing.T) {
	waiting := func(reason string) corev1.ContainerState {
		return corev1.ContainerState{Waiting: &corev1.ContainerStateWaiting{Reason: reason}}
	}
	tests := []struct {
		name   string
		pod    corev1.Pod
		ready  bool
		reason string
	}{
		{"healthy", corev1.Pod{Status: corev1.PodStatus{Phase: corev1.PodRunning,
			ContainerStatuses: []corev1.ContainerStatus{{Ready: true}}}}, true, ""},
		{"crash loop while phase says Running", corev1.Pod{Status: corev1.PodStatus{Phase: corev1.PodRunning,
			ContainerStatuses: []corev1.ContainerStatus{{State: waiting("CrashLoopBackOff"), RestartCount: 7}}}}, false, "CrashLoopBackOff"},
		{"image pull", corev1.Pod{Status: corev1.PodStatus{Phase: corev1.PodPending,
			ContainerStatuses: []corev1.ContainerStatus{{State: waiting("ImagePullBackOff")}}}}, false, "ImagePullBackOff"},
		{"still creating is not a problem", corev1.Pod{Status: corev1.PodStatus{Phase: corev1.PodPending,
			ContainerStatuses: []corev1.ContainerStatus{{State: waiting("ContainerCreating")}}}}, false, ""},
		{"unschedulable", corev1.Pod{Status: corev1.PodStatus{Phase: corev1.PodPending,
			Conditions: []corev1.PodCondition{{Type: corev1.PodScheduled, Status: corev1.ConditionFalse, Reason: "Unschedulable"}}}}, false, "Unschedulable"},
		{"previously OOM killed", corev1.Pod{Status: corev1.PodStatus{Phase: corev1.PodRunning,
			ContainerStatuses: []corev1.ContainerStatus{{Ready: true, RestartCount: 2,
				LastTerminationState: corev1.ContainerState{Terminated: &corev1.ContainerStateTerminated{Reason: "OOMKilled"}}}}}}, true, "OOMKilled"},
	}
	for _, tt := range tests {
		ready, reason, _ := podHealth(&tt.pod)
		if ready != tt.ready || reason != tt.reason {
			t.Errorf("%s: podHealth() = %v, %q; want %v, %q", tt.name, ready, reason, tt.ready, tt.reason)
		}
	}
}
