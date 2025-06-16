import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, AfterViewInit, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SaldoService } from './../../services/saldo/saldo.service';
import { PartidaService } from './../../services/partida/partida.service';
import { BloquearZoom } from './../../services/bloquearZoomYScroll/bloquearZoomYScroll.service';
import { JuegosService, Juego } from './../../services/juegos/juegos.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-plinko',
  standalone: false,
  templateUrl: './plinko.component.html',
  styleUrls: ['./plinko.component.css']
})
export class PlinkoComponent implements AfterViewInit, OnInit {
  @ViewChild('plinkoCanvas') plinkoCanvas!: ElementRef<HTMLCanvasElement>;

  // Configuración del juego
  mode: 'Manual' | 'Auto' = 'Manual';
  amount: number = 0.00;
  rows: number = 16; // Fijo en 16 filas
  balance: number = 1000.00; // Saldo inicial

  // Multiplicadores diseñados para el juego
  multipliers: number[] = [50, 20, 10, 5, 0.8, 0.5, 0.2, 0.1, 0.1, 0.2, 0.5, 0.8, 5, 10, 20, 50];

  // Propiedades de la bola
  balls: Ball[] = [];
  ballRadius: number = 8;
  ballColor: string = '#ffffff';

  // Propiedades de los pines
  pinRadius: number = 3;
  pinColor: string = '#ffffff';

  // Configuración de física corregida
  gravity: number = 0.1;     // Gravedad aumentada para velocidad apropiada
  bounceReduction: number = 0.7; // Factor de rebote más realista
  friction: number = 1; // Fricción del aire para hacer el movimiento más suave

  // Dimensiones del canvas
  canvasWidth: number = 0;
  canvasHeight: number = 0;

  // Estado del juego
  isPlaying: boolean = false;
  lastWinAmount: number = 0;
  isWin: boolean = false;
  showWinIndicator: boolean = false;
  winIndicatorX: number = 0;
  winIndicatorY: number = 0;

  private ctx!: CanvasRenderingContext2D;
  private pins: Pin[] = [];
  private buckets: Bucket[] = [];
  private animationFrameId: number = 0;
  private plinkoJuegoId: number = 0;

  constructor(
    private saldoService: SaldoService,
    private partidaService: PartidaService,
    private bloquearZoomService: BloquearZoom,
    private juegosService: JuegosService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadUserBalance();
    this.bloquearZoomService.lockDisplaySettings(100);
    this.loadJuegoId();
  }

  ngOnDestroy(): void {
    this.bloquearZoomService.unlockDisplaySettings();
  }

  loadJuegoId(): void {
    const currentPath = this.route.snapshot.routeConfig?.path || '';

    this.juegosService.getAllJuegos().subscribe({
      next: (juegos) => {
        const juego = juegos.find(j => j.url?.replace('/', '') === currentPath);
        if (juego) {
          this.plinkoJuegoId = juego.id;
          console.log('ID dinámico asignado al juego:', this.plinkoJuegoId);
        } else {
          console.warn('No se encontró el ID del juego para la ruta:', currentPath);
        }
      },
      error: (error) => {
        console.error('Error al obtener la lista de juegos:', error);
      }
    });
  }

  // Cargar el saldo del usuario desde la base de datos
  loadUserBalance(): void {
    this.saldoService.getSaldo().subscribe({
      next: (response) => {
        this.balance = response.saldo;
      },
      error: (error) => {
        console.error('Error al obtener el saldo del usuario:', error);
      }
    });
  }

  ngAfterViewInit(): void {
    const canvas = this.plinkoCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    // Establecer dimensiones iniciales
    this.setCanvasDimensions();

    // Inicializar juego
    this.initializeGame();
  }

  @HostListener('window:resize')
  onResize(): void {
    // Actualizar dimensiones del canvas y reinicializar el juego al redimensionar la ventana
    this.setCanvasDimensions();
    this.initializeGame();
  }

  setCanvasDimensions(): void {
    const canvas = this.plinkoCanvas.nativeElement;
    const container = canvas.parentElement;

    if (container) {
      // Obtener el tamaño real del contenedor
      const rect = container.getBoundingClientRect();
      this.canvasWidth = rect.width;
      this.canvasHeight = rect.height;

      // Establecer dimensiones del canvas para que coincidan con el contenedor
      canvas.width = this.canvasWidth;
      canvas.height = this.canvasHeight;
    }
  }

  initializeGame(): void {
    this.setupPins();
    this.setupBuckets();
    this.draw();
  }

  setupPins(): void {
    this.pins = [];

    const horizontalSpacing = this.canvasWidth / (this.rows + 1);
    const verticalSpacing = (this.canvasHeight * 0.7) / (this.rows + 1);

    // Crear patrón triangular de pines
    for (let row = 2; row < this.rows; row++) {
      const pinCount = row + 1;
      const rowWidth = pinCount * horizontalSpacing;
      const startX = (this.canvasWidth - rowWidth) / 2 + horizontalSpacing / 2;

      for (let i = 0; i < pinCount; i++) {
        this.pins.push({
          x: startX + i * horizontalSpacing,
          y: 100 + row * verticalSpacing,
          radius: this.pinRadius
        });
      }
    }
  }

