// ruleta.component.ts
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-ruleta',
  templateUrl: './ruleta.component.html',
  standalone:false,
  styleUrls: ['./ruleta.component.css']
})
export class RuletaComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('wheel') wheelRef!: ElementRef<HTMLDivElement>;
  
  numbers: number[] = [];
  selectedNumber: number | null = null;
  isSpinning: boolean = false;
  betAmount: number = 5;
  balance: number = 1000;
  lastResults: number[] = [];
  
  // Colores de la ruleta (rojo, negro, verde para el 0)
  colors: { [key: number]: string } = {};
  
  constructor() {
    // Números del 0 al 36
    this.numbers = Array.from({ length: 37 }, (_, i) => i);
    
    // Configurar colores (rojo/negro, 0 es verde)
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    
    this.numbers.forEach(num => {
      if (num === 0) {
        this.colors[num] = '#008000'; // Verde para el 0
      } else if (redNumbers.includes(num)) {
        this.colors[num] = '#e81c1c'; // Rojo
      } else {
        this.colors[num] = '#000000'; // Negro
      }
    });
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.drawRouletteWheel();
  }

  drawRouletteWheel(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuración de la ruleta
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const arc = 2 * Math.PI / this.numbers.length;

    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar los sectores
    for (let i = 0; i < this.numbers.length; i++) {
      const angle = i * arc;
      const num = this.numbers[i];

      // Dibujar el sector
      ctx.beginPath();
      ctx.fillStyle = this.colors[num];
      ctx.arc(centerX, centerY, radius, angle, angle + arc);
      ctx.lineTo(centerX, centerY);
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dibujar los números
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = (num === 0) ? '#FFFFFF' : '#FFFFFF';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(num.toString(), radius * 0.75, 0);
      ctx.restore();
    }

    // Dibujar el círculo central
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#8B4513'; // Marrón para simular madera
    ctx.fill();
    ctx.strokeStyle = 'gold';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  spin(): void {
    if (this.isSpinning || this.balance < this.betAmount) return;
    
    this.isSpinning = true;
    this.selectedNumber = null;
    
    // Deducir la apuesta del balance
    this.balance -= this.betAmount;
    
    // Obtener un número aleatorio de vueltas (entre 2 y 5)
    const rounds = 2 + Math.random() * 3;
    
    // Obtener un número aleatorio (0-36)
    const winningNumber = Math.floor(Math.random() * 37);
    
    // Calcular el ángulo de rotación
    const arc = 2 * Math.PI / this.numbers.length;
    const wheelIndex = this.numbers.indexOf(winningNumber);
    
    // El ángulo final debe incluir varias vueltas completas más el ángulo correspondiente al número ganador
    const stopAngle = rounds * 2 * Math.PI + (this.numbers.length - wheelIndex) * arc;
    
    // Animar la ruleta
    this.animateWheel(stopAngle, winningNumber);
  }

  animateWheel(stopAngle: number, winningNumber: number): void {
    const wheel = this.wheelRef.nativeElement;
    wheel.style.transition = `transform 5s cubic-bezier(0.1, 0.1, 0.1, 1)`;
    wheel.style.transform = `rotate(${stopAngle}rad)`;
    
    // Cuando la animación termine, mostrar resultado
    setTimeout(() => {
      this.isSpinning = false;
      this.selectedNumber = winningNumber;
      this.lastResults.unshift(winningNumber);
      if (this.lastResults.length > 10) {
        this.lastResults.pop();
      }
      
      // Calcular ganancias si las hay
      if (this.selectedNumber === 0) {
        // Si sale 0, paga 35 a 1
        this.balance += this.betAmount * 36;
      }
      // Aquí puedes agregar más lógica para diferentes tipos de apuestas
      
    }, 5000); // 5 segundos, igual que la duración de la animación
  }

  changeBetAmount(amount: number): void {
    this.betAmount = Math.max(1, this.betAmount + amount);
  }

  resetGame(): void {
    this.balance = 1000;
    this.lastResults = [];
    this.selectedNumber = null;
    this.betAmount = 5;
  }
}