import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  standalone:false,
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  paymentMethods = [
    'visa', 'mastercard', 'paypal', 'skrill', 'neteller'
  ];

  footerLinks = [
    {
      title: 'Casino',
      links: [
        { text: 'Slots', url: '/slots' },
        { text: 'Ruleta', url: '/roulette' },
        { text: 'Blackjack', url: '/blackjack' },
        { text: 'Poker', url: '/poker' },
        { text: 'Baccarat', url: '/baccarat' }
      ]
    },
    {
      title: 'Información',
      links: [
        { text: 'Sobre Nosotros', url: '/about' },
        { text: 'Términos y Condiciones', url: '/terms' },
        { text: 'Política de Privacidad', url: '/privacy' },
        { text: 'Juego Responsable', url: '/responsible-gaming' },
        { text: 'Afiliados', url: '/affiliates' }
      ]
    },
    {
      title: 'Soporte',
      links: [
        { text: 'FAQ', url: '/faq' },
        { text: 'Contacto', url: '/contact' },
        { text: 'Ayuda', url: '/help' },
        { text: 'Métodos de Pago', url: '/payment-methods' }
      ]
    }
  ];

  socialMedia = [
    { name: 'facebook', url: 'https://facebook.com/' },
    { name: 'twitter', url: 'https://twitter.com/' },
    { name: 'instagram', url: 'https://instagram.com/' },
    { name: 'youtube', url: 'https://youtube.com/' },
    { name: 'twitch', url: 'https://twitch.tv/' }
  ];
}