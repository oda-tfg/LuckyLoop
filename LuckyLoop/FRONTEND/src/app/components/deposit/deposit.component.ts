import { Component, OnInit } from '@angular/core';
import { SaldoService } from '../../services/saldo/saldo.service';
import { firstValueFrom } from 'rxjs';
import { loadStripe } from '@stripe/stripe-js';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  standalone: false,
  styleUrls: ['./deposit.component.css']
})
export class DepositComponent implements OnInit {
  stripe: any;
  cardElement: any;
  amount: number = 50;
  loading: boolean = false;
  cardError: string = '';
  cardComplete: boolean = false;
  operationType: 'deposit' | 'withdraw' = 'deposit';
  withdrawError: string = '';
  
  withdrawData = {
    cardNumber: ''
  };

  constructor(private saldoService: SaldoService) {}

  async ngOnInit() {
    // Inicializar Stripe solo para depósitos
    if (this.operationType === 'deposit') {
      await this.initStripe();
    }
  }
  
  async initStripe() {
    this.stripe = await loadStripe('pk_test_51RA7GDATTvNshzGt9tfwJ2zw1sAFwufXmZvtHRk1vMtSiLepXFmjdMLKQpepgptoq7JsqvpCCaOuAub5vfj8babr00nawAFq91');
    const elements = this.stripe.elements();
   
    this.cardElement = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#ffffff',
          '::placeholder': { color: 'rgba(255, 255, 255, 0.65)' },
          iconColor: '#0051ff'
        },
        invalid: { 
          color: '#ff0033',
          iconColor: '#ff0033' 
        }
      }
    });
   
    // Solo montar el elemento si existe en el DOM
    setTimeout(() => {
      const cardElement = document.getElementById('card-element');
      if (cardElement) {
        this.cardElement.mount('#card-element');
        
        // Agregar listener para errores y cambios de estado
        this.cardElement.on('change', (event: any) => {
          this.cardError = event.error ? event.error.message : '';
          this.cardComplete = event.complete;
        });
      }
    }, 100);
  }
  
  setOperationType(type: 'deposit' | 'withdraw') {
    this.operationType = type;
    
    // Reiniciar los errores
    this.cardError = '';
    this.withdrawError = '';
    
    // Si cambiamos a depósito, inicializar Stripe
    if (type === 'deposit') {
      setTimeout(() => this.initStripe(), 100);
    }
  }
  
  isWithdrawFormValid(): boolean {
    // Validar que el número de tarjeta tenga exactamente 16 dígitos y solo contenga números
    const cardNumberPattern = /^\d{16}$/;
    return cardNumberPattern.test(this.withdrawData.cardNumber);
  }

  async handleAction() {
    if (this.operationType === 'deposit') {
      await this.handleDeposit();
    } else {
      await this.handleWithdraw();
    }
  }

  async handleDeposit() {
    if (!this.cardComplete) {
      alert('Por favor, completa correctamente los datos de la tarjeta');
      return;
    }

    this.loading = true;
    try {
      // 1. Crear Payment Intent
      const paymentIntentResponse = await fetch('http://localhost:8000/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
        },
        body: JSON.stringify({ amount: this.amount * 100 })
      });
     
      if (!paymentIntentResponse.ok) {
        throw new Error('Error al crear la intención de pago');
      }
     
      const { clientSecret } = await paymentIntentResponse.json();
      
      // 2. Confirmar pago con Stripe
      const { paymentIntent, error } = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: this.cardElement }
      });
      
      if (error) throw error;
      
      // 3. Actualizar saldo local
      this.saldoService.setSaldo(this.amount, true, false).subscribe({
        next: (response) => {
          alert(`✅ Depósito exitoso, Nuevo saldo: €${response.nuevoSaldo}`);
          this.loading = false;
        },
        error: (err) => {
          throw new Error(err.error?.message || 'Error actualizando saldo');
        }
      });
    } catch (error: any) {
      alert(`❌ Error al depositar`);
      this.loading = false;
    }
  }
  
  async handleWithdraw() {
    if (!this.isWithdrawFormValid()) {
      this.withdrawError = 'Por favor, introduce un número de tarjeta válido de 16 dígitos';
      return;
    }
  
    this.loading = true;
    try {
      const saldoResponse = await firstValueFrom(this.saldoService.getSaldo());
      if (saldoResponse.saldo < this.amount) {
        throw new Error(`Saldo insuficiente. Tu saldo actual es €${saldoResponse.saldo}`);
      }
  
      this.saldoService.setSaldo(this.amount, false, true).subscribe({
        next: (response) => {
          alert(`✅ Solicitud de retiro procesada\nNuevo saldo: €${response.nuevoSaldo}`);
          this.loading = false;
  
          this.withdrawData = {
            cardNumber: ''
          };
          this.amount = 0;
        },
        error: (err) => {
          throw new Error(err.error?.message || 'Error procesando la solicitud de retiro');
        }
      });
    } catch (error: any) {
      this.withdrawError = `Error al retirar dinero`;
      this.loading = false;
    }
  }
  
  // Generar referencia única para el retiro
  generateReference(): string {
    return 'WD-' + Date.now().toString(36).toUpperCase();
  }
}