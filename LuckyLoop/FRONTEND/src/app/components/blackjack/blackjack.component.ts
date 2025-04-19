import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlackjackService } from './blackjack.service';
import { SaldoService } from '../../services/saldo/saldo.service';
import { PartidaService } from '../../services/partida/partida.service';

@Component({
  selector: 'app-blackjack',
  templateUrl: './blackjack.component.html',
  styleUrls: ['./blackjack.component.css'],
  standalone: false
})
export class BlackjackComponent implements OnInit {

  constructor(
    public game: BlackjackService,
    private saldoService: SaldoService,
    private partidaService: PartidaService
  ) { }

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

    switch (button) {
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
  /**
 * Método para obtener las fichas consolidadas para visualización
 * Agrupa fichas del mismo valor y las muestra con contador
 */
  getConsolidatedChips(): { denom: number, count: number }[] {
    // Si no hay fichas, devolver array vacío
    if (this.game.currentBetChips.length === 0) return [];

    // Crear un mapa para contar fichas por denominación
    const chipCounts = new Map<number, number>();

    // Contar cada tipo de ficha
    for (const chip of this.game.currentBetChips) {
      const count = chipCounts.get(chip) || 0;
      chipCounts.set(chip, count + 1);
    }

    // Convertir el mapa a un array de objetos {denom, count}
    const result: { denom: number, count: number }[] = [];

    // Agregar denominaciones ordenadas de mayor a menor
    const denominations = [5000, 1000, 500, 100, 50, 20, 10, 5, 2, 1];

    for (const denom of denominations) {
      const count = chipCounts.get(denom);
      if (count) {
        result.push({ denom, count });
      }
    }

    return result;
  }

  /**
   * Método para ejecutar All In (apostar todo el saldo)
   */
  allIn(): void {
    if (this.game.gameInProgress || this.game.gameFinished || this.game.playerBalance <= 0) return;

    // Limpiar apuesta actual
    this.game.clearBet();

    // Establecer la apuesta al saldo total del jugador
    this.game.currentBet = this.game.playerBalance;

    // Representar la apuesta de manera eficiente con las denominaciones más altas posibles
    let remaining = this.game.playerBalance;
    this.game.currentBetChips = [];

    // Representar con denominaciones más altas primero
    const denominations = [5000, 1000, 500, 100, 50, 20, 10, 5, 2, 1];

    for (const denom of denominations) {
      while (remaining >= denom) {
        this.game.currentBetChips.push(denom);
        remaining -= denom;
      }
    }
  }
}