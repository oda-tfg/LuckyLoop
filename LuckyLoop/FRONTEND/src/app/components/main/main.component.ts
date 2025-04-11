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
      image: 'assets/images/games/blackjack.webp',
      category: 'Juego de Mesa',
      isHot: true,
      url: '/blackjack' //ruta del juego
    },
    {
      id: 2,
      name: 'Plinko',
      image: 'assets/images/games/plinko.webp',
      category: 'Juego de Azar',
      isHot: true
    },
    {
      id: 3,
      name: 'Ruleta',
      image: 'assets/images/games/ruleta.webp',
      category: 'Juego de Mesa',
      isHot: false
    },
    {
      id: 4,
      name: 'Programa y Gana',
      image: 'assets/images/games/programaGana.webp',
      category: 'Juego de Programación',
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

}