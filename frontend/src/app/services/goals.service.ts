import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/enivornments';
import { Goals } from '../models/goals';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GoalsService {
  private baseURL = `${environment.baseURL}`;
  constructor(private http: HttpClient) {}

  getGoals() {
    return this.http.get<Goals[]>(`${this.baseURL}/goals`);
  }
  getGoal(id: number) {
    return this.http.get(`${this.baseURL}/goals/${id}`);
  }
  getGoalHistory(id: number) {
    return this.http.get(`${this.baseURL}/goalshistory/${id}`);
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
    return this.http.post(`${this.baseURL}/status`, p);
  }

  updateStatus(p: any) {
    return this.http.put(`${this.baseURL}/status/${p.id}`, p);
  }

  getD() {
    return this.http.get(`${this.baseURL}/d`);
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
  getB() {
    return this.http.get(`${this.baseURL}/b`);
  }
  getE() {
    return this.http.get(`${this.baseURL}/b`);
  }

  getAction() {
    return this.http.get(`${this.baseURL}/action`);
  }

  getGoalsMetrics(filters: {
    vp?: string;
    proj?: string;
    priority?: number;
    created_from?: string;
    created_to?: string;
  }) {
    const params = new HttpParams({ fromObject: filters });
    return this.http.get<any>(`${this.baseURL}/goals/metrics`, { params });
  }
  createB(b: any) {
    return this.http.post(`${this.baseURL}/b`, b);
  }

  updateB(b: any) {
    return this.http.put(`${this.baseURL}/b/${b.id}`, b);
  }
}
