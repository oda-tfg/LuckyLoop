import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { SaldoService } from '../../services/saldo/saldo.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: false,
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false;
  userBalance: number = 0;
  showProfileMenu: boolean = false;

  constructor(
    private router: Router,
    private saldoService: SaldoService
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

  // Alternar la visibilidad del menú de perfil
  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  // Cerrar el menú cuando se hace clic fuera de él
  @HostListener('document:click', ['$event'])
  closeMenuOnClickOutside(event: MouseEvent): void {
    const profileIcon = document.querySelector('.profile-icon');
    const profileMenu = document.querySelector('.profile-menu');
    
    if (profileIcon && profileMenu) {
      if (!profileIcon.contains(event.target as Node) && 
          !profileMenu.contains(event.target as Node) && 
          this.showProfileMenu) {
        this.showProfileMenu = false;
      }
    }
  }

  // Navegar a la página de estadísticas
  goToStats(): void {
    this.router.navigate(['/estadisticas']);
    this.showProfileMenu = false;
  }

  // Navegar a la página para cambiar nombre de usuario
  goToChangeUsername(): void {
    this.router.navigate(['/cambiar-nombre']);
    this.showProfileMenu = false;
  }

  goToDeposit(): void {
    this.router.navigate(['/depositar']);
    this.showProfileMenu = false;
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.isLoggedIn = false;
    this.userBalance = 0;
    this.showProfileMenu = false;
    this.router.navigate(['/home']);
  }
}