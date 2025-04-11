import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-cambiar-password',
  standalone: false,
  templateUrl: './cambiar-password.component.html',
  styleUrls: ['./cambiar-password.component.css']
})
export class CambiarPasswordComponent implements OnInit {
  token: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = true;
  tokenValido: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Extraer el token de los parámetros de la URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      
      // Opcionalmente, pre-llenar el email si se proporciona en la URL
      if (params['email']) {
        this.email = params['email'];
      }
      
      if (!this.token) {
        this.errorMessage = 'Token no válido o faltante.';
        this.isLoading = false;
        return;
      }
      
      // Verificar el token con la API
      this.authService.comporbarToken(this.token).subscribe({
        next: (response) => {
          this.tokenValido = true;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al verificar el token:', error);
          this.errorMessage = 'El enlace ha expirado o no es válido. Por favor, solicita un nuevo enlace.';
          this.isLoading = false;
        }
      });
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  cambiarPassword(): void {
    this.errorMessage = '';
    
    // Validar el email
    if (!this.email || !this.validarEmail(this.email)) {
      this.errorMessage = 'Por favor, introduce un correo electrónico válido';
      return;
    }
    
    // Validar las contraseñas
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }
    
    // if (this.password.length < 8) {
    //   this.errorMessage = 'La contraseña debe tener al menos 8 caracteres';
    //   return;
    // }
    
    this.isLoading = true;
    
    this.authService.cambiarPassword(this.token, this.password, this.email, this.confirmPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Contraseña actualizada correctamente';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al cambiar la contraseña:', error);
        this.errorMessage = 'No se pudo actualizar la contraseña. Por favor, inténtalo nuevamente.';
      }
    });
  }
  
  // Método simple para validar formato de email
  validarEmail(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }
}