import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BloquearZoom {
  private isLocked = false;

  constructor() { }

  /**
   * Bloquea el zoom y scroll de la página
   * @param zoomLevel Nivel de zoom (opcional, por defecto 100%)
   */
  lockDisplaySettings(zoomLevel: number = 100): void {
    if (this.isLocked) return;
    
    // Establecer zoom
    const zoomPercentage = `${zoomLevel}%`;
    document.body.style.zoom = zoomPercentage;
    
    if (zoomLevel !== 100) {
      // Para Firefox que no soporta la propiedad zoom
      document.body.style.transform = `scale(${zoomLevel/100})`;
      document.body.style.transformOrigin = '0 0';
    }
    
    // Desactivar el scroll
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    // Prevenir eventos de rueda del ratón
    window.addEventListener('wheel', this.preventDefaultHandler, { passive: false });
    
    // Prevenir eventos de touchmove para dispositivos táctiles
    window.addEventListener('touchmove', this.preventDefaultHandler, { passive: false });
    
    // Prevenir desplazamiento con teclado y combinaciones para zoom
    window.addEventListener('keydown', this.handleKeyDown);
    
    // Prevenir gestos pinch para zoom
    window.addEventListener('gesturestart', this.preventDefaultHandler, { passive: false });
    window.addEventListener('gesturechange', this.preventDefaultHandler, { passive: false });
    window.addEventListener('gestureend', this.preventDefaultHandler, { passive: false });
    
    this.isLocked = true;
  }

  /**
   * Desbloquea el zoom y scroll de la página
   */
  unlockDisplaySettings(): void {
    if (!this.isLocked) return;
    
    // Restaurar zoom
    document.body.style.zoom = '';
    document.body.style.transform = '';
    document.body.style.transformOrigin = '';
    
    // Restaurar scroll
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    
    // Eliminar listeners
    window.removeEventListener('wheel', this.preventDefaultHandler);
    window.removeEventListener('touchmove', this.preventDefaultHandler);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('gesturestart', this.preventDefaultHandler);
    window.removeEventListener('gesturechange', this.preventDefaultHandler);
    window.removeEventListener('gestureend', this.preventDefaultHandler);
    
    this.isLocked = false;
  }

  /**
   * Handler para prevenir el comportamiento por defecto
   */
  private preventDefaultHandler = (e: Event): void => {
    e.preventDefault();
  }

  /**
   * Handler para teclas de dirección, espacio y combinaciones de zoom
   */
  private handleKeyDown = (e: KeyboardEvent): void => {
    // Teclas de dirección y espacio
    if([32, 37, 38, 39, 40].includes(e.keyCode)) {
      e.preventDefault();
    }
    
    // Combinaciones para zoom
    if ((e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '0')) || 
        (e.metaKey && (e.key === '+' || e.key === '-' || e.key === '0'))) {
      e.preventDefault();
    }
  }
}