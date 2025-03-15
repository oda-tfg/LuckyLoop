import { Component } from '@angular/core';
import { JuegoComponent } from './juego/juego.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'FRONTEND';
  nombre = 'Ruleta';
  imagen ='https://games.evolution.com/wp-content/uploads/2022/03/immersive-roulette-pid-2.jpg';
}
