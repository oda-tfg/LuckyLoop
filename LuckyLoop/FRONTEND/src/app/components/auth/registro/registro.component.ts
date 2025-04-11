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
  username = '';
  email = '';
  password = '';
  repetirPassword = '';
  telefono = '';
  showPassword = false;
  showRepeatPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleRepeatPasswordVisibility() {
    this.showRepeatPassword = !this.showRepeatPassword;
  }

  register() {
    // Lógica de registro
    console.log('Register clicked', this.username, this.email, this.password);
  }
}
