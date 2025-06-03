import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { SaldoService } from './../../services/saldo/saldo.service';
import { BloquearZoom } from './../../services/bloquearZoomYScroll/bloquearZoomYScroll.service';

interface Punto {
  x: number;
  y: number;
}

@Component({
  selector: 'app-ruleta',
  standalone: false,
  templateUrl: './ruleta.component.html',
  styleUrl: './ruleta.component.css'
})
export class RuletaComponent implements OnInit {
  // Variables de la ruleta
  puntos: Punto[] = [];
  grados: number = 0;
  girando: boolean = false;
  resultadoTexto: string = 'Gira la ruleta';

  // Variables de la mesa
  numerosTablero: number[] = [];
  fichaSeleccionada: number = 1;
  apuestas: { [key: string]: number } = {};
  saldo: number = 0; //cambio de balance inicial al usuario no registrado

  // Números de la ruleta en orden (como en una ruleta europea)
  numerosRuleta: number[] = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
    5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
  ];

  // Números rojos en la ruleta europea para determinar colores
  numerosRojos: number[] = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

  constructor(
    private renderer: Renderer2, 
    private el: ElementRef,
    private saldoService: SaldoService,
    private bloquearZoomService: BloquearZoom
  ) { }

  ngOnInit(): void {
    this.generarPuntosRuleta();
    this.generarNumerosTablero();
    this.loadUserBalance();
    this.bloquearZoomService.lockDisplaySettings(100);
  }

  ngOnDestroy(): void {
    this.bloquearZoomService.unlockDisplaySettings();
  }

  // Cargar el saldo del usuario desde la base de datos
  loadUserBalance(): void {
    this.saldoService.getSaldo().subscribe({
      next: (response) => {
        this.saldo = response.saldo;
      },
      error: (error) => {
        console.error('Error al obtener el saldo del usuario:', error);
      }
    });
  }

  // Método para actualizar el saldo en la base de datos
  updateBalanceInDatabase(amount: number): void {
    this.saldoService.setSaldo(amount).subscribe({
      next: (response) => {
        console.log('Saldo actualizado correctamente:', response);
      },
      error: (error) => {
        console.error('Error al actualizar el saldo:', error);
      }
    });
  }

  // Función para generar los puntos blancos alrededor de la ruleta
  generarPuntosRuleta(): void {
    const numSectores = this.numerosRuleta.length;
    const anguloSector = 360 / numSectores;

    for (let i = 0; i < numSectores; i++) {
      const anguloMedio = i * anguloSector;
      const radius = 180; // radio donde estarán los puntos

      // Convertir ángulo a radianes
      const anguloRad = ((anguloMedio - 90) * Math.PI) / 180; // Resta 90 para que comience desde arriba

      // Calcula la posición X e Y
      const x = Math.cos(anguloRad) * radius + 200;
      const y = Math.sin(anguloRad) * radius + 200;

      this.puntos.push({ x, y });
    }
  }

  // Función para generar los números del tablero (1-36)
  generarNumerosTablero(): void {
    for (let fila = 0; fila < 3; fila++) {
      for (let col = 0; col < 12; col++) {
        const numero = col * 3 + (3 - fila);
        this.numerosTablero.push(numero);
      }
    }
  }

  // Función para determinar si un número es rojo
  esRojo(numero: number): boolean {
    return this.numerosRojos.includes(numero);
  }

  // Función para seleccionar una ficha
  seleccionarFicha(valor: number): void {
    this.fichaSeleccionada = valor;
  }

  // Función para colocar una apuesta
  colocarApuesta(apuesta: string): void {
    if (this.girando) return;

    if (this.saldo < this.fichaSeleccionada) {
      alert('No tienes suficiente saldo para apostar');
      return;
    }

    // Restar el valor de la apuesta del saldo
    this.saldo -= this.fichaSeleccionada;
    
    // Actualizar el saldo en la base de datos (deducción de la apuesta)
    this.updateBalanceInDatabase(-this.fichaSeleccionada);

    // Registrar la apuesta
    if (!this.apuestas[apuesta]) {
      this.apuestas[apuesta] = 0;
    }
    this.apuestas[apuesta] += this.fichaSeleccionada;

    // Mostrar la ficha visualmente
    this.mostrarFichaApuesta(apuesta);
  }

  // Función para mostrar visualmente una ficha en el tablero
  mostrarFichaApuesta(apuesta: string): void {
    const valor = this.fichaSeleccionada;

    // Encontrar el elemento donde colocar la ficha
    let elemento: HTMLElement | null;

    if (apuesta === '0') {
      elemento = document.querySelector('.celda-0');
    } else if (!isNaN(Number(apuesta))) {
      elemento = document.querySelector(`[data-numero="${apuesta}"]`);
    } else {
      // Es una apuesta simple (rojo, negro, par, etc.)
      elemento = document.querySelector(`[data-apuesta="${apuesta}"]`);

      if (!elemento) {
        // Para las apuestas simples creadas dinámicamente
        const elements = document.querySelectorAll('.apuesta-simple');
        elements.forEach(el => {
          if (el.textContent?.trim() === apuesta) {
            elemento = el as HTMLElement;
          }
        });
      }
    }

    if (!elemento) return;

    // Comprobar si ya hay una ficha
    let fichaExistente = elemento.querySelector('.ficha-apuesta');

    if (fichaExistente) {
      // Actualizar valor de la ficha existente
      const valorActual = parseInt(fichaExistente.textContent || '0');
      fichaExistente.textContent = (valorActual + valor).toString();
      return;
    }

    // Crear nueva ficha
    const ficha = this.renderer.createElement('div');
    this.renderer.addClass(ficha, 'ficha-apuesta');
    this.renderer.addClass(ficha, `ficha-${valor}`);
    ficha.textContent = valor.toString();

    // Determinar color de la ficha
    let color = '#ff5252'; // Rojo (1)
    if (valor === 5) color = '#2196f3';
    else if (valor === 10) color = '#4caf50';
    else if (valor === 25) color = '#9c27b0';
    else if (valor === 100) color = '#ffc107';

    this.renderer.setStyle(ficha, 'backgroundColor', color);

    // Determinar si es una celda o apuesta simple
    const esApuestaSimple = elemento.classList.contains('apuesta-simple');

    if (esApuestaSimple) {
      this.renderer.setStyle(ficha, 'position', 'absolute');
      this.renderer.setStyle(ficha, 'left', '50%');
      this.renderer.setStyle(ficha, 'top', '50%');
      this.renderer.setStyle(ficha, 'transform', 'translate(-50%, -50%)');
    } else {
      this.renderer.setStyle(ficha, 'position', 'absolute');
      this.renderer.setStyle(ficha, 'left', '50%');
      this.renderer.setStyle(ficha, 'top', '80%');
      this.renderer.setStyle(ficha, 'transform', 'translate(-50%, -50%)');
    }

    this.renderer.appendChild(elemento, ficha);
  }

  // Función para girar la ruleta
  girarRuleta(): void {
    if (this.girando) return;

    this.girando = true;
    this.resultadoTexto = 'Girando...';

    // Generar un número aleatorio
    const indiceAleatorio = Math.floor(Math.random() * this.numerosRuleta.length);
    const valorGanador = this.numerosRuleta[indiceAleatorio];

    // Calcular los grados para que la ruleta se detenga en el número ganador
    const minGiros = 5; // Mínimo de giros completos
    const anguloSector = 360 / this.numerosRuleta.length;
    const giroAdicional = 360 * minGiros;

    // Calcular grados para que el valor ganador quede arriba (en la posición de la aguja)
    const gradosParaValor = 90 - (indiceAleatorio * anguloSector);

    // Grados totales a girar
    const gradosGiro = giroAdicional + gradosParaValor;

    // Actualizar los grados actuales
    this.grados += gradosGiro;

    // Obtener el elemento de la ruleta y aplicar la rotación
    const ruleta = document.getElementById('ruleta');
    if (ruleta) {
      ruleta.style.transform = `rotate(${this.grados}deg)`;
    }

    // Mostrar el resultado después de 5 segundos
    setTimeout(() => {
      this.resultadoTexto = `Número: ${valorGanador}`;

      // Comprobar apuestas y actualizar saldo
      this.comprobarApuestas(valorGanador);

      this.girando = false;
    }, 5000);
  }

  // Función para comprobar las apuestas y pagar cuando sea necesario
  comprobarApuestas(numeroGanador: number): void {
    const colorGanador = this.esRojo(numeroGanador) ? "rojo" : "negro";
    let ganancias = 0;

    // Comprobar apuestas directas a números
    if (this.apuestas[numeroGanador.toString()]) {
      ganancias += this.apuestas[numeroGanador.toString()] * 36;
    }

    // Comprobar apuestas simples
    if (numeroGanador !== 0) {
      // Rojo/Negro
      if (colorGanador === "rojo" && this.apuestas["rojo"]) {
        ganancias += this.apuestas["rojo"] * 2;
      }
      if (colorGanador === "negro" && this.apuestas["negro"]) {
        ganancias += this.apuestas["negro"] * 2;
      }

      // Par/Impar
      if (numeroGanador % 2 === 0 && this.apuestas["par"]) {
        ganancias += this.apuestas["par"] * 2;
      }
      if (numeroGanador % 2 !== 0 && this.apuestas["impar"]) {
        ganancias += this.apuestas["impar"] * 2;
      }

      // 1-18/19-36
      if (numeroGanador >= 1 && numeroGanador <= 18 && this.apuestas["1-18"]) {
        ganancias += this.apuestas["1-18"] * 2;
      }
      if (numeroGanador >= 19 && numeroGanador <= 36 && this.apuestas["19-36"]) {
        ganancias += this.apuestas["19-36"] * 2;
      }

      // Docenas
      if (numeroGanador >= 1 && numeroGanador <= 12 && this.apuestas["1-12"]) {
        ganancias += this.apuestas["1-12"] * 3;
      }
      if (numeroGanador >= 13 && numeroGanador <= 24 && this.apuestas["13-24"]) {
        ganancias += this.apuestas["13-24"] * 3;
      }
      if (numeroGanador >= 25 && numeroGanador <= 36 && this.apuestas["25-36"]) {
        ganancias += this.apuestas["25-36"] * 3;
      }
    }

    // Actualizar saldo con las ganancias
    this.saldo += ganancias;
    
    // Actualizar el saldo en la base de datos (añadir ganancias)
    if (ganancias > 0) {
      this.updateBalanceInDatabase(ganancias);
    }

    // Mostrar mensaje de ganancias si hubo
    if (ganancias > 0) {
      alert(`¡Has ganado ${ganancias}!`); //CAMBIAR POR MENSAJE EN PANTALLA ENCIMA DE RULETA!!
    }

    // Limpiar las fichas visualmente
    const fichas = document.querySelectorAll('.ficha-apuesta');
    fichas.forEach(ficha => ficha.remove());

    // Reiniciar el objeto de apuestas
    this.apuestas = {};
  }

  // Función para borrar todas las apuestas
  borrarApuestas(): void {
    if (this.girando) return;

    // Devolver el dinero de las apuestas al saldo
    let totalApuestas = 0;
    for (const key in this.apuestas) {
      totalApuestas += this.apuestas[key];
    }

    // Aumentar el saldo con el total de las apuestas
    this.saldo += totalApuestas;
    
    // Actualizar el saldo en la base de datos (devolver las apuestas)
    if (totalApuestas > 0) {
      this.updateBalanceInDatabase(totalApuestas);
    }

    // Eliminar las fichas visualmente
    const fichas = document.querySelectorAll('.ficha-apuesta');
    fichas.forEach(ficha => ficha.remove());

    // Reiniciar el objeto de apuestas
    this.apuestas = {};
  }

  // Función para el botón de apostar
  apostar(): void {
    if (this.girando) return;

    // Verificar si hay apuestas colocadas
    let hayApuestas = false;
    for (const key in this.apuestas) {
      if (this.apuestas[key] > 0) {
        hayApuestas = true;
        break;
      }
    }

    if (hayApuestas) {
      this.girarRuleta();
    } else {
      alert('Coloca al menos una apuesta antes de girar');
    }
  }
}