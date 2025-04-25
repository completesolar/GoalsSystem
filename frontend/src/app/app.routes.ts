import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { GoalsComponent } from './goals/goals.component';
import { PriorityComponent } from './master-components/priority/priority.component';
import { GoalsMetricsComponent } from './goals-metrics/goals-metrics.component';
import { BeginningWeekComponent } from './master-components/beginning-week/beginning-week.component';
import { StatusComponent } from './master-components/status/status.component';
import { EndWeekComponent } from './master-components/end-week/end-week.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'goals', component: GoalsComponent },
  { path: 'status', component: StatusComponent },
  { path: 'e_week', component: EndWeekComponent },
  { path: 'priority', component: PriorityComponent },
  { path: 'b_week', component: BeginningWeekComponent },
  { path: 'goals-metrics', component: GoalsMetricsComponent },
  { path: '**', redirectTo: '' },
];
