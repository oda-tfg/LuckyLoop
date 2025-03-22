import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { JuegoComponent } from '../juego/juego.component';

@Component({
  selector: 'app-seccion-juegos',
  standalone: false,
  templateUrl: './seccion-juegos.component.html',
  styleUrl: './seccion-juegos.component.css'
})
export class SeccionJuegosComponent {
  @ViewChild('juegosContenedor') juegosContenedor!: ElementRef;

  @Input() nombre!: string;
  @Input() juegos!: any[];
  mostrarFlechaIzq = false;
  mostrarFlechaDer = true;
  private currentScroll = 0;

  ngAfterViewInit() {
    this.actualizarFlechas();
    this.juegosContenedor.nativeElement.addEventListener('scroll', () => this.actualizarFlechas());
    window.addEventListener('resize', () => this.actualizarFlechas());
  }

  actualizarFlechas() {
    const element = this.juegosContenedor.nativeElement;
    const maxScroll = element.scrollWidth - element.clientWidth;
    
    this.currentScroll = element.scrollLeft;
    this.mostrarFlechaIzq = this.currentScroll > 0;
    this.mostrarFlechaDer = this.currentScroll < maxScroll;
  }

  moverCarrusel(direccion: number) {
    const contenedor = this.juegosContenedor.nativeElement;
    const anchoContenedor = contenedor.clientWidth;
    
    this.currentScroll += direccion * anchoContenedor;
    contenedor.scrollTo({
      left: this.currentScroll,
      behavior: 'smooth'
    });

    // Actualizar después de la animación
    setTimeout(() => this.actualizarFlechas(), 500);
  }

}
