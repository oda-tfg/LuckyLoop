import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router // Inyectado Router
  ) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.showGame = data['showGame'] || false;
    });
  }

  goToGame(url: string): void {
    if (url) {
      this.router.navigate([url]);
    } else {
      this.showAlert();
    }
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