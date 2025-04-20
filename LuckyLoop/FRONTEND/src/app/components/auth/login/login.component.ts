import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Importar Router

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
    console.log('email:', this.email);
    console.log('password:', this.password);

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        if (response && response.token) {
          localStorage.setItem('auth_token', response.token);
          this.router.navigate(['/home']);
        }
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.errorMessage = 'Credenciales inválidas';
      }
    });
  }
}