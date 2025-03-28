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
    return this.http.get(`${this.baseURL}/goalslist`);
  }
  getGoal(id: number) {
    return this.http.get(`${this.baseURL}/goalslist/${id}`);
  }
  createGoal(goal: any) {
    return this.http.post(`${this.baseURL}/goalslist`, goal);
  }
  updateGoal(goal: any) { 
    return this.http.put(`${this.baseURL}/goalslist/${goal.goalid}`, goal);
  }

  login() {
    return this.http.get(`${this.baseURL}/login`);
  }
}
