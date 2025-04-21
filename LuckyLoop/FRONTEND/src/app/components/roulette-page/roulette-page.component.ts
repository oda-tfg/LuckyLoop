// src/app/components/roulette-page/roulette-page.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-roulette-page',
  standalone:false,
  template: `
    <div class="roulette-game-container">
      <h1 class="game-title">Ruleta 3D</h1>
      <div class="game-layout">
        <app-roulette-wheel></app-roulette-wheel>
        <app-betting-table></app-betting-table>
      </div>
    </div>
  `,
  styles: [`
    .roulette-game-container {
      width: 100%;
      min-height: 100vh;
      padding: 20px;
      background-color: #121212;
      color: white;
      display: flex;
      flex-direction: column;
    }
    
    .game-title {
      text-align: center;
      color: #f8f8f8;
      margin-bottom: 20px;
      font-size: 2.5rem;
      text-shadow: 0 0 10px rgba(255,0,0,0.5);
    }
    
    .game-layout {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 20px;
      height: calc(100vh - 100px);
    }
    
    @media (min-width: 992px) {
      .game-layout {
        flex-direction: row;
      }
      
      app-roulette-wheel, app-betting-table {
        flex: 1;
        height: 100%;
      }
    }
  `]
})
export class RoulettePageComponent {
  title = 'ruleta-3d';
}