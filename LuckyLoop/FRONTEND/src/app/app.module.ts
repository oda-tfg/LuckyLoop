import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NavComponent } from './components/nav/nav.component';

import { JuegoComponent } from './components/juego/juego.component';
import { SeccionJuegosComponent } from './components/seccion-juegos/seccion-juegos.component';
import { HeaderComponent } from './components/header/header.component';
import { PlantillaPrincipalComponent } from './components/plantillas/plantilla-principal/plantilla-principal.component';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,

    NavComponent,

    JuegoComponent,
    SeccionJuegosComponent,
    HeaderComponent,
    PlantillaPrincipalComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
