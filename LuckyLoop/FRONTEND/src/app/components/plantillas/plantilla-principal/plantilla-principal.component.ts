import { Component } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { NavComponent } from '../../nav/nav.component';
import { JuegoComponent } from '../../juego/juego.component';
import { SeccionJuegosComponent } from '../../seccion-juegos/seccion-juegos.component';


@Component({
  selector: 'app-plantilla-principal',
  standalone: false,
  templateUrl: './plantilla-principal.component.html',
  styleUrl: './plantilla-principal.component.css'
})
export class PlantillaPrincipalComponent {
  nombre = 'Lo mas jugado'
  juegos=[
    {
      'nombre':'Ruleta',
      'imagen': 'https://games.evolution.com/wp-content/uploads/2022/03/immersive-roulette-pid-2.jpg'
    },
    {
      'nombre':'Black Jack',
      'imagen': 'https://images.sigma.world/blackjack-card-counting-scaled-1.jpg'
    },
    {
      'nombre':'Ruleta',
      'imagen': 'https://games.evolution.com/wp-content/uploads/2022/03/immersive-roulette-pid-2.jpg'
    },
    {
      'nombre':'Black Jack',
      'imagen': 'https://images.sigma.world/blackjack-card-counting-scaled-1.jpg'
    },
    {
      'nombre':'Ruleta',
      'imagen': 'https://games.evolution.com/wp-content/uploads/2022/03/immersive-roulette-pid-2.jpg'
    },
    {
      'nombre':'Black Jack',
      'imagen': 'https://images.sigma.world/blackjack-card-counting-scaled-1.jpg'
    }
  ]
}
