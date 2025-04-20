import { Component, OnInit } from '@angular/core';
import { SaldoService } from '../../services/saldo/saldo.service'; // Ajusta la ruta

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  standalone: false,
  styleUrls: ['./deposit.component.css']
})
export class DepositComponent implements OnInit {
  amount: number = 50;
  loading: boolean = false;
  cardNumber: string = '';
  expDate: string = '';
  cvc: string = '';

  constructor(private saldoService: SaldoService) {}

  ngOnInit() {
    // Eliminada toda la lógica de Stripe
  }

  handleDeposit() {
    this.loading = true;

    this.saldoService.setSaldo(this.amount, true).subscribe({
      next: (response: any) => {
        alert(`¡Depósito exitoso! Nuevo saldo: €${response.nuevoSaldo}`);
        this.loading = false;
      },
      error: (error) => {
        alert(error.error?.message || 'Error en el depósito');
        this.loading = false;
      }
    });
  }
}