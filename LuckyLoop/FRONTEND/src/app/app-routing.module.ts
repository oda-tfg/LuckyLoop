import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
/* import { DepositComponent } from './components/deposit/deposit.component'; // ajusta ruta si es necesario
 */
/* const routes: Routes = [
  { path: 'depositar', component: DepositComponent },
]; */

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
