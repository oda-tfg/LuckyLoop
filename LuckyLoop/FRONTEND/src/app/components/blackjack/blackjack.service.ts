import { Injectable } from '@angular/core';
import * as _ from 'underscore';
import { take } from 'rxjs/operators';
import { SaldoService } from '../../services/saldo/saldo.service';
import { PartidaService } from '../../services/partida/partida.service';
import { JuegosService, Juego } from './../../services/juegos/juegos.service';
import { ActivatedRoute } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class BlackjackService {
  // Game variables
  deck: string[] = [];
  playerHands: string[][] = [[]]; // Array of hands (for splitting)
  currentHandIndex: number = 0;
  dealerCards: string[] = [];
  playerScores: number[] = [0]; // Scores for each hand
  dealerScore: number = 0;
  currentBet: number = 0;
  playerBets: number[] = [0]; // Bets for each hand
  playerBalance: number = 1000;
  gameInProgress: boolean = false;
  gameFinished: boolean = false; // New property to track when a game is completed
  playerWins: number = 0;
  playerLosses: number = 0;
  playerPushes: number = 0;
  playerStood: boolean = false;
  handCompleted: boolean = false;
  canSplit: boolean = false;
  canDoubleDown: boolean = false;
  showDealerCards: boolean = false;
  handResults: Record<number, string> = {};
  resultMessage: string = '';
  resultType: string = '';
  showResult: boolean = false;
  currentBetChips: number[] = [];

  // Animation control variables
  dealingInProgress: boolean = false;
  cardBeingDealt: { type: string, handIndex: number, cardIndex: number } | null = null;
  dealerPlayInProgress: boolean = false;
  currentDealerCardIndex: number = -1;
  shufflingDeck: boolean = false;

  // Insurance variables
  insuranceAvailable: boolean = false;
  insuranceBet: number = 0;
  showInsuranceDialog: boolean = false;

  // ID del juego de blackjack (ajusta según tu base de datos)
  private blackjackJuegoId: number = 0;

  constructor(
    private saldoService: SaldoService,
    private partidaService: PartidaService,
    private juegosService: JuegosService,
    private route: ActivatedRoute
  ) {
    // Obtener saldo inicial del usuario
    this.loadUserBalance();
    this.loadJuegoId();
  }

  loadJuegoId(): void {
    const currentPath = this.route.snapshot.routeConfig?.path || '';

    this.juegosService.getAllJuegos().pipe(take(1)).subscribe({
      next: (juegos) => {
        const juego = juegos.find(j => j.url?.replace('/', '') === currentPath);
        if (juego) {
          this.blackjackJuegoId = juego.id;
          console.log('ID dinámico asignado al juego:', this.blackjackJuegoId);
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
    // Esta función simula la carga del saldo del usuario
    // En una implementación real, aquí consultarías el saldo del usuario mediante API
    // Por ahora mantenemos el saldo inicial en 1000 como estaba
  }

  // Create a deck of cards
  createDeck(): string[] {
    const suits = ["C", "D", "H", "S"];
    const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const newDeck: string[] = [];

    for (const suit of suits) {
      for (const value of values) {
        newDeck.push(`${value}${suit}`);
      }
    }

    return _.shuffle(newDeck);
  }

  // Calculate the score of a hand
  calculateScore(cards: string[]): number {
    let score = 0;
    let aces = 0;

    for (const card of cards) {
      const value = card.slice(0, -1);

      if (value === 'A') {
        aces++;
        score += 11;
      } else if (['K', 'Q', 'J'].includes(value)) {
        score += 10;
      } else {
        score += parseInt(value);
      }
    }

    // Adjust for aces
    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }

    return score;
  }

  // Get dealer's first card score for display
  getDealerFirstCardScore(): number {
    if (!this.dealerCards.length) return 0;

    const firstCardValue = this.dealerCards[0].slice(0, -1);
    let firstCardScore = 0;

    if (firstCardValue === 'A') {
      firstCardScore = 11;
    } else if (['K', 'Q', 'J'].includes(firstCardValue)) {
      firstCardScore = 10;
    } else {
      firstCardScore = parseInt(firstCardValue);
    }

    return firstCardScore;
  }

  // Start a new game - versión simplificada
  startNewGame(): void {
    // Reiniciar juego inmediatamente sin animación de barajado
    this.deck = this.createDeck();
    this.playerHands = [[]];
    this.currentHandIndex = 0;
    this.dealerCards = [];
    this.playerScores = [0];
    this.dealerScore = 0;
    this.playerBets = [0];
    this.playerStood = false;
    this.handCompleted = false;
    this.gameInProgress = false;
    this.gameFinished = false; // Reset the game finished flag
    this.canSplit = false;
    this.canDoubleDown = false;
    this.showDealerCards = false;
    this.handResults = {};
    this.showResult = false;
    this.dealingInProgress = false;
    this.cardBeingDealt = null;
    this.dealerPlayInProgress = false;
    this.currentDealerCardIndex = -1;
    this.shufflingDeck = false;

    // Reset insurance variables
    this.insuranceAvailable = false;
    this.insuranceBet = 0;
    this.showInsuranceDialog = false;

    // Clear any existing bet display
    this.currentBetChips = [];
  }

  // Deal cards with animation (versión simplificada)
  dealCards(): void {
    this.gameInProgress = true;

    // Actualizar el saldo a través del servicio (restar apuesta)
    const betAmount = -this.currentBet; // Negativo para restar

    this.saldoService.setSaldo(betAmount).pipe(take(1)).subscribe({
      next: (response) => {
        // Actualizar el saldo local con la respuesta del servidor
        this.playerBalance = response.nuevoSaldo;

        // Continuar con el reparto de cartas
        this.playerBets[0] = this.currentBet;

        // Deal initial cards
        this.playerHands[0] = [];
        this.dealerCards = [];

        // Set up dealing animation sequence - más rápido para evitar lags
        this.dealingInProgress = true;

        // Deal all cards at once pero mostrando animación
        this.playerHands[0].push(this.deck.pop()!);
        this.dealerCards.push(this.deck.pop()!);
        this.playerHands[0].push(this.deck.pop()!);
        this.dealerCards.push(this.deck.pop()!);

        // Indicar cuál es la carta que se está repartiendo para la animación
        this.cardBeingDealt = { type: 'all', handIndex: 0, cardIndex: -1 };

        // Calculate scores
        this.playerScores[0] = this.calculateScore(this.playerHands[0]);
        this.dealerScore = this.calculateScore(this.dealerCards);

        // Quitar animación tras un breve tiempo
        setTimeout(() => {
          this.dealingInProgress = false;
          this.cardBeingDealt = null;

          // Check if insurance is available (dealer first card is Ace)
          if (this.dealerCards[0].startsWith('A')) {
            this.insuranceAvailable = true;
            this.showInsuranceDialog = true;
            // The game will wait for player's decision on insurance
            return;
          }

          this.proceedAfterInsuranceDecision();
        }, 300); // Tiempo reducido para mayor fluidez
      },
      error: (error) => {
        // Mostrar mensaje si hay error
        console.error('Error al actualizar saldo:', error);
        if (error.error && error.error.message) {
          alert(error.error.message);
        } else {
          alert('No se pudo actualizar el saldo. Inténtalo de nuevo.');
        }

        // Cancelar el inicio del juego
        this.gameInProgress = false;
      }
    });
  }

  // Method to handle the game logic after insurance decision
  proceedAfterInsuranceDecision(): void {
    this.showInsuranceDialog = false;

    // Check for blackjack
    if (this.playerScores[0] === 21) {
      if (this.dealerScore === 21) {
        // Both have blackjack - Push
        this.endGame('push');
      } else {
        // Player has blackjack - Win 1.5x bet
        this.endGame('blackjack');
      }
    } else {
      // Check if double down is possible (always possible with initial hand)
      this.canDoubleDown = true;

      // Check if split is possible (same value cards)
      const card1Value = this.getCardValue(this.playerHands[0][0]);
      const card2Value = this.getCardValue(this.playerHands[0][1]);

      this.canSplit = (card1Value === card2Value && this.playerBalance >= this.currentBet);
    }
  }

  // Player takes insurance
  takeInsurance(): void {
    if (!this.insuranceAvailable) return;

    // Insurance bet is half the original bet
    const insuranceAmount = Math.floor(this.currentBet / 2);

    // Deduct insurance amount using the service
    this.saldoService.setSaldo(-insuranceAmount).pipe(take(1)).subscribe({
      next: (response) => {
        // Update local balance
        this.playerBalance = response.nuevoSaldo;
        this.insuranceBet = insuranceAmount;

        // Now check if dealer has blackjack
        if (this.dealerScore === 21) {
          // Dealer has blackjack, insurance pays 2:1
          const winAmount = this.insuranceBet * 3; // Return bet plus 2x win

          // Add the win amount to the balance
          this.saldoService.setSaldo(winAmount).pipe(take(1)).subscribe({
            next: (response) => {
              this.playerBalance = response.nuevoSaldo;

              // Show dealer's cards
              this.showDealerCards = true;

              setTimeout(() => {
                alert('¡El crupier tiene Blackjack! El seguro paga 2:1');

                // End the game according to player's hand
                if (this.playerScores[0] === 21) {
                  // Player also has blackjack - Push
                  this.endGame('push');
                } else {
                  // Player doesn't have blackjack - Lose, but recovered with insurance
                  this.endGame('lose');
                }
              }, 500);
            },
            error: (error) => {
              console.error('Error al añadir ganancias del seguro:', error);
              alert('Error al procesar ganancias del seguro');
            }
          });
        } else {
          // Dealer doesn't have blackjack, insurance is lost
          setTimeout(() => {
            alert('El crupier no tiene Blackjack. Pierdes el seguro.');
            this.proceedAfterInsuranceDecision();
          }, 500);
        }
      },
      error: (error) => {
        console.error('Error al procesar el seguro:', error);
        alert('No se pudo procesar el seguro: ' + (error.error?.message || 'Error desconocido'));
        this.declineInsurance();
      }
    });
  }

  // Player declines insurance
  declineInsurance(): void {
    this.insuranceAvailable = false;
    this.insuranceBet = 0;
    this.proceedAfterInsuranceDecision();
  }

  // Get card value (for determining split capability)
  getCardValue(card: string): number {
    const value = card.slice(0, -1);
    if (['K', 'Q', 'J', '10'].includes(value)) {
      return 10;
    } else if (value === 'A') {
      return 11;
    } else {
      return parseInt(value);
    }
  }

  // Player hits - versión simplificada
  playerHit(): void {
    if (!this.gameInProgress || this.handCompleted || this.dealingInProgress) return;

    // Draw card with animation - más simple
    this.dealingInProgress = true;

    // Add new card
    this.playerHands[this.currentHandIndex].push(this.deck.pop()!);
    this.cardBeingDealt = {
      type: 'player',
      handIndex: this.currentHandIndex,
      cardIndex: this.playerHands[this.currentHandIndex].length - 1
    };

    // Calculate new score
    this.playerScores[this.currentHandIndex] = this.calculateScore(this.playerHands[this.currentHandIndex]);

    // After hitting, can't double down anymore
    this.canDoubleDown = false;

    // After hitting, can't split anymore
    this.canSplit = false;

    // Wait for animation to complete - tiempo reducido
    setTimeout(() => {
      this.dealingInProgress = false;
      this.cardBeingDealt = null;

      // Check for bust
      if (this.playerScores[this.currentHandIndex] > 21) {
        if (this.playerHands.length > 1 && this.currentHandIndex < this.playerHands.length - 1) {
          // If multiple hands and not the last one, move to next hand
          this.completeCurrentHand('bust');
        } else {
          // If it's the last or only hand, end the game
          this.endGame('bust');
        }
      }
    }, 300);
  }

  // Player stands
  playerStand(): void {
    if (!this.gameInProgress || this.handCompleted) return;

    if (this.playerHands.length > 1 && this.currentHandIndex < this.playerHands.length - 1) {
      // If multiple hands and not the last one, move to next hand
      this.completeCurrentHand('stand');
    } else {
      // If it's the last or only hand, dealer's turn
      this.playerStood = true;
      this.handCompleted = true;

      // Reveal dealer's hidden card
      this.showDealerCards = true;

      // Dealer draws cards
      this.dealerTurn();
    }
  }

  // Player doubles down - versión simplificada
  playerDoubleDown(): void {
    if (!this.gameInProgress || !this.canDoubleDown || this.handCompleted || this.dealingInProgress) return;

    // Double the bet using the service
    const doubleBetAmount = -this.playerBets[this.currentHandIndex];

    this.saldoService.setSaldo(doubleBetAmount).pipe(take(1)).subscribe({
      next: (response) => {
        // Update local balance
        this.playerBalance = response.nuevoSaldo;

        // Update the bet amount
        this.playerBets[this.currentHandIndex] *= 2;

        // Draw one more card with animation simplificada
        this.dealingInProgress = true;

        // Add new card
        this.playerHands[this.currentHandIndex].push(this.deck.pop()!);
        this.cardBeingDealt = {
          type: 'player',
          handIndex: this.currentHandIndex,
          cardIndex: this.playerHands[this.currentHandIndex].length - 1
        };

        // Calculate new score
        this.playerScores[this.currentHandIndex] = this.calculateScore(this.playerHands[this.currentHandIndex]);

        // Wait for animation to complete - tiempo reducido
        setTimeout(() => {
          this.dealingInProgress = false;
          this.cardBeingDealt = null;

          // Check for bust
          if (this.playerScores[this.currentHandIndex] > 21) {
            if (this.playerHands.length > 1 && this.currentHandIndex < this.playerHands.length - 1) {
              // If multiple hands and not the last one, move to next hand
              this.completeCurrentHand('bust');
            } else {
              // If it's the last or only hand, end the game
              this.endGame('bust');
            }
          } else {
            // Automatically stand after doubling down
            if (this.playerHands.length > 1 && this.currentHandIndex < this.playerHands.length - 1) {
              this.completeCurrentHand('stand');
            } else {
              this.playerStood = true;
              this.handCompleted = true;

              // Reveal dealer's hidden card
              this.showDealerCards = true;

              // Dealer draws cards
              this.dealerTurn();
            }
          }
        }, 300);
      },
      error: (error) => {
        console.error('Error al doblar apuesta:', error);
        alert('No se pudo doblar la apuesta: ' + (error.error?.message || 'Saldo insuficiente'));
      }
    });
  }

  // Player splits
  playerSplit(): void {
    if (!this.gameInProgress || !this.canSplit || this.handCompleted) return;

    // Deduct bet for the new hand using the service
    const splitBetAmount = -this.playerBets[this.currentHandIndex];

    this.saldoService.setSaldo(splitBetAmount).pipe(take(1)).subscribe({
      next: (response) => {
        // Update local balance
        this.playerBalance = response.nuevoSaldo;

        // Create new hand
        const newHandIndex = this.playerHands.length;
        this.playerHands.push([]);

        // Move second card to new hand
        this.playerHands[newHandIndex].push(this.playerHands[this.currentHandIndex].pop()!);

        // Deal new cards to both hands
        this.playerHands[this.currentHandIndex].push(this.deck.pop()!);
        this.playerHands[newHandIndex].push(this.deck.pop()!);

        // Set bet for new hand
        this.playerBets.push(this.playerBets[this.currentHandIndex]);

        // Calculate scores
        this.playerScores[this.currentHandIndex] = this.calculateScore(this.playerHands[this.currentHandIndex]);
        this.playerScores.push(this.calculateScore(this.playerHands[newHandIndex]));

        // Check if can split again
        const card1Value = this.getCardValue(this.playerHands[this.currentHandIndex][0]);
        const card2Value = this.getCardValue(this.playerHands[this.currentHandIndex][1]);

        this.canSplit = (card1Value === card2Value && this.playerBalance >= this.playerBets[this.currentHandIndex]);
      },
      error: (error) => {
        console.error('Error al dividir mano:', error);
        alert('No se pudo dividir la mano: ' + (error.error?.message || 'Saldo insuficiente'));
      }
    });
  }

  // Complete current hand and move to next
  completeCurrentHand(result: string): void {
    // Mark this hand as completed
    this.handCompleted = true;

    // If current hand busted, mark it in results
    if (result === 'bust') {
      this.handResults[this.currentHandIndex] = 'bust';
    }

    // Move to next hand
    this.currentHandIndex++;
    this.handCompleted = false;

    // Reset the double down option for new hand
    this.canDoubleDown = true;

    // Check if split is possible for new hand
    if (this.playerHands[this.currentHandIndex].length === 2) {
      const card1Value = this.getCardValue(this.playerHands[this.currentHandIndex][0]);
      const card2Value = this.getCardValue(this.playerHands[this.currentHandIndex][1]);

      this.canSplit = (card1Value === card2Value && this.playerBalance >= this.playerBets[this.currentHandIndex]);
    } else {
      this.canSplit = false;
    }
  }

  // Dealer's turn - versión simplificada
  dealerTurn(): void {
    this.dealerPlayInProgress = true;
    this.currentDealerCardIndex = this.dealerCards.length - 1;

    const dealerPlay = () => {
      if (this.dealerScore < 17) {
        // Agregar carta
        this.dealerCards.push(this.deck.pop()!);
        this.currentDealerCardIndex = this.dealerCards.length - 1;
        this.dealerScore = this.calculateScore(this.dealerCards);

        // Reducir el tiempo para más fluidez
        setTimeout(() => {
          this.currentDealerCardIndex = -1;
          dealerPlay();
        }, 300);
      } else {
        // Finalizar el turno del dealer
        setTimeout(() => {
          this.dealerPlayInProgress = false;

          let gameResult = null;

          // Check if all hands are busted
          const allBusted = this.playerHands.every((hand, index) => this.playerScores[index] > 21);

          if (allBusted) {
            gameResult = 'lose';
          } else if (this.dealerScore > 21) {
            gameResult = 'win';
          } else {
            // Check individual hands
            let wins = 0;
            let losses = 0;
            let pushes = 0;

            for (let i = 0; i < this.playerHands.length; i++) {
              if (this.playerScores[i] <= 21) { // Only check non-busted hands
                if (this.dealerScore > this.playerScores[i]) {
                  // Dealer wins this hand
                  losses++;
                  this.handResults[i] = 'lose';
                } else if (this.dealerScore < this.playerScores[i]) {
                  // Player wins this hand
                  wins++;
                  this.handResults[i] = 'win';
                } else {
                  // Push on this hand
                  pushes++;
                  this.handResults[i] = 'push';
                }
              } else {
                // This hand was busted
                losses++;
                this.handResults[i] = 'bust';
              }
            }

            // Determine overall result (for display purposes)
            if (wins > losses) {
              gameResult = 'win';
            } else if (losses > wins) {
              gameResult = 'lose';
            } else if (pushes > 0) {
              gameResult = 'push';
            } else {
              gameResult = 'lose';
            }
          }

          this.endGame(gameResult);
        }, 400);
      }
    };

    // Start dealer's play after a short delay
    setTimeout(() => {
      dealerPlay();
    }, 300);
  }

  // End game
  async endGame(result: string): Promise<void> {
    // Esperar a que el ID esté disponible si es necesario
    if (this.blackjackJuegoId === 0) {
      await this.loadJuegoId();
    }
    this.gameInProgress = false;
    this.gameFinished = true; // Mark the game as finished
    this.showDealerCards = true;

    // Acumular las ganancias para actualizar el saldo en una sola llamada
    let totalWinnings = 0;
    let totalBetAmount = 0;

    // Process each hand
    for (let i = 0; i < this.playerHands.length; i++) {
      const handScore = this.playerScores[i];
      const handBet = this.playerBets[i];
      totalBetAmount += handBet;

      // Determine result for this hand
      let handResult;

      if (handScore > 21) {
        // Busted hand
        handResult = 'bust';
        this.playerLosses++;
        this.handResults[i] = 'bust';
        // No ganancias para manos perdidas
      } else if (result === 'blackjack' && i === 0 && this.playerHands.length === 1) {
        // Blackjack only applies to initial hand and no splits
        totalWinnings += handBet * 2.5; // Original bet + 1.5x win
        this.playerWins++;
        handResult = 'blackjack';
        this.handResults[i] = 'blackjack';
      } else if (this.dealerScore > 21) {
        // Dealer busted
        totalWinnings += handBet * 2; // Original bet + 1x win
        this.playerWins++;
        handResult = 'win';
        this.handResults[i] = 'win';
      } else if (handScore > this.dealerScore) {
        // Player wins
        totalWinnings += handBet * 2; // Original bet + 1x win
        this.playerWins++;
        handResult = 'win';
        this.handResults[i] = 'win';
      } else if (handScore < this.dealerScore) {
        // Dealer wins
        this.playerLosses++;
        handResult = 'lose';
        this.handResults[i] = 'lose';
        // No ganancias para manos perdidas
      } else {
        // Push
        totalWinnings += handBet; // Return original bet
        this.playerPushes++;
        handResult = 'push';
        this.handResults[i] = 'push';
      }
    }

    // Determinar el resultado general para la base de datos
    let resultadoPartida: string;
    let beneficioPartida: number;

    // Convertir el resultado a formato que espera la API
    if (result === 'blackjack' || result === 'win') {
      resultadoPartida = 'victoria';
      beneficioPartida = totalWinnings - totalBetAmount; // Ganancia neta
    } else if (result === 'push') {
      resultadoPartida = 'empate';
      beneficioPartida = 0; // En empate, recuperamos la apuesta, beneficio 0
    } else {
      resultadoPartida = 'derrota';
      beneficioPartida = -totalBetAmount; // Pérdida completa
    }

    // Registrar la partida en la base de datos
    this.partidaService.finPartida(
      this.blackjackJuegoId,
      beneficioPartida,
      totalBetAmount,
      resultadoPartida
    ).pipe(take(1)).subscribe({
      next: (response) => {
        console.log('Partida registrada correctamente:', response);
        // Mover aquí la lógica de mostrar resultados
        this.showGameResults(result);
      },
      error: (error) => {
        console.error('Error al registrar la partida:', error);
        // Mostrar error al usuario
        this.showResultMessage('Error al guardar estadísticas', 'error');
      }
    });

    // Si hay ganancias, actualizar el saldo
    if (totalWinnings > 0) {
      this.saldoService.setSaldo(totalWinnings).pipe(take(1)).subscribe({
        next: (response) => {
          this.playerBalance = response.nuevoSaldo;
          this.showGameResults(result);
        },
        error: (error) => {
          console.error('Error al actualizar ganancias:', error);
          alert('Error al procesar ganancias: ' + (error.error?.message || 'Error desconocido'));
          // Mostrar resultado de todos modos
          this.showGameResults(result);
        }
      });
    } else {
      // Si no hay ganancias, simplemente mostrar resultados
      this.showGameResults(result);
    }
  }

  // Mostrar resultados del juego
  showGameResults(result: string): void {
    // Display overall result message
    if (result === 'blackjack' && this.playerHands.length === 1) {
      this.showResultMessage('¡Blackjack!', 'win');
    } else if (result === 'bust' && this.playerHands.length === 1) {
      this.showResultMessage('¡Te has pasado!', 'lose');
    } else if (result === 'win') {
      this.showResultMessage('¡Has Ganado!', 'win');
    } else if (result === 'lose') {
      this.showResultMessage('Gana la Banca', 'lose');
    } else if (result === 'push') {
      this.showResultMessage('Empate', 'push');
    } else {
      // Mix of results
      this.showResultMessage('Juego Terminado', 'mixed');
    }

    // Reset current bet
    this.currentBet = 0;
    this.currentBetChips = [];

    // Check for game over
    if (this.playerBalance <= 0) {
      alert('¡Te has quedado sin dinero!');
    }
  }

  // Show result message
  showResultMessage(message: string, type: string): void {
    this.resultMessage = message;
    this.resultType = type;
    this.showResult = true;

    setTimeout(() => {
      this.showResult = false;
    }, 3000);
  }

  // Add chip to bet
  addChip(value: number): void {
    if (this.gameInProgress) return;

    // Verificar si hay suficiente saldo para agregar esta ficha
    if (value > this.playerBalance || (value + this.currentBet) > this.playerBalance) {
      return; // No hacer nada si no hay suficiente saldo
    }

    this.currentBet += value;
    this.currentBetChips.push(value);
  }

  // Clear bet
  clearBet(): void {
    if (this.gameInProgress) return;

    this.currentBet = 0;
    this.currentBetChips = [];
  }
}