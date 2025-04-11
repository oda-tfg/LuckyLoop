import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  
  login() {
    // Lógica de login
    console.log('Login clicked', this.email, this.password);
  }
}
