import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone:false,
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  constructor(private router: Router) {}
  
  // Método para manejar la búsqueda
  onSearch(searchTerm: string): void {
    console.log('Búsqueda:', searchTerm);
    // Aquí implementarías la lógica de búsqueda
  }
  goToDeposit(): void {
    this.router.navigate(['/depositar']);
  }
}