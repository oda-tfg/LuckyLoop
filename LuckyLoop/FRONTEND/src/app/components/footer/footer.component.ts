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
    'stripe'
  ];

  footerLinks = [];

  socialMedia = [
    { name: 'github', url: 'https://github.com/oda-tfg' },
  ];
}