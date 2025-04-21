// components/betting-table/betting-table.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouletteService } from '../../services/roulette.service';
import { Subscription } from 'rxjs';
import { GameState } from '../../models/game-state.model';
import { Chip } from '../../models/chip.model';

@Component({
  selector: 'app-betting-table',
  standalone:false,
  templateUrl: `./roulette-table.component.html`,
  styles: [`
    .betting-container {
      width: 100%;
      height: 100%;
      padding: 20px;
      background-color: #004400;
      color: white;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }
    
    .balance {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 20px;
      color: #FFFFFF;
      text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
    }
    
    .chip-rack {
      display: flex;
      gap: 15px;
      margin-bottom: 25px;
      justify-content: center;
    }
    
    .chip {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 18px;
      border: 3px solid #EEEEEE;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
    
    .chip:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
    }
    
    .chip.selected {
      transform: scale(1.15);
      box-shadow: 0 0 15px white, 0 6px 12px rgba(0, 0, 0, 0.5);
    }
    
    .betting-table {
      display: grid;
      grid-template-areas:
        "zero numbers numbers numbers"
        "zero numbers numbers numbers"
        "zero numbers numbers numbers"
        ". columns columns columns"
        ". dozens dozens dozens"
        ". outside outside outside";
      gap: 2px;
      background-color: #224422;
      padding: 3px;
      border: 2px solid #EEEEEE;
      border-radius: 4px;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
      flex: 1;
    }
    
    .betting-table.disabled {
      opacity: 0.7;
      pointer-events: none;
    }
    
    .number {
      background-color: #111111;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
      height: 60px;
      font-weight: bold;
      font-size: 18px;
      transition: all 0.2s;
    }
    
    .number:hover {
      box-shadow: inset 0 0 15px rgba(255, 255, 255, 0.7);
      transform: scale(0.97);
    }
    
    .zero {
      grid-area: zero;
      background-color: #008800;
      writing-mode: vertical-rl;
      text-orientation: upright;
      font-size: 24px;
      letter-spacing: 2px;
    }
    
    .red {
      background-color: #DD0000;
    }
    
    .numbers-grid {
      grid-area: numbers;
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 2px;
    }
    
    .column-bets {
      grid-area: columns;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2px;
    }
    
    .column-bet {
      background-color: #003300;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 45px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s;
    }
    
    .column-bet:hover {
      background-color: #005500;
      box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.5);
    }
    
    .dozen-bets {
      grid-area: dozens;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2px;
    }
    
    .dozen-bet {
      background-color: #003300;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 45px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s;
    }
    
    .dozen-bet:hover {
      background-color: #005500;
      box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.5);
    }
    
    .outside-bets {
      grid-area: outside;
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 2px;
    }
    
    .outside-bet {
      background-color: #003300;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 45px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s;
    }
    
    .outside-bet:hover {
      background-color: #005500;
      box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.5);
    }
    
    .outside-bet.red {
      background-color: #DD0000;
    }
    
    .outside-bet.red:hover {
      background-color: #FF0000;
    }
    
    .outside-bet.black {
      background-color: #111111;
    }
    
    .outside-bet.black:hover {
      background-color: #333333;
    }
    
    .bet-chips {
      position: absolute;
      top: 2px;
      right: 2px;
      display: flex;
      flex-wrap: wrap;
      max-width: 30px;
      justify-content: flex-end;
    }
    
    .bet-chip {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 1px solid white;
      font-size: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }
  `]
})
export class BettingTableComponent implements OnInit, OnDestroy {
  public gameState: GameState | null = null;
  public availableChips: Chip[] = [];
  public selectedChip: Chip | null = null;
  
  private readonly redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  private subscription: Subscription = new Subscription();
  
  constructor(private rouletteService: RouletteService) { }

  ngOnInit(): void {
    this.availableChips = this.rouletteService.getAvailableChips();
    
    this.subscription.add(
      this.rouletteService.gameState$.subscribe(state => {
        this.gameState = state;
        this.selectedChip = state.selectedChip;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Seleccionar ficha
  selectChip(chip: Chip): void {
    this.rouletteService.selectChip(chip);
  }

  // Realizar apuesta
  placeBet(type: any, numbers: number[]): void {
    if (!this.gameState?.selectedChip) {
      // Feedback visual cuando no hay ficha seleccionada
      alert('Por favor, selecciona una ficha primero');
      return;
    }
    this.rouletteService.placeBet(type, numbers);
  }

  // Verificar si un número es rojo
  isRedNumber(num: number): boolean {
    return this.redNumbers.includes(num);
  }

  // Obtener número a partir de posición en la tabla
  getNumberFromPosition(row: number, col: number): number {
    return (3 * col) - (3 - row);
  }

  // Obtener números de una columna
  getColumnNumbers(col: number): number[] {
    const numbers = [];
    for (let i = col; i <= 36; i += 3) {
      numbers.push(i);
    }
    return numbers;
  }

  // Verificar si hay apuesta en un número
  hasBetOnNumber(num: number): boolean {
    if (!this.gameState) return false;
    
    return this.gameState.bets.some(bet => 
      bet.numbers.includes(num) || 
      (bet.type === 'red' && this.isRedNumber(num)) ||
      (bet.type === 'black' && !this.isRedNumber(num) && num !== 0) ||
      (bet.type === 'even' && num % 2 === 0 && num !== 0) ||
      (bet.type === 'odd' && num % 2 === 1) ||
      (bet.type === 'low' && num >= 1 && num <= 18) ||
      (bet.type === 'high' && num >= 19 && num <= 36) ||
      (bet.type === 'dozen' && bet.numbers[0] === 1 && num >= 1 && num <= 12) ||
      (bet.type === 'dozen' && bet.numbers[0] === 13 && num >= 13 && num <= 24) ||
      (bet.type === 'dozen' && bet.numbers[0] === 25 && num >= 25 && num <= 36)
    );
  }

  // Obtener apuestas para un número
  getBetsForNumber(num: number): any[] {
    if (!this.gameState) return [];
    
    return this.gameState.bets.filter(bet => 
      bet.numbers.includes(num) || 
      (bet.type === 'red' && this.isRedNumber(num)) ||
      (bet.type === 'black' && !this.isRedNumber(num) && num !== 0) ||
      (bet.type === 'even' && num % 2 === 0 && num !== 0) ||
      (bet.type === 'odd' && num % 2 === 1) ||
      (bet.type === 'low' && num >= 1 && num <= 18) ||
      (bet.type === 'high' && num >= 19 && num <= 36) ||
      (bet.type === 'dozen' && bet.numbers[0] === 1 && num >= 1 && num <= 12) ||
      (bet.type === 'dozen' && bet.numbers[0] === 13 && num >= 13 && num <= 24) ||
      (bet.type === 'dozen' && bet.numbers[0] === 25 && num >= 25 && num <= 36)
    );
  }
}