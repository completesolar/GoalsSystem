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
    return this.http.get<any[]>(`${this.baseURL}/who`).pipe(
      map(data =>
        data
          .filter(item => item.decoder && item.first_name && item.last_name)
          .map(item => ({
            label: `${item.decoder} (${item.last_name}, ${item.first_name} )`,
            value: item.decoder
          }))
      )
    );
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
getVP() {
  return this.http.get(`${this.baseURL}/vp`);
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
