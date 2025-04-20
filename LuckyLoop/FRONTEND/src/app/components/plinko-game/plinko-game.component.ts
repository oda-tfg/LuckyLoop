import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef, OnInit } from '@angular/core';
import * as Matter from 'matter-js';
import { SaldoService } from '../../services/saldo/saldo.service';

@Component({
  selector: 'app-plinko-game',
  templateUrl: './plinko-game.component.html',
  styleUrls: ['./plinko-game.component.css'],
  standalone: false
})
export class PlinkoGameComponent implements OnInit, AfterViewInit, OnDestroy {
  betAmounts = [1.00, 5.00, 10.00, 50.00, 100.00];
  public zoneMultipliers = [100, 16, 5, 1.2, 0.9, 0.4, 0.2, 0.1, 0.2, 0.4, 0.9, 1.2, 5, 16, 100];
  selectedBet = 1;
  saldo = 0;

  @ViewChild('plinkoContainer') containerRef!: ElementRef<HTMLDivElement>;
  private engine: Matter.Engine | null = null;
  private render: Matter.Render | null = null;
  private runner: Matter.Runner | null = null;
  private pegs: Matter.Body[] = [];
  private balls: Matter.Body[] = [];
  private prizeZones: Matter.Body[] = [];

  constructor(
    private cd: ChangeDetectorRef,
    private saldoService: SaldoService
  ) {}

  ngOnInit() {
    this.loadSaldo();
  }

  loadSaldo(): void {
    this.saldoService.getSaldo().subscribe({
      next: (response) => {
        if (response && response.saldo !== undefined) {
          this.saldo = response.saldo;
          this.cd.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error al obtener el saldo:', error);
      }
    });
  }

  selectBet(amount: number) {
    this.selectedBet = amount;
  }

  ngAfterViewInit() {
    this.initGame();
    window.addEventListener('resize', this.onResize);
  }
  
  ngOnDestroy() {
    if (this.runner) Matter.Runner.stop(this.runner);
    if (this.render) Matter.Render.stop(this.render);
    window.removeEventListener('resize', this.onResize);
  }
  
  onResize = () => {
    const container = this.containerRef.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    if (this.render) {
      this.render.canvas.width = width;
      this.render.canvas.height = height;
      
      // Recrear los elementos físicos
      if (this.engine) {
        Matter.World.clear(this.engine.world, false);
        this.pegs = [];
        this.prizeZones = [];
        
        this.createWalls(this.engine.world, width, height);
        this.createPegs(this.engine.world, width);
        this.createPrizeZones(this.engine.world, width, height);
      }
    }
  }
  

  private initGame() {
    const container = this.containerRef.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.engine = Matter.Engine.create();
    this.runner = Matter.Runner.create();

    this.render = Matter.Render.create({
      element: container,
      engine: this.engine,
      options: {
        width: width,
        height: height,
        wireframes: false,
        background: 'rgb(2, 12, 80)',
      }
    });

    this.createPrizeZones(this.engine.world, width, height);
    this.createPegs(this.engine.world, width);
    this.createWalls(this.engine.world, width, height);

    Matter.Render.run(this.render);
    Matter.Runner.run(this.runner, this.engine);
  }

 // Ajuste en createPegs
private createPegs(world: Matter.World, width: number) {
  const pegRadius = 7;
  const pegOptions = { isStatic: true, render: { fillStyle: 'white' } };
  const rows = 14;
  const startX = width / 2;
  const startY = 130;
  const verticalSpacing = 60;
  
  // Calcular el espaciado horizontal basado en el ancho total
  const horizontalSpacing = width / (this.zoneMultipliers.length - 1);
  
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

  private createWalls(world: Matter.World, width: number, height: number) {
    const wallThickness = 20;
    const wallHeight = height + 1500;

    const walls = [
      Matter.Bodies.rectangle(wallThickness / 2, height / 2, wallThickness, wallHeight, {
        isStatic: true,
        render: { fillStyle: 'black' }
      }),
      Matter.Bodies.rectangle(width - wallThickness / 2, height / 2, wallThickness, wallHeight, {
        isStatic: true,
        render: { fillStyle: 'black' }
      })
    ];
    Matter.World.add(world, walls);
  }

  // Ajuste en createPrizeZones
private createPrizeZones(world: Matter.World, width: number, height: number) {
  const zoneMultipliers = this.zoneMultipliers;
  const numZones = zoneMultipliers.length;
  const zoneWidth = width / (numZones - 1); // Mismo cálculo que en createPegs
  const zoneHeight = 20;
  const y = height - 120;
  
  this.prizeZones = [];
  
  for (let i = 0; i < numZones; i++) {
    const x = i * zoneWidth;
    const multiplier = zoneMultipliers[i];
    
    const zone = Matter.Bodies.rectangle(x, y, zoneWidth, zoneHeight, {
      isStatic: true,
      isSensor: true,
      label: `zone-${i}`,
      render: {
        fillStyle: this.getColorForMultiplier(multiplier),
        strokeStyle: 'black',
        lineWidth: 2
      }
    });
    
    (zone as any).multiplier = multiplier;
    this.prizeZones.push(zone);
  }
  
  Matter.World.add(world, this.prizeZones);
}
  

  public dropBall() {
    if (this.saldo < this.selectedBet) {
      console.log('Saldo insuficiente');
      return;
    }

    this.saldo -= this.selectedBet;
    this.cd.detectChanges();

    this.saldoService.setSaldo(-this.selectedBet).subscribe({
      next: (response) => {
        if (response?.nuevoSaldo !== undefined) {
          this.saldo = response.nuevoSaldo;
          this.cd.detectChanges();
        }
        this.createAndDropBall();
      },
      error: (error) => {
        console.error('Error al actualizar el saldo:', error);
        this.cd.detectChanges();
        alert('Error al procesar la apuesta. Inténtalo de nuevo.');
      }
    });
  }

  private createAndDropBall() {
    if (!this.engine) return;

    const container = this.containerRef.nativeElement;
    const width = container.clientWidth;

    const ball = Matter.Bodies.circle(
      width / 2 + Math.random() * 12 - 7,
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

    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      for (const pair of event.pairs) {
        const { bodyA, bodyB } = pair;
        const ball = [bodyA, bodyB].find(b => this.balls.includes(b));
        const zone = [bodyA, bodyB].find(b => this.prizeZones.includes(b));

        if (ball && zone && !(ball as any).hasScored) {
          (ball as any).hasScored = true;
          const multiplier = (zone as any).multiplier || 0;
          const ganancia = this.selectedBet * multiplier;

          if (ganancia > 0) {
            this.saldoService.setSaldo(ganancia, false).subscribe({
              next: (response) => {
                if (response?.nuevoSaldo !== undefined) {
                  this.saldo = response.nuevoSaldo;
                  this.cd.detectChanges();
                }
              },
              error: (err) => {
                console.error('Error al sumar ganancia:', err);
              }
            });
          }

          setTimeout(() => {
            Matter.World.remove(this.engine!.world, ball);
            this.balls = this.balls.filter(b => b !== ball);
          });
        }
      }
    });
  }

  private colorBola(): string {
    return '#5100ff';
  }

  private getColorForMultiplier(mult: number): string {
    if (mult < 0.2) {
      return '#ffff00';
    } else if (mult < 1) {
      return '#ffd700';
    } else if (mult < 10) {
      return '#ff8c00';
    } else {
      return '#ff0000';
    }
  }
}