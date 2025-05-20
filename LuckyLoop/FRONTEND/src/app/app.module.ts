import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
// Importar correctamente
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { NavComponent } from './components/nav/nav.component';
import { MainComponent } from './components/main/main.component';
import { FooterComponent } from './components/footer/footer.component';
import { DepositComponent } from './components/deposit/deposit.component';
import { FullLayoutComponent } from './components/layouts/full-layout/full-layout.component';
import { RegistroComponent } from './components/auth/registro/registro.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RecuperarPasswordComponent } from './components/recuperar-password/recuperar-password.component';
import { CambiarPasswordComponent } from './components/cambiar-password/cambiar-password.component';
import { PlinkoComponent } from './components/plinko/plinko.component';
import { BlackjackComponent } from './components/blackjack/blackjack.component';
import { RuletaComponent } from './components/ruleta/ruleta.component';
import { CrashComponent } from './components/crash/crash.component';

import { EstadisticasComponent } from './components/estadisticas/estadisticas.component';
import { CambiarNombreComponent } from './components/cambiar-nombre/cambiar-nombre.component';

import { AuthService } from './services/auth/auth.service';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    NavComponent,
    MainComponent,
    FooterComponent,
    DepositComponent,
    FullLayoutComponent,
    RegistroComponent,
    LoginComponent,
    RecuperarPasswordComponent,
    CambiarPasswordComponent,
    PlinkoComponent,
    BlackjackComponent,
    EstadisticasComponent,
    CambiarNombreComponent,
    RuletaComponent,
    CrashComponent 
   ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule  ],
  providers: [
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}