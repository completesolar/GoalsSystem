import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { GoalsComponent } from './goals/goals.component';
import { PriorityComponent } from './master-components/priority/priority.component';
import { GoalsMetricsComponent } from './goals-metrics/goals-metrics.component';
import { BeginningWeekComponent } from './master-components/beginning-week/beginning-week.component';
import { StatusComponent } from './master-components/status/status.component';
import { EndWeekComponent } from './master-components/end-week/end-week.component';
import { DelinquentComponent } from './master-components/delinquent/delinquent.component';
import { ProjectsComponent } from './master-components/projects/projects.component';
import { RolesAddEditComponent } from './roles/roles-add-edit/roles-add-edit.component';
import { ManageRolesComponent } from './roles/manage-roles/manage-roles.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'goals', component: GoalsComponent },
  { path: 'status', component: StatusComponent },
  { path: 'e_week', component: EndWeekComponent },
  { path: 'delinquent', component: DelinquentComponent },
  { path: 'project', component: ProjectsComponent },
  { path: 'priority', component: PriorityComponent },
  { path: 'b_week', component: BeginningWeekComponent },
  { path: 'goals-metrics', component: GoalsMetricsComponent },
  { path: 'roles', component: RolesAddEditComponent },
  { path: 'manage-roles', component: ManageRolesComponent },
  { path: '**', redirectTo: '' },
];
