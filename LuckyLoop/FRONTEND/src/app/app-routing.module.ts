import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { RuletaComponent } from './components/ruleta/ruleta.component';
import { DepositComponent } from './components/deposit/deposit.component';
import { PlinkoGameComponent } from './components/plinko-game/plinko-game.component';
import { FullLayoutComponent } from './components/layouts/full-layout/full-layout.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegistroComponent } from './components/auth/registro/registro.component';
import { RecuperarPasswordComponent } from './components/recuperar-password/recuperar-password.component';
import { CambiarPasswordComponent } from './components/cambiar-password/cambiar-password.component';
import { BlackjackComponent } from './components/blackjack/blackjack.component';

// app-routing.module.ts
const routes: Routes = [
  { path: '', component: FullLayoutComponent },
  { path: 'home', component: FullLayoutComponent },
  { path: 'ruleta', component: RuletaComponent },
  { path: 'depositar', component: DepositComponent },
  { path: 'plinko', component: PlinkoGameComponent},
  { path: 'blackjack', component:BlackjackComponent},
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'recuperar-password', component: RecuperarPasswordComponent },
  { path: 'cambiarPassword', component: CambiarPasswordComponent },  // Nueva ruta
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }