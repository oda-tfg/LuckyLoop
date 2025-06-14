// tictactoe.component.ts
import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { TictactoeService } from './tictactoe.service';

@Component({
  selector: 'app-tictactoe',
  templateUrl: './tictactoe.component.html',
  standalone: false,
  styleUrls: ['./tictactoe.component.css'],
  animations: [
    trigger('cellAnimation', [
      transition(':enter', [
        style({ transform: 'scale(0) rotate(180deg)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'scale(1) rotate(0)', opacity: 1 }))
      ])
    ]),
    trigger('winAnimation', [
      state('win', style({ transform: 'scale(1.1)' })),
      transition('* => win', [
        animate('500ms ease-in-out', style({ transform: 'scale(1.2)' })),
        animate('500ms ease-in-out', style({ transform: 'scale(1.1)' }))
      ])
    ])
  ]
})
export class TictactoeComponent implements OnInit {
  board: (string | null)[][] = [];
  gameOver: boolean = false;
  winner: string | null = null;
  message: string = '';
  isPlayerTurn: boolean = true;
  lastAiMove: { row: number; col: number } | null = null;
  winningCells: { row: number; col: number }[] = [];
  playerScore: number = 0;
  aiScore: number = 0;
  draws: number = 0;
  
  // Array para el template - ESTA ES LA PROPIEDAD QUE FALTABA
  cells = [
    {row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2},
    {row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2},
    {row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}
  ];

  constructor(private tictactoeService: TictactoeService) { }

  ngOnInit(): void {
    this.newGame();
  }

  newGame(): void {
    this.tictactoeService.newGame().subscribe({
      next: (response) => {
        this.board = response.board;
        this.gameOver = false;
        this.winner = null;
        this.message = '¡Tu turno! Eres X';
        this.isPlayerTurn = true;
        this.lastAiMove = null;
        this.winningCells = [];
      },
      error: (error) => {
        console.error('Error al iniciar nuevo juego:', error);
        this.message = 'Error al conectar con el servidor';
      }
    });
  }

  makeMove(row: number, col: number): void {
    if (this.gameOver || !this.isPlayerTurn || this.board[row][col] !== null) {
      return;
    }

    this.isPlayerTurn = false;
    this.message = 'Pensando...';

    this.tictactoeService.makeMove(row, col).subscribe({
      next: (response) => {
        this.board = response.board;
        this.gameOver = response.gameOver || false;
        this.winner = response.winner || null;
        this.message = response.message || 'Tu turno';
        this.lastAiMove = response.aiMove || null;

        if (this.gameOver) {
          this.updateScore();
          this.checkWinningLine();
        } else {
          this.isPlayerTurn = true;
        }
      },
      error: (error) => {
        console.error('Error al hacer movimiento:', error);
        this.message = 'Error al hacer movimiento';
        this.isPlayerTurn = true;
      }
    });
  }

  updateScore(): void {
    if (this.winner === 'X') {
      this.playerScore++;
    } else if (this.winner === 'O') {
      this.aiScore++;
    } else {
      this.draws++;
    }
  }

  checkWinningLine(): void {
    if (!this.winner) return;

    // Verificar filas
    for (let i = 0; i < 3; i++) {
      if (this.board[i][0] === this.winner && 
          this.board[i][1] === this.winner && 
          this.board[i][2] === this.winner) {
        this.winningCells = [{row: i, col: 0}, {row: i, col: 1}, {row: i, col: 2}];
        return;
      }
    }

    // Verificar columnas
    for (let j = 0; j < 3; j++) {
      if (this.board[0][j] === this.winner && 
          this.board[1][j] === this.winner && 
          this.board[2][j] === this.winner) {
        this.winningCells = [{row: 0, col: j}, {row: 1, col: j}, {row: 2, col: j}];
        return;
      }
    }

    // Verificar diagonales
    if (this.board[0][0] === this.winner && 
        this.board[1][1] === this.winner && 
        this.board[2][2] === this.winner) {
      this.winningCells = [{row: 0, col: 0}, {row: 1, col: 1}, {row: 2, col: 2}];
      return;
    }

    if (this.board[0][2] === this.winner && 
        this.board[1][1] === this.winner && 
        this.board[2][0] === this.winner) {
      this.winningCells = [{row: 0, col: 2}, {row: 1, col: 1}, {row: 2, col: 0}];
      return;
    }
  }

  isWinningCell(row: number, col: number): boolean {
    return this.winningCells.some(cell => cell.row === row && cell.col === col);
  }

  isLastAiMove(row: number, col: number): boolean {
    return this.lastAiMove?.row === row && this.lastAiMove?.col === col;
  }

  getCellClass(row: number, col: number): string {
    const classes = ['cell'];
    
    if (this.board[row][col] === 'X') {
      classes.push('player-x');
    } else if (this.board[row][col] === 'O') {
      classes.push('player-o');
    }
    
    if (this.isWinningCell(row, col)) {
      classes.push('winning-cell');
    }
    
    if (this.isLastAiMove(row, col)) {
      classes.push('ai-move');
    }
    
    if (!this.gameOver && this.board[row][col] === null && this.isPlayerTurn) {
      classes.push('clickable');
    }
    
    return classes.join(' ');
  }
}