import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { GoalsComponent } from './goals/goals.component';
import { PriorityComponent } from './priority/priority.component';
import { GoalsMetricsComponent } from './goals-metrics/goals-metrics.component';
import { BeginningWeekComponent } from './beginning-week/beginning-week.component';

export const routes: Routes = [
  { path: '', component: LoginComponent }, 
  { path: 'goals', component: GoalsComponent }, 
  { path: 'priority', component: PriorityComponent }, 
  { path: 'b_week', component: BeginningWeekComponent }, 
  { path: 'goals-metrics', component: GoalsMetricsComponent },
  { path: '**', redirectTo: '' } 
];
