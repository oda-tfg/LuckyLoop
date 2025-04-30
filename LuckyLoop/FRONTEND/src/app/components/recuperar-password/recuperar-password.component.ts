import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-recuperar-password',
  standalone: false,
  templateUrl: './recuperar-password.component.html',
  styleUrls: ['./recuperar-password.component.css']
})
export class RecuperarPasswordComponent {
  email: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  isSubmitting: boolean = false;

  constructor(

    private authService: AuthService
  ) {}

  recuperarPassword(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = true;

    if (!this.email) {
      this.errorMessage = 'Por favor, introduce tu correo electrónico';
      this.isSubmitting = false;
      return;
    }

    this.authService.comprobarEmail(this.email).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = 'Se ha enviado un enlace de recuperación a tu correo electrónico';
        this.email = ''; // Limpiamos el campo después del éxito
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = 'No se pudo procesar tu solicitud. Verifica tu correo e inténtalo nuevamente.';
      }
    });
  }
}