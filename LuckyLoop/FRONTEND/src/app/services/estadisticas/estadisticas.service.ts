import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EstadisticasResponse {
  total_partidas: number;
  partidas_ganadas: number;
  partidas_perdidas: number;
  partidas_empatadas: number;
  beneficio_total: number;
  retirado: number;
  depositado: number;
  juegos: Juego[];
}

export interface Juego {
  id: number;
  nombre: string;
}

export interface EstadisticasJuegoResponse {
  juego_id: number;
  total_partidas: number;
  partidas_ganadas: number;
  partidas_perdidas: number;
  partidas_empatadas: number;
  beneficio_total: number;
}

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getEstadisticas(): Observable<EstadisticasResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<EstadisticasResponse>(`${this.apiUrl}/getEstadisticas`, {}, { headers });
  }

  getEstadisticasJuego(juegoId: number): Observable<EstadisticasJuegoResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<EstadisticasJuegoResponse>(`${this.apiUrl}/getEstadisticas/juego/${juegoId}`, {}, { headers });
  }
}