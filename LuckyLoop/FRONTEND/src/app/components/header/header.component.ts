import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SaldoService } from '../../services/saldo/saldo.service'; // Importa el nuevo servicio

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: false,
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false;
  userBalance: number = 0;

  constructor(
    private router: Router,
    private saldoService: SaldoService // Usa el nuevo servicio
  ) {}
  
  ngOnInit(): void {
    // Verificar si hay un token al inicializar el componente
    this.checkLoginStatus();
    
    // Si está logueado, cargar el saldo
    if (this.isLoggedIn) {
      this.loadUserBalance();
    }
  }

  // Método para verificar si el usuario está autenticado
  checkLoginStatus(): void {
    const token = localStorage.getItem('auth_token');
    this.isLoggedIn = !!token; // Convertir a booleano
  }
  
  // Método para cargar el saldo del usuario
  loadUserBalance(): void {
    this.saldoService.getSaldo().subscribe({
      next: (response) => {
        if (response && response.saldo !== undefined) {
          console.log('Saldo obtenido:', response.saldo);
          this.userBalance = response.saldo;
        }
      },
      error: (error) => {
        console.error('Error al obtener el saldo:', error);
      }
    });
  }
  
  // Método para manejar la búsqueda
  onSearch(searchTerm: string): void {
    console.log('Búsqueda:', searchTerm);
    // Aquí implementarías la lógica de búsqueda
  }

  goToDeposit(): void {
    this.router.navigate(['/depositar']);
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.isLoggedIn = false;
    this.userBalance = 0;
    this.router.navigate(['/home']);
  }
}