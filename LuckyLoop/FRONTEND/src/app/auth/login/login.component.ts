import { Component } from '@angular/core';
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

  constructor(private router: Router) {}

  login() {
    // Aquí iría la lógica real
    console.log('Iniciando sesión con', this.email, this.password);
  }

  goToRegistro() {
    this.router.navigate(['/registro']);
  }
}
