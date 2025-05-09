import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface CategoriaResponse {
  status: string;
  categorias: string[];
}

@Injectable({
  providedIn: 'root'
})
export class NavService {

  private apiUrl = 'http://localhost:8000/api/getCategorias';

  constructor(private http: HttpClient) { }

  getCategorias(): Observable<string[]> {
    return this.http.get<CategoriaResponse>(this.apiUrl)
      .pipe(
        map(response => response.categorias)
      );
  }
}