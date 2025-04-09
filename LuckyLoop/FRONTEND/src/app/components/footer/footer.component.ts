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

  footerLinks = [];

  socialMedia = [
    { name: 'facebook', url: 'https://facebook.com/' },
    { name: 'twitter', url: 'https://twitter.com/' },
    { name: 'instagram', url: 'https://instagram.com/' },
    { name: 'youtube', url: 'https://youtube.com/' },
    { name: 'twitch', url: 'https://twitch.tv/' }
  ];
}