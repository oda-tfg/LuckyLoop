import { Component, OnInit } from '@angular/core';
import { NavService } from './nav.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  standalone: false,
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  menuItems = [
    { title: 'Inicio', route: '/home', icon: 'home' }
    // Las categorías irán aquí dinámicamente
    // Torneos se añadirá después de las categorías
  ];
  
  categoriaItems: any[] = [];
  
  mobileMenuOpen = false;

  constructor(private navService: NavService) {}

  ngOnInit() {
    this.loadCategorias();
  }

  loadCategorias() {
    this.navService.getCategorias().subscribe({
      next: (categorias) => {
        // Crear items de menú para cada categoría
        this.categoriaItems = categorias.map(cat => ({
          title: cat,
          route: `/category/${cat.toLowerCase()}`,
          icon: this.getCategoryIcon(cat)
        }));
        
        // Reconstruir el menú con: Inicio + Categorías + Torneos
        this.menuItems = [
          { title: 'Inicio', route: '/home', icon: 'home' },
          ...this.categoriaItems,
          { title: 'Torneos', route: '/tournaments', icon: 'trophy' }
        ];
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  // Método para asignar iconos según la categoría
  getCategoryIcon(category: string): string {
    const iconMap: {[key: string]: string} = {
      'Azar': 'dice',
      'Programacion': 'code',
      // Añade más mapeos según necesites
    };
    
    return iconMap[category] || 'gamepad'; // Icono por defecto
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}