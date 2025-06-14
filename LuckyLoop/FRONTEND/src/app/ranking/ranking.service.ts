import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  usuario: string;
  beneficio: number;
}

@Injectable({
  providedIn: 'root'
})
export class RankingService {
  private apiUrl = 'http://localhost:8000/api'; // URL base del API

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getRanking(): Observable<Usuario[]> {
    const headers = this.getAuthHeaders();
    return this.http.post<Usuario[]>(`${this.apiUrl}/getRanking`, {}, { headers });
  }
}