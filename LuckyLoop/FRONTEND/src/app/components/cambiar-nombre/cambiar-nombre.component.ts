import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CambiarNombreService } from '../../services/cambiarNombre/cambiarNombre.service';
import { response } from 'express';


@Component({
  selector: 'app-cambiar-nombre',
  standalone: false,
  templateUrl: './cambiar-nombre.component.html',
  styleUrls: ['./cambiar-nombre.component.css']
})
export class CambiarNombreComponent {
  nuevoNombre: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;


  constructor(
    private cambiarNombreService: CambiarNombreService,
    private http: HttpClient,
    private router: Router
  ) { }


  //logica para cambiar nombre
  guardarNombre(): void {

    if (!this.nuevoNombre.trim()) {
      alert('El nombre no puede estar vacio');
      return;
    }

    const apiUrl = 'http://localhost:8000'
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.cambiarNombreService.cambiarNombre(this.nuevoNombre).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.successMessage = response.mensaje || 'Su nombre de usuario ha sido actualizado exitosamente.';
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 3000);
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error al cambiar el nombre:', error);
        if (error.error && error.error.error) {
          // Mensajes específicos del backend
          this.errorMessage = error.error.error;
        } else {
          // Mensajes genéricos para otros errores
          this.errorMessage = error.status === 404
            ? 'Servicio no disponible. Por favor, intente más tarde.'
            : 'Ocurrió un error al procesar su solicitud. Por favor, verifique los datos e intente nuevamente.';
        }
      }
    });
  }
}