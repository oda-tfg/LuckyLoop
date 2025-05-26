import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { DepositComponent } from './components/deposit/deposit.component';
import { PlinkoComponent } from './components/plinko/plinko.component';
import { FullLayoutComponent } from './components/layouts/full-layout/full-layout.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegistroComponent } from './components/auth/registro/registro.component';
import { RecuperarPasswordComponent } from './components/recuperar-password/recuperar-password.component';
import { CambiarPasswordComponent } from './components/cambiar-password/cambiar-password.component';
import { BlackjackComponent } from './components/blackjack/blackjack.component';
import { EstadisticasComponent } from './components/estadisticas/estadisticas.component';
import { CambiarNombreComponent } from './components/cambiar-nombre/cambiar-nombre.component';
import { RuletaComponent } from './components/ruleta/ruleta.component';
import { CrashComponent } from './components/crash/crash.component';
import { MinasComponent } from './components/minas/minas.component';
import { RankingComponent } from './ranking/ranking.component';


// app-routing.module.ts
const routes: Routes = [
  { path: '', component: FullLayoutComponent },
  { path: 'home', component: FullLayoutComponent },
  { path: 'depositar', component: DepositComponent },
  { path: 'plinko', component: PlinkoComponent},
  { path: 'blackjack', component:BlackjackComponent},
  { path: 'ruleta', component:RuletaComponent},
  { path: 'crash', component:CrashComponent },
  { path: 'minas', component:MinasComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'recuperar-password', component: RecuperarPasswordComponent },
  { path: 'cambiarPassword', component: CambiarPasswordComponent },
  { path: 'estadisticas', component: EstadisticasComponent },
  { path: 'cambiar-nombre', component: CambiarNombreComponent },
  { path: 'categoria/:categoria', component: MainComponent }, 
  { path: 'ranking', component: RankingComponent },
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }