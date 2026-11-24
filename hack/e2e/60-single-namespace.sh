# Copyright 2026 NetCracker Technology Corporation
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
# A schedule for a single namespace (ScalingConfig), managed through the API.

log "A single-namespace schedule scales its namespace and can be deleted"
new_namespace smoke-solo
deployment smoke-solo app 1
kubectl rollout status deploy/app -n smoke-solo --timeout=120s >/dev/null
track_config smoke-solo
expect_code 201 "schedule created through the API" POST /api/scaling/configs \
  "{\"metadata\":{\"name\":\"smoke-solo\"},\"spec\":{\"targetNamespace\":\"smoke-solo\",\"schedules\":$CLOSED_SCHEDULE_JSON}}" -b "$JAR"
wait_for "smoke-solo scaled to zero" replicas_are smoke-solo app 0
wait_for "the schedule ScaledDown" bash -c "[[ \$(kubectl get scalingconfig smoke-solo -n $NS -o jsonpath='{.status.phase}') == ScaledDown ]]"
api POST /api/scaling/configs/smoke-solo/manual '{"active":true,"until":"1h"}' >/dev/null || fail "manual override"
wait_for "Start now brings it back" replicas_are smoke-solo app 1
expect_code 204 "deleting the schedule" DELETE /api/scaling/configs/smoke-solo "" -b "$JAR"
wait_for "the schedule is gone" missing scalingconfig smoke-solo -n "$NS"
holds_for 6 "the namespace keeps its current size" replicas_are smoke-solo app 1
