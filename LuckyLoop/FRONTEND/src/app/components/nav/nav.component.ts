import { Component } from '@angular/core';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  standalone:false,
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  menuItems = [
    { title: 'Inicio', route: '/home', icon: 'home' },
    { title: 'Slots', route: '/slots', icon: 'slot-machine' },
    { title: 'Ruleta', route: '/roulette', icon: 'roulette' },
    { title: 'Poker', route: '/poker', icon: 'poker' },
    { title: 'Torneos', route: '/tournaments', icon: 'trophy' }
  ];

  mobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}