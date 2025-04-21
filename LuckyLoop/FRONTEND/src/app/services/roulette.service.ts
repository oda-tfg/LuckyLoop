// services/roulette.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Bet } from '../models/bet.model';
import { Chip } from '../models/chip.model';
import { GameState } from '../models/game-state.model';

@Injectable({
  providedIn: 'root'
})
export class RouletteService {
  // Números de la ruleta europea en el ORDEN CORRECTO (como en la imagen)
  private readonly numbers: number[] = [
    0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5, 10, 23, 8, 30, 11, 36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32
  ];

  // Colores de los números (excepto 0 que es verde)
  private readonly redNumbers: number[] = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

  // Estado inicial del juego
  private initialState: GameState = {
    balance: 1000, // Saldo inicial de 1000
    selectedChip: null,
    bets: [],
    lastWinningNumber: null,
    isSpinning: false
  };

  // Definición de fichas disponibles
  private availableChips: Chip[] = [
    { id: 1, value: 1, color: '#FFFFFF' },
    { id: 2, value: 5, color: '#FF0000' },
    { id: 3, value: 10, color: '#0000FF' },
    { id: 4, value: 25, color: '#00FF00' },
    { id: 5, value: 100, color: '#000000' }
  ];

  // BehaviorSubject para mantener el estado y notificar cambios
  private gameStateSubject = new BehaviorSubject<GameState>(this.initialState);
  
  // Observable público para que los componentes se suscriban
  public gameState$: Observable<GameState> = this.gameStateSubject.asObservable();

  constructor() { }

  // Obtener estado actual
  get currentState(): GameState {
    return this.gameStateSubject.getValue();
  }

  // Obtener fichas disponibles
  getAvailableChips(): Chip[] {
    return this.availableChips;
  }

  // Seleccionar una ficha
  selectChip(chip: Chip): void {
    const state = { ...this.currentState, selectedChip: chip };
    this.gameStateSubject.next(state);
  }

  // Realizar una apuesta
  placeBet(type: Bet['type'], numbers: number[]): void {
    if (!this.currentState.selectedChip || this.currentState.isSpinning) return;
    
    const chip = this.currentState.selectedChip;
    const chipValue = chip.value;
    
    // Verificar si hay saldo suficiente
    if (this.currentState.balance < chipValue) return;
    
    const state = { ...this.currentState };
    
    // Buscar si ya existe una apuesta para esta posición
    const existingBetIndex = state.bets.findIndex(bet => 
      bet.type === type && 
      JSON.stringify(bet.numbers.sort()) === JSON.stringify(numbers.sort())
    );
    
    if (existingBetIndex >= 0) {
      // Actualizar apuesta existente
      state.bets[existingBetIndex].chips.push({ ...chip });
      state.bets[existingBetIndex].totalAmount += chipValue;
    } else {
      // Crear nueva apuesta
      const newBet: Bet = {
        id: Date.now(), // ID único basado en timestamp
        type,
        numbers,
        chips: [{ ...chip }],
        totalAmount: chipValue
      };
      state.bets.push(newBet);
    }
    
    // Actualizar saldo
    state.balance -= chipValue;
    
    this.gameStateSubject.next(state);
  }

  // Girar la ruleta
  spinWheel(): void {
    if (this.currentState.isSpinning || this.currentState.bets.length === 0) return;
    
    const state = { ...this.currentState, isSpinning: true };
    this.gameStateSubject.next(state);
    
    // Simular giro (en una implementación real, esto sería más complejo con animaciones)
    setTimeout(() => {
      // Seleccionar un número aleatorio de la ruleta usando el orden correcto
      const winningNumberIndex = Math.floor(Math.random() * this.numbers.length);
      const winningNumber = this.numbers[winningNumberIndex];
      this.resolveRound(winningNumber);
    }, 5000); // 5 segundos para simular el giro
  }

  // Resolver la ronda y calcular ganancias
  private resolveRound(winningNumber: number): void {
    const state = { ...this.currentState, isSpinning: false, lastWinningNumber: winningNumber };
    
    // Determinar color del número ganador
    const isRed = this.redNumbers.includes(winningNumber);
    const isBlack = winningNumber !== 0 && !isRed;
    
    // Verificar cada apuesta y calcular ganancias
    state.bets.forEach(bet => {
      let win = false;
      let payoutMultiplier = 0;
      
      switch (bet.type) {
        case 'straight':
          win = bet.numbers.includes(winningNumber);
          payoutMultiplier = 35; // 35:1
          break;
        case 'split':
          win = bet.numbers.includes(winningNumber);
          payoutMultiplier = 17; // 17:1
          break;
        case 'street':
          win = bet.numbers.includes(winningNumber);
          payoutMultiplier = 11; // 11:1
          break;
        case 'corner':
          win = bet.numbers.includes(winningNumber);
          payoutMultiplier = 8; // 8:1
          break;
        case 'line':
          win = bet.numbers.includes(winningNumber);
          payoutMultiplier = 5; // 5:1
          break;
        case 'dozen':
          if (bet.numbers[0] === 1) win = winningNumber >= 1 && winningNumber <= 12;
          if (bet.numbers[0] === 13) win = winningNumber >= 13 && winningNumber <= 24;
          if (bet.numbers[0] === 25) win = winningNumber >= 25 && winningNumber <= 36;
          payoutMultiplier = 2; // 2:1
          break;
        case 'column':
          win = bet.numbers.includes(winningNumber);
          payoutMultiplier = 2; // 2:1
          break;
        case 'red':
          win = isRed;
          payoutMultiplier = 1; // 1:1
          break;
        case 'black':
          win = isBlack;
          payoutMultiplier = 1; // 1:1
          break;
        case 'even':
          win = winningNumber !== 0 && winningNumber % 2 === 0;
          payoutMultiplier = 1; // 1:1
          break;
        case 'odd':
          win = winningNumber !== 0 && winningNumber % 2 === 1;
          payoutMultiplier = 1; // 1:1
          break;
        case 'low':
          win = winningNumber >= 1 && winningNumber <= 18;
          payoutMultiplier = 1; // 1:1
          break;
        case 'high':
          win = winningNumber >= 19 && winningNumber <= 36;
          payoutMultiplier = 1; // 1:1
          break;
      }
      
      if (win) {
        const winAmount = bet.totalAmount * (payoutMultiplier + 1); // Apuesta original + ganancia
        state.balance += winAmount;
      }
    });
    
    // Limpiar apuestas
    state.bets = [];
    
    this.gameStateSubject.next(state);
  }

  // Reiniciar juego
  resetGame(): void {
    this.gameStateSubject.next(this.initialState);
  }
}