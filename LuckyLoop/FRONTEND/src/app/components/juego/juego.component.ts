import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-juego',
  standalone: false,
  templateUrl: './juego.component.html',
  styleUrl: './juego.component.css'
})
export class JuegoComponent {
  @Input() nombre!: string;
  @Input() imagen!: string;
}
