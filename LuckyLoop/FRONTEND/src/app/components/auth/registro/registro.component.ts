// registro.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-registro',
  standalone: false,
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  nombreUsuario: string = '';
  correoElectronico: string = '';
  telefono: string = '';
  contrasena: string = '';
  repetirContrasena: string = '';
  
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  registrar(): void {
    this.errorMessage = '';
    this.successMessage = '';
    
    // Validaciones básicas
    if (!this.nombreUsuario || !this.correoElectronico || !this.telefono || 
        !this.contrasena || !this.repetirContrasena) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }
    
    if (!this.validarEmail(this.correoElectronico)) {
      this.errorMessage = 'Por favor, introduce un correo electrónico válido';
      return;
    }
    
    if (this.contrasena !== this.repetirContrasena) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }
    
    // if (this.contrasena.length < 8) {
    //   this.errorMessage = 'La contraseña debe tener al menos 8 caracteres';
    //   return;
    // }
    
    this.isLoading = true;
    
    this.authService.registrar(
      this.nombreUsuario,
      this.contrasena,
      this.repetirContrasena,
      this.telefono,
      this.correoElectronico
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Usuario registrado correctamente';
        // Limpiar formulario
        this.resetForm();
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al registrar usuario:', error);
        this.errorMessage = error.error.message || 'No se pudo registrar el usuario. Por favor, inténtalo nuevamente.';
      }
    });
  }
  
  resetForm(): void {
    this.nombreUsuario = '';
    this.correoElectronico = '';
    this.telefono = '';
    this.contrasena = '';
    this.repetirContrasena = '';
  }
  
  validarEmail(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }
}