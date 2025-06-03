import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { take } from 'rxjs/operators';
import { SaldoService } from '../../services/saldo/saldo.service';
import { PartidaService } from '../../services/partida/partida.service';
import { JuegosService, Juego } from './../../services/juegos/juegos.service';
import { ActivatedRoute } from '@angular/router';

interface Player {
  name: string;
  amount: number;
  isActive: boolean;
}

@Component({
  selector: 'app-crash',
  standalone: false,
  templateUrl: './crash.component.html',
  styleUrl: './crash.component.css'
})

export class CrashComponent implements OnInit, OnDestroy {
  // Config básica
  mode: string = 'Manual';
  betAmount: number = 0;
  cashoutAt: number = 2.00;
  playerBalance: number = 0; // Ahora se carga desde el servicio
  potentialWin: number = 0;
  
  // Estado del juego
  isPlaying: boolean = false;
  hasCrashed: boolean = false;
  hasWon: boolean = false;
  multiplier: number = 1.00;
  crashMultiplier: number = 0;
  lastWinAmount: number = 0;
  
  // Configuración del gráfico
  @ViewChild('chartCanvas') chartCanvas?: ElementRef;
  svgWidth: number = 700;
  svgHeight: number = 400;
  padding = { top: 10, right: 10, bottom: 30, left: 50 };
  chartPoints: {x: number, y: number}[] = [];
  lineColor: string = '#00ff94';
  chartColor: string = 'rgba(0, 255, 148, 0.15)';
  multiplierPoints: number[] = [20, 15, 10, 5, 1];
  timePoints: number[] = [5, 10, 20, 30, 40];
  maxTime: number = 50;

  // Otros jugadores simulados
  otherPlayers: any[] = [
    { name: 'Usuario123', amount: 50.00 },
    { name: 'JugadorPro', amount: 120.00 },
    { name: 'GamerX', amount: -75.00 },
    { name: 'CrashMaster', amount: 230.00 }
  ];
  
  // Intervalo para actualizar la animación
  private gameInterval: any;
  
  // ID del juego de crash (ajusta según tu base de datos)
  private crashJuegoId: number = 0; // Asumiendo que crash tiene ID 2

  constructor(
    private saldoService: SaldoService,
    private partidaService: PartidaService,
    private juegosService: JuegosService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadUserBalance();
    this.resetGame();
    this.calculatePotentialWin();
    this.loadJuegoId();
  }



  
  ngOnDestroy(): void {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
  }



  loadJuegoId(): void {
    const currentPath = this.route.snapshot.routeConfig?.path || '';

    this.juegosService.getAllJuegos().pipe(take(1)).subscribe({
      next: (juegos) => {
        const juego = juegos.find(j => j.url?.replace('/', '') === currentPath);
        if (juego) {
          this.crashJuegoId = juego.id;
          console.log('ID dinámico asignado al juego:', this.crashJuegoId);
        } else {
          console.warn('No se encontró el ID del juego para la ruta:', currentPath);
        }
      },
      error: (error) => {
        console.error('Error al obtener la lista de juegos:', error);
      }
    });
  }

  // Cargar el saldo del usuario desde el servicio
  loadUserBalance(): void {
    // Obtener el saldo actual del usuario
    this.saldoService.getSaldo().pipe(take(1)).subscribe({
      next: (response) => {
        this.playerBalance = response.saldo || 0;
      },
      error: (error) => {
        console.error('Error al cargar saldo:', error);
        // En caso de error, mantener saldo en 0 y mostrar mensaje
        this.playerBalance = 0;
        alert('Error al cargar el saldo. Por favor, recarga la página.');
      }
    });
  }
  
  // Métodos para controles de apuesta
  setMode(mode: string): void {
    this.mode = mode;
  }
  
  halfBet(): void {
    this.betAmount = Math.floor(this.betAmount / 2);
    this.calculatePotentialWin();
  }
  
  doubleBet(): void {
    if (this.betAmount * 2 <= this.playerBalance) {
      this.betAmount = this.betAmount * 2;
    } else {
      this.betAmount = this.playerBalance;
    }
    this.calculatePotentialWin();
  }
  
  updateCashoutAt(value: number): void {
    if (value >= 1.01) {
      this.cashoutAt = Number(value.toFixed(2));
    }
  }
  
  calculatePotentialWin(): void {
    this.potentialWin = this.betAmount * this.multiplier;
  }
  
  // Métodos para el juego
  placeBet(): void {
    if (this.betAmount <= 0 || this.betAmount > this.playerBalance || this.isPlaying) {
      return;
    }
    
    // Actualizar el saldo restando la apuesta
    this.saldoService.setSaldo(-this.betAmount).pipe(take(1)).subscribe({
      next: (response) => {
        // Actualizar el saldo local con la respuesta del servidor
        this.playerBalance = response.nuevoSaldo;
        
        // Iniciar el juego
        this.isPlaying = true;
        this.hasCrashed = false;
        this.hasWon = false;
        this.multiplier = 1.00;
        this.startGame();
      },
      error: (error) => {
        // Mostrar mensaje si hay error
        console.error('Error al actualizar saldo:', error);
        if (error.error && error.error.message) {
          alert(error.error.message);
        } else {
          alert('No se pudo realizar la apuesta. Saldo insuficiente o error de conexión.');
        }
      }
    });
  }
  
