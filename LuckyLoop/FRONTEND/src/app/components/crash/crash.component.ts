import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';

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
  playerBalance: number = 1000.00;
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
  
  constructor() { }

  ngOnInit(): void {
    this.resetGame();
    this.calculatePotentialWin();
  }
  
  ngOnDestroy(): void {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
  }
  
  // Métodos para controles de apuesta
  setMode(mode: string): void {
    this.mode = mode;
  }
  
  halfBet(): void {
    this.betAmount = this.betAmount / 2;
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
    if (this.betAmount <= 0 || this.betAmount > this.playerBalance) {
      return;
    }
    
    this.playerBalance -= this.betAmount;
    this.isPlaying = true;
    this.hasCrashed = false;
    this.hasWon = false;
    this.multiplier = 1.00;
    this.startGame();
  }
  
  cashout(): void {
    if (!this.isPlaying || this.hasCrashed) {
      return;
    }
    
    this.isPlaying = false;
    this.hasWon = true;
    this.lastWinAmount = this.betAmount * this.multiplier;
    this.playerBalance += this.lastWinAmount;
    
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
    
    // Simular otros jugadores haciendo cashout
    this.simulateOtherPlayers();
  }
  
  resetGame(): void {
    this.chartPoints = [];
    this.multiplier = 1.00;
    this.hasCrashed = false;
    this.hasWon = false;
  }
  
  // Métodos de utilidad para formateo
  formatNumber(num: number): string {
    return num.toFixed(2).replace('.', ',');
  }
  
  // Métodos para generar datos aleatorios
  generateCrashTime(): number {
    // Simulación de un tiempo aleatorio para el crash
    return 1 + Math.random() * 15; // Entre 1 y 16 segundos
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

  /* datos del juego en la BD */
  





}