import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlackjackService } from './blackjack.service';
import { SaldoService } from '../../services/saldo/saldo.service';

@Component({
  selector: 'app-blackjack',
  templateUrl: './blackjack.component.html',
  styleUrls: ['./blackjack.component.css'],
  standalone: false
})
export class BlackjackComponent implements OnInit {
  
  constructor(public game: BlackjackService, private saldoService: SaldoService) {}

  ngOnInit(): void {
    // Obtener el saldo actual del usuario antes de iniciar el juego
    this.saldoService.getSaldo().subscribe({
      next: (response) => {
        if (response && response.saldo !== undefined) {
          this.game.playerBalance = response.saldo;
        }
        this.game.startNewGame();
      },
      error: (error) => {
        console.error('Error al obtener saldo:', error);
        // Iniciar el juego con el saldo predeterminado
        this.game.startNewGame();
      }
    });
  }

  dealCards(): void {
    if (this.game.currentBet <= 0) {
      alert('Por favor, coloca una apuesta primero');
      return;
    }
    
    if (this.game.currentBet > this.game.playerBalance) {
      alert('No tienes suficiente saldo para esta apuesta');
      return;
    }
    
    this.game.dealCards();
  }

  playerHit(): void {
    if (!this.game.gameInProgress || this.game.handCompleted) return;
    this.game.playerHit();
  }

  playerStand(): void {
    if (!this.game.gameInProgress || this.game.handCompleted) return;
    this.game.playerStand();
  }

  playerDoubleDown(): void {
    if (!this.game.gameInProgress || !this.game.canDoubleDown || this.game.handCompleted) return;
    
    if (this.game.playerBalance < this.game.playerBets[this.game.currentHandIndex]) {
      alert('No tienes suficiente saldo para doblar');
      return;
    }
    
    this.game.playerDoubleDown();
  }

  playerSplit(): void {
    if (!this.game.gameInProgress || !this.game.canSplit || this.game.handCompleted) return;
    
    if (this.game.playerBalance < this.game.playerBets[this.game.currentHandIndex]) {
      alert('No tienes suficiente saldo para dividir');
      return;
    }
    
    this.game.playerSplit();
  }

  addChip(value: number): void {
    if (this.game.gameInProgress) return;
    
    // Verificar si el jugador tiene suficiente saldo para agregar esta ficha
    if (value > this.game.playerBalance || (value + this.game.currentBet) > this.game.playerBalance) {
      return; // Simplemente no hacer nada en lugar de mostrar una alerta
    }
    
    this.game.addChip(value);
  }

  clearBet(): void {
    if (this.game.gameInProgress) return;
    this.game.clearBet();
  }

  startNewGame(): void {
    // Solo permitir iniciar un nuevo juego si no hay uno en progreso
    if (!this.game.gameInProgress) {
      // Refrescar el saldo del usuario antes de iniciar un nuevo juego
      this.saldoService.getSaldo().subscribe({
        next: (response) => {
          if (response && response.saldo !== undefined) {
            this.game.playerBalance = response.saldo;
          }
          this.game.startNewGame();
        },
        error: (error) => {
          console.error('Error al obtener saldo:', error);
          // Iniciar el juego con el saldo actual
          this.game.startNewGame();
        }
      });
    }
  }

  // Track cards by index for better performance with ngFor
  trackByFn(index: number): number {
    return index;
  }

  // Helper method to generate array for ngFor based on object length
  getHandsArray(): number[] {
    return Array(this.game.playerHands.length).fill(0).map((_, i) => i);
  }

  // Take insurance
  takeInsurance(): void {
    this.game.takeInsurance();
  }
  
  // Decline insurance
  declineInsurance(): void {
    this.game.declineInsurance();
  }

  // Method to check if button should be disabled
  isDisabled(button: string): boolean {
    // During animations, disable all gameplay buttons
    if (this.game.dealingInProgress || this.game.dealerPlayInProgress || this.game.shufflingDeck || this.game.showInsuranceDialog) {
      return true;
    }
    
    switch(button) {
      case 'deal':
        return this.game.gameInProgress || this.game.gameFinished;
      case 'hit':
        return !this.game.gameInProgress || this.game.handCompleted;
      case 'stand':
        return !this.game.gameInProgress || this.game.handCompleted;
      case 'double':
        return !this.game.gameInProgress || !this.game.canDoubleDown || this.game.handCompleted;
      case 'split':
        return !this.game.gameInProgress || !this.game.canSplit || this.game.handCompleted;
      case 'chip':
        return this.game.gameInProgress || this.game.gameFinished;
      case 'clear':
        return this.game.gameInProgress || this.game.gameFinished;
      case 'new':
        return this.game.gameInProgress;
      default:
        return false;
    }
  }
}