  setupBuckets(): void {
    const bucketWidth = this.canvasWidth / this.multipliers.length;

    this.buckets = [];

    for (let i = 0; i < this.multipliers.length; i++) {
      const multiplier = this.multipliers[i];

      // Determinar color basado en el valor del multiplicador
      let color;
      if (multiplier >= 50) {
        color = '#ff00ff'; // Púrpura para 50x
      } else if (multiplier >= 20) {
        color = '#ff0055'; // Rosa/rojo para 20x
      } else if (multiplier >= 10) {
        color = '#ff3a3a'; // Rojo para 10x
      } else if (multiplier >= 1) {
        color = '#ff6c24'; // Naranja para valores neutros/positivos
      } else if (multiplier >= 0.5) {
        color = '#ffa600'; // Amarillo/naranja para valores bajos
      } else {
        color = '#ffcf00'; // Amarillo para valores muy bajos
      }

      this.buckets.push({
        x: i * bucketWidth,
        y: this.canvasHeight - 50,
        width: bucketWidth,
        height: 50,
        multiplier,
        color,
        isHit: false
      });
    }
  }

  draw(): void {
    if (!this.ctx) return;

    // Limpiar canvas
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Dibujar fondo
    this.ctx.fillStyle = '#0a192f';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Dibujar pines
    this.pins.forEach(pin => {
      this.ctx.beginPath();
      this.ctx.arc(pin.x, pin.y, pin.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = this.pinColor;
      this.ctx.fill();
      this.ctx.closePath();
    });

    // Dibujar multiplicadores
    this.buckets.forEach(bucket => {
      // Aplicar efecto de animación si el bucket fue golpeado - encogimiento más sutil
      const bucketScale = bucket.isHit ? 0.97 : 1.0; // Encogimiento muy sutil cuando es golpeado
      const bucketWidth = bucket.width * bucketScale;
      const bucketHeight = bucket.height * bucketScale;
      const bucketX = bucket.x + (bucket.width - bucketWidth) / 2;
      const bucketY = bucket.y + (bucket.height - bucketHeight) / 2;

      // Usar el color del bucket
      this.ctx.fillStyle = bucket.color;

      // Dibujar bucket del multiplicador con esquinas redondeadas
      this.ctx.beginPath();
      this.ctx.roundRect(
        bucketX,
        bucketY,
        bucketWidth,
        bucketHeight,
        8 // Radio del borde
      );
      this.ctx.fill();

      // Dibujar texto del multiplicador
      this.ctx.fillStyle = 'white';
      this.ctx.font = bucket.isHit ? 'bold 13px Arial' : '12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        `${bucket.multiplier}x`,
        bucketX + bucketWidth / 2,
        bucketY + bucketHeight / 2 + 5 // Centrar el texto
      );
    });

    // Dibujar bolas
    this.balls.forEach(ball => {
      this.ctx.beginPath();
      this.ctx.arc(ball.x, ball.y, this.ballRadius, 0, Math.PI * 2);
      this.ctx.fillStyle = this.ballColor;
      this.ctx.fill();
      this.ctx.closePath();
    });

    // Dibujar indicador de ganancia
    if (this.showWinIndicator) {
      this.ctx.fillStyle = this.isWin ? 'rgba(0, 255, 42, 0.9)' : 'rgba(255, 58, 58, 0.9)';
      this.ctx.beginPath();
      this.ctx.roundRect(
        this.winIndicatorX - 50,
        this.winIndicatorY - 15,
        100,
        30,
        5
      );
      this.ctx.fill();

      this.ctx.fillStyle = 'white';
      this.ctx.font = 'bold 14px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        `${this.isWin ? '+' : ''}${this.lastWinAmount.toFixed(2)}`,
        this.winIndicatorX,
        this.winIndicatorY
      );
    }
  }

  update() {
    if (!this.isPlaying) return;

    this.balls.forEach((ball, index) => {
      // Aplicar gravedad
      ball.vy += this.gravity;

      // Aplicar fricción del aire
      ball.vx *= this.friction;
      ball.vy *= this.friction;

      // Actualizar posición
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Colisiones con pines
      this.pins.forEach((pin) => {
        const dx = ball.x - pin.x;
        const dy = ball.y - pin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDist = this.pinRadius + this.ballRadius;
        
        if (distance < minDist) {
          // Normalizar vector de colisión
          const nx = dx / distance;
          const ny = dy / distance;
          
          // Separar la bola del pin
          ball.x = pin.x + nx * minDist;
          ball.y = pin.y + ny * minDist;
          
          // Calcular la velocidad relativa
          const dvx = ball.vx;
          const dvy = ball.vy;
          
          // Calcular el impulso
          const impulse = 2 * (dvx * nx + dvy * ny);
          
          // Aplicar el impulso con el factor de rebote
          ball.vx -= impulse * nx * this.bounceReduction;
          ball.vy -= impulse * ny * this.bounceReduction;
          
          // Añadir un poco de aleatoriedad horizontal para hacer el juego más interesante
          ball.vx += (Math.random() - 0.5) * 0.5;
        }
      });

      // Colisiones con los bordes
      if (ball.x - this.ballRadius < 0) {
        ball.x = this.ballRadius;
        ball.vx = Math.abs(ball.vx) * this.bounceReduction;
      } else if (ball.x + this.ballRadius > this.canvasWidth) {
        ball.x = this.canvasWidth - this.ballRadius;
        ball.vx = -Math.abs(ball.vx) * this.bounceReduction;
      }

      // Verificación de caída en un bucket
      if (ball.y > this.canvasHeight - this.ballRadius - this.buckets[0].height) {
        for (let i = 0; i < this.buckets.length; i++) {
          const bucket = this.buckets[i];
          if (ball.x >= bucket.x && ball.x < bucket.x + bucket.width) {
            const winAmount = this.amount * bucket.multiplier;
            this.lastWinAmount = winAmount;
            this.isWin = bucket.multiplier >= 1;
            this.balance += winAmount;
            this.updateBalanceInDatabase(winAmount);

            this.showWinIndicator = true;
            this.winIndicatorX = ball.x;
            this.winIndicatorY = ball.y - 30;

            bucket.isHit = true;
            setTimeout(() => {
              bucket.isHit = false;
            }, 300);

            this.balls.splice(index, 1);

            setTimeout(() => {
              this.showWinIndicator = false;
            }, 2000);

            // Registrar partida con PartidaService
            const beneficioPartida = winAmount - this.amount;
            const resultado = bucket.multiplier >= 1 ? 'victoria' : 'derrota';

            this.partidaService.finPartida(
              this.plinkoJuegoId,
              beneficioPartida,
              this.amount,
              resultado
            ).subscribe({
              next: (response) => {
                console.log('Partida de Plinko registrada correctamente:', response);
              },
              error: (error) => {
                console.error('Error al registrar la partida de Plinko:', error);
              }
            });

            break;
          }
        }
      }
    });

    // Si no quedan bolas, detener la animación
    if (this.balls.length === 0) {
      this.isPlaying = false;
    }
  }

  // Método para actualizar el saldo en la base de datos
  updateBalanceInDatabase(winAmount: number): void {
    this.saldoService.setSaldo(winAmount).subscribe({
      next: (response) => {
        console.log('Saldo actualizado correctamente:', response);
      },
      error: (error) => {
        console.error('Error al actualizar el saldo:', error);
      }
    });
  }

  animate(): void {
    this.update();
    this.draw();

    if (this.balls.length > 0 || this.isPlaying) {
      this.animationFrameId = requestAnimationFrame(() => this.animate());
    } else {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  dropBall(): void {
    if (this.amount <= 0) {
      alert('Por favor, establezca una cantidad de apuesta mayor que 0.');
      return;
    }

    if (this.amount > this.balance) {
      alert('Saldo insuficiente para esta apuesta.');
      return;
    }

    // Deducir cantidad de la apuesta del saldo
    this.balance -= this.amount;

    // Actualizar el saldo en la base de datos (deducción de la apuesta)
    this.saldoService.setSaldo(-this.amount).subscribe({
      next: (response) => {
        console.log('Saldo actualizado (apuesta deducida):', response);
      },
      error: (error) => {
        console.error('Error al actualizar el saldo (apuesta):', error);
      }
    });

    // Crear una nueva bola en la parte superior central con pequeña variación aleatoria
    const startX = this.canvasWidth / 2 + (Math.random() - 0.5) * 10; // Pequeña variación horizontal
    const startY = 50;

    this.balls.push({
      x: startX,
      y: startY,
      vx: (Math.random() - 0.5) * 0.5, // Pequeña velocidad horizontal inicial aleatoria
      vy: 0, // Empieza sin velocidad vertical (la gravedad se encargará)
      hasHitBucket: false
    });

    // Iniciar animación si aún no está en ejecución
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.animate();
    }
  }

  play(): void {
    this.dropBall();
  }

  setMode(mode: 'Manual' | 'Auto'): void {
    this.mode = mode;
  }

  setAmount(value: number): void {
    this.amount = value;
  }

  setHalfAmount(): void {
    this.amount = this.amount / 2;
  }

  setDoubleAmount(): void {
    this.amount = this.amount * 2;
  }
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hasHitBucket?: boolean;
}

interface Pin {
  x: number;
  y: number;
  radius: number;
}

interface Bucket {
  x: number;
  y: number;
  width: number;
  height: number;
  multiplier: number;
  color: string;
  isHit?: boolean;
}