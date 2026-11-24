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

package finops

import (
	"testing"
	"time"
)

func TestSummaryOf(t *testing.T) {
	at := time.Date(2026, 10, 22, 9, 0, 0, 0, time.UTC)
	o := Overview{
		GeneratedAt: at, Currency: "EUR",
		Cluster:     Cluster{Nodes: 4, ProvisionedHourly: 99},
		Namespaces:  []NamespaceRow{{Name: "shop"}, {Name: "dev"}, {Name: "ops"}},
		Monthly:     Monthly{Provisioned: 900, Total: 1000, Requested: 600, Used: 300, Unallocated: 300},
		Savings:     Savings{SchedulesMonthly: 120, RightsizingMonthly: 50, ScheduleCandidatesMonthly: 25, RightsizingPending: 2},
		MonthToDate: MonthToDate{Cost: 700, Forecast: 1010},
	}
	want := ClusterSummary{
		Name: "prod-eu", GeneratedAt: at, Currency: "EUR", Nodes: 4, Namespaces: 3,
		MonthlyCost: 1000, MonthlyRequested: 600, MonthlyUsed: 300, MonthlyUnallocated: 300,
		SchedulesSaving: 120, SavingsAvailable: 75, MonthToDate: 700, Forecast: 1010,
	}
	if got := SummaryOf("prod-eu", o); got != want {
		t.Errorf("SummaryOf =\n%+v\nwant\n%+v\n(the whole bill as cost, right-sizing plus schedule candidates as available savings, no schedule counts)", got, want)
	}
}
