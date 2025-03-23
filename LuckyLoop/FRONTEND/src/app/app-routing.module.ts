import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlantillaPrincipalComponent } from './components/plantillas/plantilla-principal/plantilla-principal.component';
import { UnityGameComponent } from './components/unity-game/unity-game.component';

const routes: Routes = [
  { 
    path: '', 
    component: PlantillaPrincipalComponent
  },
  {
    path: 'juego', 
    component: UnityGameComponent  // Ruta del juego (solo Unity, sin plantilla)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 

}
