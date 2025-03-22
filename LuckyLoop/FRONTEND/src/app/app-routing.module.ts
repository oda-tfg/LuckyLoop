import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlantillaPrincipalComponent } from './components/plantillas/plantilla-principal/plantilla-principal.component';


const routes: Routes = [
  { 
    path: '', 
    component: PlantillaPrincipalComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 

}
