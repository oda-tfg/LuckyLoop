// plinko.component.ts
import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-plinko',
  standalone: false,
  templateUrl: './plinko.component.html',
  styleUrls: ['./plinko.component.css']
})
export class PlinkoComponent implements AfterViewInit {
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
  
  // Configuración de física para dificultar llegar a los extremos
  gravity: number = 0.2;        // Mayor gravedad = menos tiempo para desplazamiento lateral
  bounceReduction: number = 0.8; // Menor conservación de energía en rebotes
  
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
    for (let row = 0; row < this.rows; row++) {
      const pinCount = row + 1;
      const rowWidth = pinCount * horizontalSpacing;
      const startX = (this.canvasWidth - rowWidth) / 2 + horizontalSpacing / 2;
      
      for (let i = 0; i < pinCount; i++) {
        // Añadimos más pines en los laterales de las filas inferiores para dificultar llegar a extremos
        if (row > this.rows / 2) {
          this.pins.push({
            x: startX + i * horizontalSpacing,
            y: 100 + row * verticalSpacing,
            radius: this.pinRadius
          });
          
          // En filas más bajas, añadimos pines adicionales en los extremos
          if ((i === 0 || i === pinCount - 1) && row > this.rows * 0.7) {
            const offsetX = (i === 0) ? -horizontalSpacing * 0.3 : horizontalSpacing * 0.3;
            this.pins.push({
              x: startX + i * horizontalSpacing + offsetX,
              y: 100 + row * verticalSpacing - verticalSpacing * 0.3,
              radius: this.pinRadius
            });
          }
        } else {
          this.pins.push({
            x: startX + i * horizontalSpacing,
            y: 100 + row * verticalSpacing,
            radius: this.pinRadius
          });
        }
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
  
  update(): void {
    // Actualizar posiciones de las bolas
    this.balls.forEach((ball, index) => {
      // Aplicar gravedad
      ball.vy += this.gravity;
      
      // Actualizar posición
      ball.x += ball.vx;
      ball.y += ball.vy;
      
      // Comprobar colisiones con pines
      this.pins.forEach(pin => {
        const dx = ball.x - pin.x;
        const dy = ball.y - pin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.ballRadius + pin.radius) {
          // Calcular respuesta de colisión
          const angle = Math.atan2(dy, dx);
          const targetX = pin.x + Math.cos(angle) * (this.ballRadius + pin.radius);
          const targetY = pin.y + Math.sin(angle) * (this.ballRadius + pin.radius);
          
          // Ajustar posición para evitar superposición
          ball.x = targetX;
          ball.y = targetY;
          
          // Reflejar velocidad
          const dot = ball.vx * Math.cos(angle) + ball.vy * Math.sin(angle);
          ball.vx -= 2 * dot * Math.cos(angle);
          ball.vy -= 2 * dot * Math.sin(angle);
          
          // Aplicar reducción de rebote
          ball.vx *= this.bounceReduction;
          ball.vy *= this.bounceReduction;
          
          // Aleatoriedad más controlada para las filas inferiores
          // Menor random factor = menos probabilidades de movimientos laterales extremos
          const randomFactor = Math.min(0.5, (this.canvasHeight - ball.y) / this.canvasHeight);
          ball.vx += (Math.random() - 0.5) * 0.6 * randomFactor;
        }
      });
      
      // Comprobar si la bola llegó al fondo
      if (ball.y > this.canvasHeight - this.ballRadius - this.buckets[0].height) {
        // Encontrar en qué bucket cayó la bola
        for (let i = 0; i < this.buckets.length; i++) {
          const bucket = this.buckets[i];
          if (ball.x >= bucket.x && ball.x < bucket.x + bucket.width) {
            // La bola cayó en este bucket
            const winAmount = this.amount * bucket.multiplier;
            this.lastWinAmount = winAmount;
            this.isWin = bucket.multiplier >= 1;
            
            // Actualizar saldo
            this.balance += winAmount;
            
            // Mostrar indicador de ganancia
            this.showWinIndicator = true;
            this.winIndicatorX = ball.x;
            this.winIndicatorY = ball.y - 30;
            
            // Animar el bucket
            bucket.isHit = true;
            setTimeout(() => {
              bucket.isHit = false;
            }, 300);
            
            // Eliminar la bola inmediatamente al tocar el multiplicador
            this.balls.splice(index, 1);
            
            // Ocultar indicador después de 2 segundos
            setTimeout(() => {
              this.showWinIndicator = false;
            }, 2000);
            
            break;
          }
        }
      }
      
      // Comprobar límites laterales
      if (ball.x < this.ballRadius) {
        ball.x = this.ballRadius;
        ball.vx = -ball.vx * this.bounceReduction;
      } else if (ball.x > this.canvasWidth - this.ballRadius) {
        ball.x = this.canvasWidth - this.ballRadius;
        ball.vx = -ball.vx * this.bounceReduction;
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
    
    // Crear una nueva bola en la parte superior central
    const startX = this.canvasWidth / 2;
    const startY = 50;
    
    this.balls.push({
      x: startX,
      y: startY,
      vx: 0,
      vy: 0,
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
  
  // Ya no hay función setRisk porque eliminamos las opciones de riesgo
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