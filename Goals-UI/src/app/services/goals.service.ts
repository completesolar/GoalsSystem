import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoalsService {
  private baseURL =  `${environment.baseURL}`;
  constructor( private http: HttpClient) { }
  
  getGoals() {
    return this.http.get(`${this.baseURL}/goals`);
  }
  getGoal(id: number) {
    return this.http.get(`${this.baseURL}/goals/${id}`);
  }
  createGoal(goal: any) {
    return this.http.post(`${this.baseURL}/goals`, goal);
  }
  updateGoal(goal: any) { 
    return this.http.put(`${this.baseURL}/goals/${goal.goalid}`, goal);
  }
}
