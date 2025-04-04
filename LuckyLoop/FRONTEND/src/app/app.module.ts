import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { NavComponent } from './components/nav/nav.component';
import { MainComponent } from './components/main/main.component';
import { FooterComponent } from './components/footer/footer.component';



// Definimos las rutas de la aplicación
const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },

  { path: 'home', component: MainComponent },
  // Aquí se pueden agregar más rutas según se vayan necesitando
/*   { path: 'depositar', component: DepositComponent },  */
  { path: 'blackjack', component: MainComponent }, // Usa el componente existente 
  { path: '**', redirectTo: '/home' } // Ruta para manejar rutas no encontradas
];


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    NavComponent,
    MainComponent,
    FooterComponent
    /* DepositComponent */
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }