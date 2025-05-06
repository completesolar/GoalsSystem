import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/enivornments';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private baseURL = `${environment.baseURL}`;

  constructor(public http: HttpClient) {}

  // /api/role

  getRole() {
    return this.http.get(`${this.baseURL}/role`);
  }

  createRole(item: any) {
    return this.http
      .post(`${this.baseURL}/role`, item)
      .pipe(catchError(this.handleError));
  }

  updateRole(item: any) {
    return this.http.put(`${this.baseURL}/role/${item.id}`, item);
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => new Error(error.message || 'Server error'));
  }
}
