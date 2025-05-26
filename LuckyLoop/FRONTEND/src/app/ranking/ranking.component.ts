import { Component, OnInit } from '@angular/core';
import { RankingService, Usuario } from './ranking.service';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  standalone:false,
  styleUrls: ['./ranking.component.css']
})
export class RankingComponent implements OnInit {
  usuarios: Usuario[] = [];
  topTres: Usuario[] = [];
  restoUsuarios: Usuario[] = [];
  usuarioSeleccionado: Usuario | null = null;
  loading = true;
  error: string | null = null;

  constructor(private rankingService: RankingService) { }

  ngOnInit(): void {
    this.cargarRanking();
  }

  cargarRanking(): void {
    this.loading = true;
    this.rankingService.getRanking().subscribe({
      next: (data) => {
        // Ordenar por beneficio de mayor a menor
        this.usuarios = data.sort((a, b) => b.beneficio - a.beneficio);
        
        // Separar top 3 y resto
        this.topTres = this.usuarios.slice(0, 3);
        this.restoUsuarios = this.usuarios.slice(3, 10); // Los siguientes 7
        
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el ranking';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  seleccionarUsuario(usuario: Usuario): void {
    this.usuarioSeleccionado = usuario;
  }

  cerrarDetalle(): void {
    this.usuarioSeleccionado = null;
  }

  getPosicion(usuario: Usuario): number {
    return this.usuarios.indexOf(usuario) + 1;
  }

  getClasePodio(posicion: number): string {
    switch(posicion) {
      case 1: return 'oro';
      case 2: return 'plata';
      case 3: return 'bronce';
      default: return '';
    }
  }

  formatearBeneficio(beneficio: number): string {
    const signo = beneficio >= 0 ? '+' : '';
    return `${signo}${beneficio.toFixed(2)}€`;
  }
}