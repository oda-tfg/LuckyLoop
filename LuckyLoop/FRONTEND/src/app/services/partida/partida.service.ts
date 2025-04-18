import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PartidaService {
    private apiUrl = 'http://localhost:8000/api'

    constructor(
        private http: HttpClient
    ) {}

    finPartida(juego_id: number,beneficio:number, dinero_apostado:number, resultado:string): Observable<any> {
        const token = localStorage.getItem('auth_token');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
        
        const body = {
            juego_id: juego_id,
            beneficio:beneficio,
            dinero_apostado: dinero_apostado,
            resultado:resultado
        };
        
        return this.http.post(`${this.apiUrl}/finPartida`, body, { headers });
    }
}