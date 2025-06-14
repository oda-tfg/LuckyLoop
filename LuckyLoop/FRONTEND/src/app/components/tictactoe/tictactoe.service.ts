// tictactoe.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GameState {
  board: (string | null)[][];
  currentPlayer?: string;
  winner?: string | null;
  gameOver?: boolean;
  message?: string;
  aiMove?: { row: number; col: number };
}

export interface Move {
  row: number;
  col: number;
  player: string;
}

@Injectable({
  providedIn: 'root'
})
export class TictactoeService {
  private apiUrl = 'http://localhost:8001/api/tictactoe'; // Puerto diferente para Python

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  newGame(): Observable<GameState> {
    const headers = this.getHeaders();
    return this.http.post<GameState>(`${this.apiUrl}/new-game`, {}, { headers });
  }

  makeMove(row: number, col: number, player: string = 'X'): Observable<GameState> {
    const headers = this.getHeaders();
    const move: Move = { row, col, player };
    return this.http.post<GameState>(`${this.apiUrl}/make-move`, move, { headers });
  }

  getGameStatus(): Observable<GameState> {
    return this.http.get<GameState>(`${this.apiUrl}/status`);
  }
}