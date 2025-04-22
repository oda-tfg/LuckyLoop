import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class CambiarNombreService {
    private apiUrl = 'http://localhost:8000/api';

    constructor(private http: HttpClient) { }

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('auth_token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    cambiarNombre(nuevoNombre: string): Observable<any> {
        const headers = this.getAuthHeaders();
        return this.http.post(
            `${this.apiUrl}/usuario/cambiarNombre`,
            { nombre: nuevoNombre },
            { headers }
        );
    }
}