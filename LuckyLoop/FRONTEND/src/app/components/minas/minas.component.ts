import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs/operators';
import { SaldoService } from './../../services/saldo/saldo.service';
import { PartidaService } from './../../services/partida/partida.service';
import { BloquearZoom } from './../../services/bloquearZoomYScroll/bloquearZoomYScroll.service';
import { JuegosService, Juego } from './../../services/juegos/juegos.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-minas',
  standalone: false,
  templateUrl: './minas.component.html',
  styleUrls: ['./minas.component.css']
})
export class MinasComponent implements OnInit, OnDestroy {
  // Configuración del juego
  gridSize = 5; // Tamaño de la cuadrícula 5x5
  totalMines = 3; // Total de minas ocultas
  grid: Cell[][] = [];

  // Estado del juego
  gameActive = false;
  gameOver = false;
  gameWon = false;

  // Configuración de apuestas
  balance: number = 0; // Saldo inicial del uusario NO registrado
  betAmount: number = 0.00; // Cantidad apostada
  currentMultiplier: number = 1.00; // Multiplicador actual

  // Tabla de multiplicadores según celdas reveladas
  multipliers: { [key: number]: number } = {
    1: 0.70,
    2: 1.20,
    3: 1.35,
    4: 1.50,
    5: 1.70,
    6: 1.96,
    7: 2.25,
    8: 2.60,
    9: 3.00,
    10: 3.50,
    11: 4.20,
    12: 5.00,
    13: 6.00,
    14: 7.50,
    15: 9.50,
    16: 12.00,
    17: 15.00,
    18: 20.00,
    19: 25.00,
    20: 30.00,
    21: 40.00,
    22: 50.00
  };

  // Para almacenar la animación de la explosión
  explosionCell: { row: number, col: number } | null = null;
  revealedCells: number = 0;
  potentialWin: number = 0;

  // Para mostrar mensaje de victoria/derrota
  showResultIndicator: boolean = false;
  resultMessage: string = '';
  resultClass: string = '';

