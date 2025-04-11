import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import * as Matter from 'matter-js';

@Component({
  selector: 'app-plinko-game',
  templateUrl: './plinko-game.component.html',
  styleUrls: ['./plinko-game.component.css'],
  standalone: false
})
export class PlinkoGameComponent implements AfterViewInit, OnDestroy {
  // Configuración del juego
  betAmounts = [0.20, 0.40, 0.60, 1.00, 2.00];
  selectedBet = 0.20;
  saldo = 20;
  
  // Referencias de Matter.js
  @ViewChild('plinkoContainer') containerRef!: ElementRef<HTMLDivElement>;
  private engine: Matter.Engine | null = null;
  private render: Matter.Render | null = null;
  private runner: Matter.Runner | null = null;
  private pegs: Matter.Body[] = [];
  private balls: Matter.Body[] = [];

  constructor(private cd: ChangeDetectorRef) {}

  selectBet(amount: number) {
    this.selectedBet = amount;
    console.log("Apuesta seleccionada:", this.selectedBet);
  }

  ngAfterViewInit() {
    this.initGame();
  }

  ngOnDestroy() {
    if (this.runner) Matter.Runner.stop(this.runner);
    if (this.render) Matter.Render.stop(this.render);
  }

  private initGame() {
    // Configuración básica
    this.engine = Matter.Engine.create();
    this.runner = Matter.Runner.create();

    // Tamaño fijo para evitar problemas de zoom
    const width = innerWidth;
    const height = innerHeight;

    this.render = Matter.Render.create({
      element: this.containerRef.nativeElement,
      engine: this.engine,
      options: {
        width: width,
        height: height,
        wireframes: false,
        background: 'rgb(5, 10, 38)',
      }
    });

    // Crear elementos del juego
    this.createPegs(this.engine.world);
    this.createWalls(this.engine.world);

    // Iniciar simulación
    Matter.Render.run(this.render);
    Matter.Runner.run(this.runner, this.engine);
  }

  private createPegs(world: Matter.World) {
    const pegRadius = 7;
    const pegOptions = { isStatic: true, render: { fillStyle: 'white' } };
    const rows = 14;
    const startX = innerWidth / 2;
    const startY = 170;
    const verticalSpacing = 60;
    const horizontalSpacing = 95;

    for (let row = 0; row < rows; row++) {
      const pegsInRow = row + 1;
      const y = startY + row * verticalSpacing;
      const totalWidth = (pegsInRow - 1) * horizontalSpacing;
      const firstX = startX - totalWidth / 2;

      for (let i = 0; i < pegsInRow; i++) {
        const x = firstX + i * horizontalSpacing;
        const peg = Matter.Bodies.circle(x, y, pegRadius, pegOptions);
        this.pegs.push(peg);
      }
    }

    Matter.World.add(world, this.pegs);
  }

  private createWalls(world: Matter.World) {
    const walls = [
      Matter.Bodies.rectangle(515, window.innerHeight, 20, window.innerHeight + 1500, { isStatic: true, render: { fillStyle: 'rgb(5, 10, 0)' } }), //pared iquierda
      Matter.Bodies.rectangle(window.innerWidth - 515, window.innerHeight, 20, window.innerHeight + 1500, { isStatic: true, render: { fillStyle: 'rgb(5, 10, 0)' } }) // pared derecha
    ];
    Matter.World.add(world, walls);
  }

  public dropBall() {
    if (this.saldo < this.selectedBet) {
      console.log('Saldo insuficiente');
      return;
    }

    this.saldo = this.saldo - this.selectedBet;
    this.cd.detectChanges();

    if (!this.engine) return;

    const ball = Matter.Bodies.circle(
      innerWidth / 2 + Math.random() * 12 - 7,
      110,
      12,
      {
        restitution: 0.8,
        render: { fillStyle: this.colorBola() }
      }
    );

    Matter.World.add(this.engine.world, ball);
    this.balls.push(ball);

    if (this.balls.length > 20) {
      Matter.World.remove(this.engine.world, this.balls.shift()!);
    }
  }

  private colorBola(): string {
    return '#5100ff';
  }
}