  cashout(): void {
    if (!this.isPlaying || this.hasCrashed) {
      return;
    }
    
    this.isPlaying = false;
    this.hasWon = true;
    this.lastWinAmount = this.betAmount * this.multiplier;
    
    // Calcular ganancia neta
    const beneficioNeto = this.lastWinAmount - this.betAmount;
    
    // Actualizar saldo con las ganancias
    this.saldoService.setSaldo(this.lastWinAmount).pipe(take(1)).subscribe({
      next: (response) => {
        this.playerBalance = response.nuevoSaldo;
        
        // Registrar la partida como victoria
        this.registrarPartida('victoria', beneficioNeto);
      },
      error: (error) => {
        console.error('Error al actualizar ganancias:', error);
        alert('Error al procesar ganancias: ' + (error.error?.message || 'Error desconocido'));
      }
    });
    
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
  }
  
  startGame(): void {
    this.resetChartPoints();
    
    let timeElapsed = 0;
    const crashTime = this.generateCrashTime();
    
    this.gameInterval = setInterval(() => {
      timeElapsed += 0.1;
      
      // Actualizar multiplicador
      const newMultiplier = Math.pow(Math.E, 0.09 * timeElapsed);
      this.multiplier = parseFloat(newMultiplier.toFixed(2));
      this.potentialWin = this.betAmount * this.multiplier;
      
      // Añadir punto al gráfico
      this.chartPoints.push({
        x: timeElapsed,
        y: this.multiplier
      });
      
      // Auto-cashout en modo automático
      if (this.mode === 'Automático' && this.multiplier >= this.cashoutAt) {
        this.cashout();
      }
      
      // Verificar si es tiempo de crash
      if (timeElapsed >= crashTime) {
        this.crashGame(this.multiplier);
      }
    }, 100);
  }
  
  crashGame(crashAt: number): void {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
    
    this.hasCrashed = true;
    this.isPlaying = false;
    this.crashMultiplier = crashAt;
    
    // Si el juego terminó en crash y el jugador no hizo cashout, es una derrota
    if (!this.hasWon) {
      // Registrar la partida como derrota
      this.registrarPartida('derrota', -this.betAmount);
    }
    
    // Simular otros jugadores haciendo cashout
    this.simulateOtherPlayers();
  }

  // Registrar partida en la base de datos
  registrarPartida(resultado: string, beneficio: number): void {
    this.partidaService.finPartida(
      this.crashJuegoId,
      beneficio,
      this.betAmount,
      resultado
    ).pipe(take(1)).subscribe({
      next: (response) => {
        console.log('Partida de Crash registrada correctamente:', response);
      },
      error: (error) => {
        console.error('Error al registrar la partida de Crash:', error);
      }
    });
  }
  
  resetGame(): void {
    this.chartPoints = [];
    this.multiplier = 1.00;
    this.hasCrashed = false;
    this.hasWon = false;
    this.lastWinAmount = 0;
  }
  
  // Métodos de utilidad para formateo
  formatNumber(num: number): string {
    return num.toFixed(2).replace('.', ',');
  }
  
  // Métodos para generar datos aleatorios
  generateCrashTime(): number {
    // Simulación de un tiempo aleatorio para el crash
    // Usamos una distribución que favorece crashes más tempranos
    const random = Math.random();
    if (random < 0.3) {
      return 1 + Math.random() * 2; // 30% de crashes entre 1-3 segundos
    } else if (random < 0.6) {
      return 3 + Math.random() * 5; // 30% de crashes entre 3-8 segundos
    } else {
      return 8 + Math.random() * 12; // 40% de crashes entre 8-20 segundos
    }
  }
  
  simulateOtherPlayers(): void {
    // Simular otros jugadores para la interfaz
    this.otherPlayers = this.otherPlayers.map(player => {
      if (Math.random() > 0.5) {
        player.amount = parseFloat((Math.random() * 200).toFixed(2));
      } else {
        player.amount = -parseFloat((Math.random() * 100).toFixed(2));
      }
      return player;
    });
  }
  
  // Métodos para dibujar el gráfico
  resetChartPoints(): void {
    this.chartPoints = [{x: 0, y: 1}];
  }
  
  getPathData(): string {
    if (this.chartPoints.length === 0) {
      return '';
    }
    
    let pathData = '';
    
    this.chartPoints.forEach((point, index) => {
      const x = this.padding.left + (point.x / this.maxTime) * (this.svgWidth - this.padding.left - this.padding.right);
      const y = this.svgHeight - this.padding.bottom - ((point.y / 30) * (this.svgHeight - this.padding.top - this.padding.bottom));
      
      if (index === 0) {
        pathData += `M ${x},${y} `;
      } else {
        pathData += `L ${x},${y} `;
      }
    });
    
    return pathData;
  }
  
  getAreaPathData(): string {
    const pathData = this.getPathData();
    if (!pathData) {
      return '';
    }
    
    const lastPoint = this.chartPoints[this.chartPoints.length - 1];
    const lastX = this.padding.left + (lastPoint.x / this.maxTime) * (this.svgWidth - this.padding.left - this.padding.right);
    
    return `${pathData} L ${lastX},${this.svgHeight - this.padding.bottom} L ${this.padding.left},${this.svgHeight - this.padding.bottom} Z`;
  }
}