// ruleta.component.ts
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-ruleta',
  templateUrl: './ruleta.component.html',
  standalone: false,
  styleUrls: ['./ruleta.component.css']
})
export class RuletaComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('wheel') wheelRef!: ElementRef<HTMLDivElement>;
  @ViewChild('ball') ballRef!: ElementRef<HTMLDivElement>;
  
  numbers: number[] = [];
  selectedNumber: number | null = null;
  isSpinning: boolean = false;
  betAmount: number = 5;
  balance: number = 1000;
  lastResults: number[] = [];
  
  // Colores de la ruleta (rojo, negro, verde para el 0)
  colors: { [key: number]: string } = {};
  
  // Propiedades para el sistema de fichas
  selectedChip: number = 5;
  availableChips: number[] = [1, 5, 10, 25, 100];
  bettingBoard: { [key: string]: number } = {};
  
  // Tipos de apuestas
  betTypes: { [key: string]: { label: string, payout: number, numbers: number[] } } = {};
  
  // Variable para mostrar/ocultar instrucciones
  showInstructions: boolean = false;
  
  constructor() {
    // Números del 0 al 36
    this.numbers = Array.from({ length: 37 }, (_, i) => i);
    
    // Configurar colores (rojo/negro, 0 es verde)
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    
    this.numbers.forEach(num => {
      if (num === 0) {
        this.colors[num] = '#008000'; // Verde para el 0
      } else if (redNumbers.includes(num)) {
        this.colors[num] = '#e81c1c'; // Rojo
      } else {
        this.colors[num] = '#000000'; // Negro
      }
    });
    
    // Inicializar tipos de apuestas
    this.initBetTypes();
  }

  // Manejar el tamaño del canvas cuando cambia el tamaño de la ventana
  @HostListener('window:resize', ['$event'])
  onResize() {
    if (this.canvasRef && this.canvasRef.nativeElement) {
      this.drawRouletteWheel();
    }
  }

  initBetTypes(): void {
    // Apuestas a números individuales
    this.numbers.forEach(num => {
      this.betTypes[`number_${num}`] = {
        label: num.toString(),
        payout: 35,
        numbers: [num]
      };
    });

    // Apuestas a color
    this.betTypes['red'] = {
      label: 'Rojo',
      payout: 1,
      numbers: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
    };
    
    this.betTypes['black'] = {
      label: 'Negro',
      payout: 1,
      numbers: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]
    };

    // Apuestas a par/impar
    this.betTypes['even'] = {
      label: 'Par',
      payout: 1,
      numbers: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36]
    };
    
    this.betTypes['odd'] = {
      label: 'Impar',
      payout: 1,
      numbers: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35]
    };

    // Apuestas a rangos
    this.betTypes['low'] = {
      label: '1-18',
      payout: 1,
      numbers: Array.from({ length: 18 }, (_, i) => i + 1)
    };
    
    this.betTypes['high'] = {
      label: '19-36',
      payout: 1,
      numbers: Array.from({ length: 18 }, (_, i) => i + 19)
    };

    // Apuestas a docenas
    this.betTypes['first_dozen'] = {
      label: '1ª Docena',
      payout: 2,
      numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    };
    
    this.betTypes['second_dozen'] = {
      label: '2ª Docena',
      payout: 2,
      numbers: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
    };
    
    this.betTypes['third_dozen'] = {
      label: '3ª Docena',
      payout: 2,
      numbers: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]
    };

    // Apuestas a columnas
    this.betTypes['first_column'] = {
      label: '1ª Columna',
      payout: 2,
      numbers: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]
    };
    
    this.betTypes['second_column'] = {
      label: '2ª Columna',
      payout: 2,
      numbers: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35]
    };
    
    this.betTypes['third_column'] = {
      label: '3ª Columna',
      payout: 2,
      numbers: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36]
    };
  }

  resetBets(): void {
    this.bettingBoard = {};
    Object.keys(this.betTypes).forEach(betType => {
      this.bettingBoard[betType] = 0;
    });
  }

  getTotalBets(): number {
    const values = Object.values(this.bettingBoard);
    if (values.length === 0) return 0;
    return values.reduce((sum, bet) => sum + bet, 0);
  }

  placeBet(betType: string): void {
    if (this.isSpinning || this.selectedChip > this.balance) {
      return;
    }
    
    this.bettingBoard[betType] = (this.bettingBoard[betType] || 0) + this.selectedChip;
    this.balance -= this.selectedChip;
  }

  removeBet(betType: string): void {
    if (this.isSpinning || !this.bettingBoard[betType] || this.bettingBoard[betType] === 0) {
      return;
    }
    
    const chipValue = Math.min(this.selectedChip, this.bettingBoard[betType]);
    this.bettingBoard[betType] -= chipValue;
    this.balance += chipValue;
  }

  selectChip(value: number): void {
    if (!this.isSpinning) {
      this.selectedChip = value;
    }
  }

  ngOnInit(): void {
    // Inicializar tablero de apuestas
    this.resetBets();
  }

  ngAfterViewInit(): void {
    this.drawRouletteWheel();
  }

  drawRouletteWheel(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuración de la ruleta
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const arc = 2 * Math.PI / this.numbers.length;

    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar los sectores
    for (let i = 0; i < this.numbers.length; i++) {
      const angle = i * arc;
      const num = this.numbers[i];

      // Dibujar el sector
      ctx.beginPath();
      ctx.fillStyle = this.colors[num];
      ctx.arc(centerX, centerY, radius, angle, angle + arc);
      ctx.lineTo(centerX, centerY);
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dibujar los números
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(num.toString(), radius * 0.75, 0);
      ctx.restore();
    }

    // Dibujar el círculo central
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#8B4513'; // Marrón para simular madera
    ctx.fill();
    ctx.strokeStyle = 'gold';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Añadir brillo y efectos visuales
    ctx.beginPath();
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Dibujar divisiones metálicas más detalladas
    for (let i = 0; i < this.numbers.length; i++) {
      const angle = i * arc;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle)
      );
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // Añadir efecto de reflejo en la parte superior
    ctx.beginPath();
    const highlightGradient = ctx.createLinearGradient(
      centerX - radius, centerY - radius,
      centerX + radius, centerY + radius
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = highlightGradient;
    ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 0.6);
  }

  spin(): void {
    if (this.isSpinning || this.getTotalBets() === 0) return;
    
    this.isSpinning = true;
    this.selectedNumber = null;
    
    // Obtener un número aleatorio de vueltas (entre 2 y 5)
    const rounds = 2 + Math.random() * 3;
    
    // Obtener un número aleatorio (0-36)
    const winningNumber = Math.floor(Math.random() * 37);
    
    // Calcular el ángulo de rotación
    const arc = 2 * Math.PI / this.numbers.length;
    const wheelIndex = this.numbers.indexOf(winningNumber);
    
    // El ángulo final debe incluir varias vueltas completas más el ángulo correspondiente al número ganador
    const stopAngle = rounds * 2 * Math.PI + (this.numbers.length - wheelIndex) * arc;
    
    // Animar la ruleta
    this.animateWheel(stopAngle, winningNumber);
    
    // Reproducir sonido de ruleta (si está disponible en el proyecto)
    this.playSound('roulette-spin');
  }

  animateWheel(stopAngle: number, winningNumber: number): void {
    const wheel = this.wheelRef.nativeElement;
    wheel.style.transition = `transform 5s cubic-bezier(0.17, 0.67, 0.83, 0.67)`;
    wheel.style.transform = `rotate(${stopAngle}rad)`;
    
    // Activar la animación de la bola si existe la referencia
    if (this.ballRef) {
      const ball = this.ballRef.nativeElement;
      ball.classList.add('visible');
      ball.classList.add('spinning');
      
      // Reiniciar la animación para que se vea cada vez
      ball.style.animation = 'none';
      setTimeout(() => {
        ball.style.animation = 'ballSpin 5s cubic-bezier(0.33, 0.82, 0.8, 0.99)';
      }, 10);
    }
    
    // Cuando la animación termine, mostrar resultado
    setTimeout(() => {
      this.isSpinning = false;
      this.selectedNumber = winningNumber;
      this.lastResults.unshift(winningNumber);
      if (this.lastResults.length > 10) {
        this.lastResults.pop();
      }
      
      // Reproducir sonido del resultado
      this.playSound('roulette-ball-drop');
      
      // Calcular ganancias
      this.calculateWinnings(winningNumber);
      
      // Ocultar la bola al terminar
      if (this.ballRef) {
        const ball = this.ballRef.nativeElement;
        ball.classList.remove('spinning');
      }
      
    }, 5000); // 5 segundos, igual que la duración de la animación
  }

  calculateWinnings(winningNumber: number): void {
    let totalWinnings = 0;
    
    // Verificar todas las apuestas para ver cuáles ganaron
    Object.keys(this.bettingBoard).forEach(betType => {
      const betAmount = this.bettingBoard[betType];
      
      if (betAmount > 0 && this.betTypes[betType]) {
        // Verificar si el número ganador está en los números de esta apuesta
        if (this.betTypes[betType].numbers.includes(winningNumber)) {
          const payout = this.betTypes[betType].payout;
          const winnings = betAmount * (payout + 1); // Pago + devolución de la apuesta
          this.balance += winnings;
          totalWinnings += winnings - betAmount; // Solo contamos las ganancias netas
        }
      }
    });
    
    // Si hubo ganancias, reproducir sonido de victoria
    if (totalWinnings > 0) {
      this.playSound('win-sound');
    }
    
    // Restablecer las apuestas
    this.resetBets();
  }

  // Método para reproducir sonidos (implementar si se desea agregar sonidos)
  playSound(soundName: string): void {
    try {
      // Comprobar si el navegador soporta el API de Audio
      const audio = new Audio(`assets/sounds/${soundName}.mp3`);
      audio.volume = 0.5; // Volumen al 50%
      audio.play().catch(e => {
        // Silenciar errores si el navegador bloquea la reproducción automática
        console.log('No se pudo reproducir el sonido:', e);
      });
    } catch (error) {
      // Silenciar errores si no se puede cargar el sonido
    }
  }

  changeBetAmount(amount: number): void {
    this.betAmount = Math.max(1, this.betAmount + amount);
  }

  resetGame(): void {
    this.balance = 1000;
    this.lastResults = [];
    this.selectedNumber = null;
    this.resetBets();
    this.betAmount = 5;
    this.playSound('chip-stack');
  }
}