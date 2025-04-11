import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SaldoService {
    private apiUrl = 'http://localhost:8000/api'

    constructor(
        private http: HttpClient
    ) {}

    getSaldo(): Observable<any> {
        const token = localStorage.getItem('auth_token');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        
        return this.http.get(`${this.apiUrl}/usuario/getSaldo`, { headers });
    }
}