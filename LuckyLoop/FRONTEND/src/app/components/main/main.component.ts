import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  standalone: false,
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  showGame: boolean = false;
  timestamp = Date.now(); // Para forzar recarga del iframe


  // Datos para los juegos destacados
  featuredGames = [
    {
      id: 1,
      name: 'BlackJack',
      image: 'assets/images/games/mega-fortune.jpg',
      category: 'slots',
      isHot: true,
      url: '/blackjack' //ruta del juego
    },
    {
      id: 2,
      name: 'Starburst',
      image: 'assets/images/games/starburst.jpg',
      category: 'slots',
      isHot: true
    },
    {
      id: 3,
      name: 'European Roulette',
      image: 'assets/images/games/european-roulette.jpg',
      category: 'table',
      isHot: false
    },
    {
      id: 4,
      name: 'Texas Holdem',
      image: 'assets/images/games/texas-holdem.jpg',
      category: 'poker',
      isHot: true
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.showGame = this.router.url === '/blackjack';
      this.timestamp = Date.now(); //Actualiza timestamp al navegar
    });
  }

  goToGame(url: string): void {
    this.router.navigate([url]);
  }

  showAlert(): void {
    alert('¡Este juego estará disponible próximamente!');
  }

  // Datos para las promociones actuales
  currentPromotions = [
    {
      id: 1,
      title: 'Bono de Bienvenida',
      description: '100% hasta 500€ en tu primer depósito',
      image: 'assets/images/promotions/welcome-bonus.jpg',
      expiry: '2025-04-30'
    },
    {
      id: 2,
      title: 'Giros Gratis',
      description: '50 giros gratis en Starburst',
      image: 'assets/images/promotions/free-spins.jpg',
      expiry: '2025-04-15'
    }
  ];
}