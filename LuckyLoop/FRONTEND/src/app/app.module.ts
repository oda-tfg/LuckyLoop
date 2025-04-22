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
import { FullLayoutComponent } from './components/layouts/full-layout/full-layout.component';
import { RouterModule } from '@angular/router';
import { RegistroComponent } from './components/auth/registro/registro.component';
import { AuthService } from './services/auth/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './components/auth/login/login.component';
import { RecuperarPasswordComponent } from './components/recuperar-password/recuperar-password.component';
import { CambiarPasswordComponent } from './components/cambiar-password/cambiar-password.component';
import { PlinkoComponent} from './components/plinko/plinko.component';
import { BlackjackComponent } from './components/blackjack/blackjack.component';
import { EstadisticasComponent } from './components/estadisticas/estadisticas.component';
import { CambiarNombreComponent } from './components/cambiar-nombre/cambiar-nombre.component';



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
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,  //Usar este módulo en lugar de RouterModule.forRoot
    HttpClientModule //usar este en vez de HttpClient
    
  ],
  providers: [
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }