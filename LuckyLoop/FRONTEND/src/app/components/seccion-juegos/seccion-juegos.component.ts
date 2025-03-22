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
    const scrollAmount = contenedor.clientWidth * 0.8; // Ajuste más preciso
    
    this.currentScroll += direccion * scrollAmount;
    
    // Limitar los límites del scroll
    this.currentScroll = Math.max(0, Math.min(
        this.currentScroll, 
        contenedor.scrollWidth - contenedor.clientWidth
    ));
    
    contenedor.scrollTo({
        left: this.currentScroll,
        behavior: 'smooth'
    });

    // Actualizar flechas después de la animación
    contenedor.addEventListener('scrollend', () => this.actualizarFlechas(), {once: true});
}

}
