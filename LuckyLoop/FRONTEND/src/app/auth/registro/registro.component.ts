import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: false,
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  email: string = '';
  password: string = '';

  constructor(private router: Router) {}

  register() {
    // Aquí va la lógica de registro
    console.log('Registrando usuario con', this.email, this.password);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
