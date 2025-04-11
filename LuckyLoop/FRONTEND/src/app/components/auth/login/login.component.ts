import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';

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

  constructor(
    private authService: AuthService
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        //Guardamos el token en localStorage
        if (response && response.token) {
          localStorage.setItem('auth_token', response.token);
          console.log('Login exitoso');
          //Aquí puedes agregar redirección a otra página
        }
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.errorMessage = 'Credenciales inválidas';
      }
    });
  }
}