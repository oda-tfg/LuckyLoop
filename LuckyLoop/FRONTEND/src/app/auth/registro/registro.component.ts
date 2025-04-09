import { Component } from '@angular/core';
import { Router } from '@angular/router';
/* import { AuthService } from '../auth/auth.service'; */
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-registro',
  standalone: false,
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  username: string = "";
  email: string = '';
  password: string = '';
  repetirPassword: string = "";
  telefono: string = "";

  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    /* private authService: AuthService */
  ) { }

  register() {
    // Usar this para acceder a los valores directamente
    if (!this.username || !this.email || !this.password || this.password !== this.repetirPassword) {
      this.errorMessage = 'Por favor completa todos los campos correctamente';
      return;
    }
  
    
  }
  //lleva a la ruta login cuando da a enlace
  goToLogin() {
    this.router.navigate(['/login']);
  }

}
