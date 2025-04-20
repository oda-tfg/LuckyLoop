import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    private apiUrl = 'https://localhost:8000/api';

    constructor(
        private http: HttpClient
    ) { }

    login(email: string, password: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, { email, password })
    }

    comprobarEmail(email: string) {
        return this.http.post(`${this.apiUrl}/usuario/emailToken`, { email })
    }

    comporbarToken(token: string) {
        return this.http.get(`${this.apiUrl}/usuario/comprobarToken/${token}`)
    }

    cambiarPassword(token: string, password: string, email: string, confirmPassword: string) {
        return this.http.post(`${this.apiUrl}/usuario/cambiarPassword`, { token, password, email, confirmPassword })
    }

    registrar(nombreUsuario: string, contrasena: string, repetirContrasena: string, telefono: string, correoElectronico: string) {
        return this.http.post(`${this.apiUrl}/usuario/registrar`, { nombreUsuario, contrasena, repetirContrasena, telefono, correoElectronico })
    }
}   