  // ID del juego de minas 
  private minasJuegoId: number = 0; 

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
    this.initializeGrid();
    this.loadJuegoId();
  }


  loadJuegoId(): void {
    const currentPath = this.route.snapshot.routeConfig?.path || '';

    this.juegosService.getAllJuegos().pipe(take(1)).subscribe({
      next: (juegos) => {
        const juego = juegos.find(j => j.url?.replace('/', '') === currentPath);
        if (juego) {
          this.minasJuegoId = juego.id;
          console.log('ID dinámico asignado al juego:', this.minasJuegoId);
        } else {
          console.warn('No se encontró el ID del juego para la ruta:', currentPath);
        }
      },
      error: (error) => {
        console.error('Error al obtener la lista de juegos:', error);
      }
    });
  }

  ngOnDestroy(): void {
    this.bloquearZoomService.unlockDisplaySettings();
  }

  // Cargar el saldo del usuario
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

  // Inicializar la cuadrícula del juego
  initializeGrid(): void {
    this.grid = [];
    this.gameActive = false;
    this.gameOver = false;
    this.gameWon = false;
    this.revealedCells = 0;
    this.currentMultiplier = 1.00;
    this.explosionCell = null;
    this.showResultIndicator = false;

    // Crear cuadrícula vacía
    for (let i = 0; i < this.gridSize; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.gridSize; j++) {
        this.grid[i][j] = {
          hasMine: false,
          isRevealed: false,
          isHovered: false
        };
      }
    }
  }

  // Iniciar el juego colocando las minas
  startGame(): void {
    // Verificar que se ha ingresado una apuesta válida
    if (this.betAmount <= 0) {
      alert('Es necesario apostar dinero para jugar.');
      return;
    }

    if (this.betAmount > this.balance) {
      alert('Saldo insuficiente para esta apuesta.');
      return;
    }

    // Actualizar el saldo usando el servicio (restar apuesta)
    this.saldoService.setSaldo(-this.betAmount).pipe(take(1)).subscribe({
      next: (response) => {
        // Actualizar el saldo local con la respuesta del servidor
        this.balance = response.nuevoSaldo;

        // Continuar con el inicio del juego
        this.proceedWithGameStart();
      },
      error: (error) => {
        console.error('Error al actualizar saldo:', error);
        if (error.error && error.error.message) {
          alert(error.error.message);
        } else {
          alert('No se pudo actualizar el saldo. Inténtalo de nuevo.');
        }
      }
    });
  }

  // Proceder con el inicio del juego después de actualizar el saldo
  proceedWithGameStart(): void {
    // Colocar minas aleatoriamente
    let minesPlaced = 0;
    while (minesPlaced < this.totalMines) {
      const row = Math.floor(Math.random() * this.gridSize);
      const col = Math.floor(Math.random() * this.gridSize);

      // Evitar colocar mina donde ya hay una mina
      if (!this.grid[row][col].hasMine) {
        this.grid[row][col].hasMine = true;
        minesPlaced++;
      }
    }

    this.gameActive = true;
    this.updatePotentialWin();
  }

  // Manejar el clic en una celda
  onCellClick(row: number, col: number): void {
    // Si el juego no está activo, iniciarlo
    if (!this.gameActive) {
      this.startGame();
      return; // Salir aquí para evitar procesar el clic hasta que el juego esté iniciado
    }

    // Si el juego ya terminó o la celda ya está revelada, no hacer nada
    if (this.gameOver || this.grid[row][col].isRevealed) {
      return;
    }

    // Revelar la celda
    this.grid[row][col].isRevealed = true;

    // Comprobar si hay una mina
    if (this.grid[row][col].hasMine) {
      // Juego perdido
      this.explosionCell = { row, col };
      this.endGame(false);
    } else {
      // Actualizar contador de celdas reveladas
      this.revealedCells++;

      // Actualizar multiplicador
      this.updateMultiplier();

      // Comprobar si se han revelado todas las celdas seguras
      if (this.revealedCells === (this.gridSize * this.gridSize) - this.totalMines) {
        this.endGame(true);
      } else {
        // Actualizar el premio potencial
        this.updatePotentialWin();
      }
    }
  }

  // Actualizar multiplicador según el número de celdas reveladas
  updateMultiplier(): void {
    if (this.revealedCells in this.multipliers) {
      this.currentMultiplier = this.multipliers[this.revealedCells];
    }
  }

  // Calcular y actualizar el premio potencial
  updatePotentialWin(): void {
    this.potentialWin = this.betAmount * this.currentMultiplier;
  }

  // Finalizar el juego
  endGame(isWin: boolean): void {
    this.gameActive = false;
    this.gameOver = true;
    this.gameWon = isWin;

    let winAmount = 0;
    let resultadoPartida: string;
    let beneficioPartida: number;

    if (isWin) {
      // Victoria - calcular ganancia
      winAmount = this.betAmount * this.currentMultiplier;
      resultadoPartida = 'victoria';
      beneficioPartida = winAmount - this.betAmount; // Ganancia neta

      // Mostrar mensaje de victoria
      this.showResultMessage(`¡Ganaste! +${winAmount.toFixed(2)}`, 'win');

      // Actualizar saldo con las ganancias
      this.saldoService.setSaldo(winAmount).pipe(take(1)).subscribe({
        next: (response) => {
          this.balance = response.nuevoSaldo;
          console.log('Saldo actualizado (premio ganado):', response);
        },
        error: (error) => {
          console.error('Error al actualizar el saldo (premio):', error);
        }
      });
    } else {
      // Derrota - mostrar todas las minas
      this.revealAllMines();
      resultadoPartida = 'derrota';
      beneficioPartida = -this.betAmount; // Pérdida completa

      // Mostrar mensaje de derrota
      this.showResultMessage(`¡Boom! Perdiste ${this.betAmount.toFixed(2)}`, 'lose');
    }

    // Registrar la partida en la base de datos
    this.partidaService.finPartida(
      this.minasJuegoId,
      beneficioPartida,
      this.betAmount,
      resultadoPartida
    ).pipe(take(1)).subscribe({
      next: (response) => {
        console.log('Partida de minas registrada correctamente:', response);
      },
      error: (error) => {
        console.error('Error al registrar la partida de minas:', error);
      }
    });
  }

  // Mostrar mensaje de resultado
  showResultMessage(message: string, type: 'win' | 'lose'): void {
    this.resultMessage = message;
    this.resultClass = type;
    this.showResultIndicator = true;

    // Ocultar después de 3 segundos
    setTimeout(() => {
      this.showResultIndicator = false;
    }, 3000);
  }

  // Revelar todas las minas
  revealAllMines(): void {
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        if (this.grid[i][j].hasMine) {
          this.grid[i][j].isRevealed = true;
        }
      }
    }
  }

  // Reiniciar el juego
  restartGame(): void {
    this.initializeGrid();
  }

  // Establecer la cantidad apostada
  setBetAmount(amount: number): void {
    this.betAmount = amount;
  }

  // Doblar la apuesta
  doubleBet(): void {
    this.betAmount = this.betAmount * 2;
    if (this.betAmount > this.balance) {
      this.betAmount = this.balance;
    }
  }

  // Reducir la apuesta a la mitad
  halfBet(): void {
    this.betAmount = this.betAmount / 2;
  }

  // Retirar fondos (cobrar la ganancia actual y terminar el juego)
  cashOut(): void {
    if (!this.gameActive || this.gameOver) {
      return;
    }

    // Calcular ganancia
    const winAmount = this.betAmount * this.currentMultiplier;
    const beneficioPartida = winAmount - this.betAmount; // Ganancia neta

    // Mostrar mensaje
    this.showResultMessage(`¡Cobrado! +${winAmount.toFixed(2)}`, 'win');

    // Actualizar saldo con las ganancias
    this.saldoService.setSaldo(winAmount).pipe(take(1)).subscribe({
      next: (response) => {
        this.balance = response.nuevoSaldo;
        console.log('Saldo actualizado (retirada):', response);
      },
      error: (error) => {
        console.error('Error al actualizar el saldo (retirada):', error);
      }
    });

    // Registrar la partida como victoria en la base de datos
    this.partidaService.finPartida(
      this.minasJuegoId,
      beneficioPartida,
      this.betAmount,
      'victoria'
    ).pipe(take(1)).subscribe({
      next: (response) => {
        console.log('Partida de minas (cash out) registrada correctamente:', response);
      },
      error: (error) => {
        console.error('Error al registrar la partida de minas (cash out):', error);
      }
    });

    // Revelar todas las minas para mostrar dónde estaban
    this.revealAllMines();

    // Terminar el juego
    this.gameActive = false;
    this.gameOver = true;
  }

  // Método para manejar el evento hover
  onCellHover(row: number, col: number, isHovering: boolean): void {
    if (!this.gameOver && !this.grid[row][col].isRevealed) {
      this.grid[row][col].isHovered = isHovering;
    }
  }
}

// Interfaz para las celdas de la cuadrícula
interface Cell {
  hasMine: boolean;
  isRevealed: boolean;
  isHovered: boolean;
}
