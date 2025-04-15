import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/enivornments';
import { Goals } from '../models/goals';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class GoalsService {
  private baseURL = `${environment.baseURL}`;
  constructor(private http: HttpClient) { }

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
getD() {
  return this.http.get(`${this.baseURL}/d`);
}
getP() {
  return this.http.get(`${this.baseURL}/p`);
}
getVpOptions(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseURL}/who`).pipe(
    map(data => {
      const vpMap = new Map<string, { initials: string; employee_name: string }>();

      data.forEach(row => {
        const supervisorName = row.supervisor_name;

        if (supervisorName && !vpMap.has(supervisorName)) {
          const supervisor = data.find(who => who.employee_name === supervisorName);
          
          if (supervisor && supervisor.initials && supervisor.employee_name) {
            vpMap.set(supervisorName, {
              initials: supervisor.initials,
              employee_name: supervisor.employee_name
            });
          }
        }
      });

      const vpOptions = Array.from(vpMap.values()).map(item => ({
        label: `${item.initials} (${item.employee_name})`,
        value: item.initials
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

}
