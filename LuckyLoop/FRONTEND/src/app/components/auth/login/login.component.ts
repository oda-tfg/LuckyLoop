import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  errorMessage: string = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    this.errorMessage = '';
    this.isLoading = true;
    console.log('email:', this.email);
    console.log('password:', this.password);

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        if (response && response.token) {
          // Guardar el token
          localStorage.setItem('auth_token', response.token);
          
          // Obtener los roles del usuario y redirigir
          this.authService.obtenerRoles().subscribe({
            next: (roles) => {
              console.log('Roles del usuario:', roles);
              
              // Redirigir según los roles
              this.authService.redirigirSegunRoles(roles);
              this.isLoading = false;
            },
            error: (error) => {
              console.error('Error obteniendo roles:', error);
              // Si falla, redirigir a home por defecto
              this.router.navigate(['/home']);
              this.isLoading = false;
            }
          });
        }
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.errorMessage = 'Credenciales inválidas';
        this.isLoading = false;
      }
    });
  }
}