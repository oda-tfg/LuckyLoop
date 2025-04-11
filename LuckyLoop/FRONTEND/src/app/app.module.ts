import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module'; // Importar el módulo de rutas

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { NavComponent } from './components/nav/nav.component';
import { MainComponent } from './components/main/main.component';
import { FooterComponent } from './components/footer/footer.component';
import { DepositComponent } from './components/deposit/deposit.component';
import { RuletaComponent } from './components/ruleta/ruleta.component';
import { FullLayoutComponent } from './components/layouts/full-layout/full-layout.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    NavComponent,
    MainComponent,
    FooterComponent,
    DepositComponent,
    RuletaComponent,
    FullLayoutComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule  // Usar este módulo en lugar de RouterModule.forRoot
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }