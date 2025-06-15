import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { JuegosService } from '../../services/juegos/juegos.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  standalone: false,
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  showGame: boolean = false;
  timestamp = Date.now(); // Para forzar recarga del iframe
  //busqueda//
  searchTerm: string = ''; // Para almacenar el término de búsqueda (si decides tener un input en el main)
  filteredGames: any[] = []; // Para almacenar los juegos filtrados
  featuredGames: any[] = [];

  constructor(
      private router : Router,
      private route: ActivatedRoute,
      private juegosService: JuegosService
    ) {}

    //llamar a los juegos por api
    ngOnInit(): void {
      this.juegosService.getAllJuegos().subscribe({
        next: (games) => {
          this.featuredGames = games;
          this.filteredGames = [...this.featuredGames]; // Mostrar todos al inicio
          this.checkRouteAndFilter(); // Verificar si hay una categoría en la ruta
        },
        error: (err) => {
          console.error('Error al cargar los juegos:', err);
        }
      });

      // Escuchar cambios en la ruta
      this.route.params.subscribe(params => {
        this.checkRouteAndFilter();
      });
    }

    // Método para verificar la ruta y filtrar según la categoría
    checkRouteAndFilter(): void {
      const category = this.route.snapshot.params['categoria']; // Cambiar 'category' por 'categoria'
      if (category) {
        this.filterByCategory(category);
      } else {
        // Si no hay categoría (ruta /home), mostrar todos
        this.filteredGames = [...this.featuredGames];
      }
    }

    // Método para filtrar por categoría
    filterByCategory(category: string): void {
      this.filteredGames = this.featuredGames.filter(game => 
        game.category && game.category.toLowerCase() === category.toLowerCase()
      );
    }

  //método para llamar desde el componente padre (donde esté el header)
  updateSearchTerm(term: string): void {
    this.searchTerm = term.toLowerCase();
    this.filterGames();
  }

  //Metodo para filtrar los juegos basados en la busqueda
  filterGames(): void {
    const category = this.route.snapshot.params['categoria']; // Cambiar 'category' por 'categoria'
    let gamesToFilter = this.featuredGames;
    
    // Si hay una categoría activa, filtrar primero por categoría
    if (category) {
      gamesToFilter = this.featuredGames.filter(game => 
        game.category && game.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Luego filtrar por búsqueda
    this.filteredGames = gamesToFilter.filter(game =>
      game.name.toLowerCase().includes(this.searchTerm)
    );
  }

  goToGame(url: string): void {
    // Usa el Router para navegar a la URL especificada
    this.router.navigate([url]);
    console.log('Ir al juego:', url);
  }

  showAlert(): void {
    // Lógica para mostrar una alerta si no hay URL
    alert('Este juego no tiene una URL definida.');
  }
}