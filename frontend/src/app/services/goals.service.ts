import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { environment } from '../../environments/enivornments';
import { Goals } from '../models/goals';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GoalsService {
  private baseURL = `${environment.baseURL}`;
  public userData:any;

  private accessChangedSource = new BehaviorSubject<boolean>(false);
  accessChanged$ = this.accessChangedSource.asObservable();
  notifyAccessChanged() {
    this.accessChangedSource.next(true);
  }

  constructor(private http: HttpClient) {}

  getGoals() {
    return this.http.get<Goals[]>(`${this.baseURL}/goals`);
  }
  getGoal(id: number) {
    return this.http.get(`${this.baseURL}/goals/${id}`);
  }
  getGoalHistory(id: number) {
    return this.http.get<any[]>(`${this.baseURL}/goalshistory/${id}`);
  }
  createGoal(goal: any) {
    return this.http.post(`${this.baseURL}/goals`, goal);
  }
  updateGoal(goal: any) {
    return this.http.put(`${this.baseURL}/goals/${goal.goalid}`, goal);
  }

  login() {
    return this.http.get(`${this.baseURL}/login`);
  }
  getWhoOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseURL}/who`);
  }

  getStatus() {
    return this.http.get(`${this.baseURL}/status`);
  }

  createStatus(p: any) {
    return this.http
      .post(`${this.baseURL}/status`, p)
      .pipe(catchError(this.handleError));
  }

  updateStatus(p: any) {
    return this.http.put(`${this.baseURL}/status/${p.id}`, p);
  }

  getD() {
    return this.http.get(`${this.baseURL}/d`);
  }

  updateD(d: any) {
    return this.http.put(`${this.baseURL}/d/${d.id}`, d);
  }

  createD(d: any) {
    return this.http.post(`${this.baseURL}/d`, d);
  }
  getP() {
    return this.http.get(`${this.baseURL}/p`);
  }
  createP(p: any) {
    return this.http.post(`${this.baseURL}/p`, p);
  }

  updateP(p: any) {
    return this.http.put(`${this.baseURL}/p/${p.id}`, p);
  }

  getVpOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseURL}/who`).pipe(
      map((data) => {
        const vpMap = new Map<
          string,
          { initials: string; employee_name: string }
        >();

        data.forEach((row) => {
          const supervisorName = row.supervisor_name;

          if (supervisorName && !vpMap.has(supervisorName)) {
            const supervisor = data.find(
              (who) => who.employee_name === supervisorName
            );

            if (supervisor && supervisor.initials && supervisor.employee_name) {
              vpMap.set(supervisorName, {
                initials: supervisor.initials,
                employee_name: supervisor.employee_name,
              });
            }
          }
        });

        const vpOptions = Array.from(vpMap.values()).map((item) => ({
          label: `${item.initials} (${item.employee_name})`,
          value: item.initials,
        }));

        return vpOptions.sort((a, b) => a.label.localeCompare(b.label));
      })
    );
  }

  getProj() {
    return this.http.get(`${this.baseURL}/proj`);
  }
  updateProj(Proj: any) {
    return this.http.put(`${this.baseURL}/proj/${Proj.id}`, Proj);
  }

  createProj(Proj: any) {
    return this.http.post(`${this.baseURL}/proj`, Proj);
  }
  getB() {
    return this.http.get(`${this.baseURL}/b`);
  }
  getE() {
    return this.http.get(`${this.baseURL}/e`);
  }

  updateE(e: any) {
    return this.http.put(`${this.baseURL}/e/${e.id}`, e);
  }

  createE(e: any) {
    return this.http.post(`${this.baseURL}/e`, e);
  }

  getAction() {
    return this.http.get(`${this.baseURL}/action`);
  }

  // getGoalsMetrics() {
  //   return this.http.get<any>(`${this.baseURL}/goals/metrics`);
  // }
  
getGoalsMetrics(selectedVPs?: string[], selectedProject?: string, userInitials?: string,selectedWhos?: string[],selectedStatus?:string[]): Observable<any> {
  let params = new HttpParams();

  if (selectedVPs?.length) {
    selectedVPs.forEach(vp => {
      params = params.append('vps', vp);
    });
  }
  
  if (selectedProject) {
    params = params.set('project', selectedProject);
  }
  
  if (userInitials) {
    params = params.set('userInitials', userInitials);
  }
  
  if (selectedWhos?.length) {
    selectedWhos.forEach(who => {
      params = params.append('whos', who);
    });
  }
  
  if (selectedStatus?.length) {
    selectedStatus.forEach(status => {
      params = params.append('status', status);
    });
  }
  
  return this.http.get<any>(`${this.baseURL}/goals/metrics`, { params });
    }
  
getGoalsMetricsForWho(selectedProject?: string, userInitials?: string,selectedWhos?: string[],selectedStatus?:string[]): Observable<any> {
  let params = new HttpParams();
  if (selectedProject) {
    params = params.set('project', selectedProject);
  }  
  if (userInitials) {
    params = params.set('userInitials', userInitials);
  }  
  if (selectedWhos?.length) {
    selectedWhos.forEach(who => {
      params = params.append('whos', who);
    });
  }  
  if (selectedStatus?.length) {
    selectedStatus.forEach(status => {
      params = params.append('status', status);
    });
  }  
  return this.http.get<any>(`${this.baseURL}/goals/metrics_who`, { params });
 }
  
  createB(b: any) {
    return this.http.post(`${this.baseURL}/b`, b);
  }

  updateB(b: any) {
    return this.http.put(`${this.baseURL}/b/${b.id}`, b);
  }
  
  loginCheck(email: string) {
    const lowerCaseEmail = email.toLowerCase();
    return this.http.get(`${this.baseURL}/loginCheck/${encodeURIComponent(lowerCaseEmail)}`);
  }
  

  private handleError(error: HttpErrorResponse) {
    return throwError(() => new Error(error.message || 'Server error'));
  }

  getWhoAndVpByEmail(email: string) {
    return this.http.get<{ who: string; vp: string }>(
      `${this.baseURL}/who-initials/${encodeURIComponent(email)}`
    );
  } 
getUserInitials(email: string) {
  return this.http.get<{ who: string }>(`${this.baseURL}/who-initials/${encodeURIComponent(email)}`);
}

getSupervisorHierarchy(initials: string) {
  return this.http.get<{ supervisor_names: string[] }>(`${this.baseURL}/supervisor-chain/${encodeURIComponent(initials)}`);
}
getDirectReports(initials: string) {
  return this.http.get<{ direct_reports: string[] }>(`${this.baseURL}/direct-reports/${encodeURIComponent(initials)}`);
}
updateGlobalCloneSetting(value: boolean, updatedBy: string) {
  return this.http.post<{ message: string }>(`${this.baseURL}/global-settings/update`, {
    value,
    updated_by: updatedBy
  });
}
getGlobalCloneSetting() {
  return this.http.get<boolean>(`${this.baseURL}/global-settings/enable_clone`);
}

}