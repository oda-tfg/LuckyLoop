import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EstadisticasData {
  dineroUsuario: Array<{ usuario: string; beneficio: number }>;
  apostadoFechas: { [key: string]: number };
  beneficioFechas: { [key: string]: number };
  numPersonasNegativoPositivo: { positivo: number; negativo: number };
}

@Injectable({
  providedIn: 'root'
})
export class ManagerService {
  private apiUrl = 'http://localhost:8000/api/manager';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getEstadisticas(): Observable<EstadisticasData> {
    const headers = this.getAuthHeaders();
    return this.http.get<EstadisticasData>(`${this.apiUrl}/getEstadisticas`, { headers });
  }
}