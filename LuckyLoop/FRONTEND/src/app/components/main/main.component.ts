import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { url } from 'node:inspector';
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
      private juegosService: JuegosService
    ) {}

    //llamar a los juegos por api
    ngOnInit(): void {
      this.juegosService.getAllJuegos().subscribe({
        next: (games) => {
          this.featuredGames = games;
          this.filteredGames = [...this.featuredGames]; // Mostrar todos al inicio
        },
        error: (err) => {
          console.error('Error al cargar los juegos:', err);
        }
      });
    }

  //método para llamar desde el componente padre (donde esté el header)
  updateSearchTerm(term: string): void {
    this.searchTerm = term.toLowerCase();
    this.filterGames();
  }

  //Metodo para filtrar los juegos basados en la busqueda
  filterGames(): void {
    this.filteredGames = this.featuredGames.filter(game =>
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

  

  /* ngOnInit() {
    this.route.data.subscribe(data => {
      this.showGame = data['showGame'] || false;
    });
  } */
