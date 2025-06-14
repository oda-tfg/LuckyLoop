import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:8000/api';
    private currentUserRolesSubject = new BehaviorSubject<string[]>([]);
    public currentUserRoles$ = this.currentUserRolesSubject.asObservable();
    
    constructor(
        private http: HttpClient,
        private router: Router
    ) { 
        // Verificar si hay un token al iniciar
        const token = localStorage.getItem('auth_token');
        if (token) {
            this.obtenerRoles().subscribe({
                error: () => {
                    // Si falla, limpiar el token
                    this.logout();
                }
            });
        }
    }

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('auth_token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    login(email: string, password: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, { email, password });
    }

    obtenerRoles(): Observable<string[]> {
        const headers = this.getAuthHeaders();
        return this.http.get<string[]>(`${this.apiUrl}/usuario/getRol`, { headers }).pipe(
            tap(roles => {
                this.currentUserRolesSubject.next(roles);
            })
        );
    }

    redirigirSegunRoles(roles: string[]): void {
        if (roles.includes('ROLE_ADMIN')) {
            // Redirigir a URL externa para admin
            window.location.href = 'http://localhost:8000/admin';
        } else if (roles.includes('ROLE_MANAGER')) {
            this.router.navigate(['/manager']);
        } else {
            this.router.navigate(['/home']);
        }
    }

    getCurrentUserRoles(): string[] {
        return this.currentUserRolesSubject.value;
    }

    logout(): void {
        localStorage.removeItem('auth_token');
        this.currentUserRolesSubject.next([]);
        this.router.navigate(['/login']);
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem('auth_token');
    }

    hasRole(role: string): boolean {
        const roles = this.currentUserRolesSubject.value;
        return roles.includes(`ROLE_${role.toUpperCase()}`);
    }

    isAdmin(): boolean {
        return this.hasRole('ADMIN');
    }

    isManager(): boolean {
        return this.hasRole('MANAGER');
    }

    // Métodos existentes
    comprobarEmail(email: string) {
        return this.http.post(`${this.apiUrl}/usuario/emailToken`, { email });
    }

    comporbarToken(token: string) {
        return this.http.get(`${this.apiUrl}/usuario/comprobarToken/${token}`);
    }

    cambiarPassword(token: string, password: string, email: string, confirmPassword: string) {
        return this.http.post(`${this.apiUrl}/usuario/cambiarPassword`, { token, password, email, confirmPassword });
    }

    registrar(nombreUsuario: string, contrasena: string, repetirContrasena: string, telefono: string, correoElectronico: string) {
        return this.http.post(`${this.apiUrl}/usuario/registrar`, { nombreUsuario, contrasena, repetirContrasena, telefono, correoElectronico });
    }
}