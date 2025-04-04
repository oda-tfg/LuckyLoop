import { Component, OnInit } from '@angular/core';
import { loadStripe } from '@stripe/stripe-js';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  standalone:false,
  styleUrls: ['./deposit.component.css']
})
export class DepositComponent implements OnInit {
  stripe: any;
  cardElement: any;
  amount: number = 50;
  loading: boolean = false;

  async ngOnInit() {
    // Carga Stripe.js
    this.stripe = await loadStripe('pk_test_51RA7GDATTvNshzGt9tfwJ2zw1sAFwufXmZvtHRk1vMtSiLepXFmjdMLKQpepgptoq7JsqvpCCaOuAub5vfj8babr00nawAFq91'); // Tu clave pública
    const elements = this.stripe.elements();
    
    // Crea el elemento de la tarjeta
    this.cardElement = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#424770',
          '::placeholder': {
            color: '#aab7c4'
          }
        },
        invalid: {
          color: '#9e2146'
        }
      }
    });
    
    // Monta el elemento en el DOM
    this.cardElement.mount('#card-element');
  }

  async handleDeposit() {
    this.loading = true;
    
    // 1. Obtén el clientSecret desde tu backend (Symfony)
    const response = await fetch('http://localhost:8000/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: this.amount * 100 })
    });
    const { clientSecret } = await response.json();

    // 2. Confirma el pago con Stripe
    const { error } = await this.stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: this.cardElement,
      }
    });

    this.loading = false;
    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      alert('¡Depósito simulado exitoso! 🎉');
    }
  }
}