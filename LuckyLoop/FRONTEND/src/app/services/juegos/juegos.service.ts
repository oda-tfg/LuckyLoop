import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Juego {
  id: number;
  name: string;
  image: string;
  category: string;
  isHot: boolean;
  url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class JuegosService {
  private apiUrl = 'https://localhost:8000/api'; // URL base, sin /api añadido aquí

  constructor(private http: HttpClient) { }


  getAllJuegos(): Observable<Juego[]> {
    // Para pruebas sin autenticación
    return this.http.get<any>(`${this.apiUrl}/getJuegos`)
      .pipe(
        map(response => {
          if (response && response.status === 'success' && response.data) {
            return response.data;
          }
          return [];
        })
      );
  }
}