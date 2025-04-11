import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { RuletaComponent } from './components/ruleta/ruleta.component';
import { DepositComponent } from './components/deposit/deposit.component';
import { FullLayoutComponent } from './components/layouts/full-layout/full-layout.component';

const routes: Routes = [
  { path: '',component:FullLayoutComponent },
  {path: 'home', component: FullLayoutComponent},
  { path: 'ruleta', component: RuletaComponent },
  { path: 'depositar', component: DepositComponent },
  { path: 'blackjack', component: MainComponent, data: { showGame: true } },
  { path: 'auth', loadChildren: () => import('./components/auth/auth.module').then(m => m.AuthModule) },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }