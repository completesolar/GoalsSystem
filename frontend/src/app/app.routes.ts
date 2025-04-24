import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { GoalsComponent } from './goals/goals.component';
import { PriorityComponent } from './priority/priority.component';
import { GoalsMetricsComponent } from './goals-metrics/goals-metrics.component';
import { StatusComponent } from './status/status.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'goals', component: GoalsComponent },
  { path: 'status', component: StatusComponent },
  { path: 'priority', component: PriorityComponent },
  { path: 'goals-metrics', component: GoalsMetricsComponent },
  { path: '**', redirectTo: '' },
];
