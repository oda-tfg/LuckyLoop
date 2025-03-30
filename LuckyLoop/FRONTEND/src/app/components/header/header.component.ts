import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone:false,
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  // Método para manejar la búsqueda
  onSearch(searchTerm: string): void {
    console.log('Búsqueda:', searchTerm);
    // Aquí implementarías la lógica de búsqueda
  }
}