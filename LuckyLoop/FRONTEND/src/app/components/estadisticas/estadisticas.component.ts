import { Component, OnInit } from '@angular/core';
import { EstadisticasService, EstadisticasResponse, Juego, EstadisticasJuegoResponse } from '../../services/estadisticas/estadisticas.service';

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.component.html',
  standalone: false,
  styleUrls: ['./estadisticas.component.css']
})
export class EstadisticasComponent implements OnInit {
  // Datos de estadísticas
  estadisticas: EstadisticasResponse = {
    total_partidas: 0,
    partidas_ganadas: 0,
    partidas_perdidas: 0,
    partidas_empatadas: 0,
    beneficio_total: 0,
    retirado: 0,
    depositado: 0,
    juegos: []
  };

  // Estado de carga
  cargando: boolean = true;
  
  // Juego seleccionado para mostrar estadísticas detalladas
  juegoSeleccionado: Juego | null = null;
  
  // Estadísticas del juego seleccionado
  estadisticasJuego: EstadisticasJuegoResponse | null = null;
  
  // Estado de carga para estadísticas de juego
  cargandoEstadisticasJuego: boolean = false;

  constructor(private estadisticasService: EstadisticasService) { }

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  /**
   * Carga las estadísticas del usuario
   */
  cargarEstadisticas(): void {
    this.cargando = true;
    
    this.estadisticasService.getEstadisticas().subscribe({
      next: (response) => {
        this.estadisticas = response;
        console.log('Estadísticas cargadas:', this.estadisticas);
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        this.cargando = false;
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    });
  }

  /**
   * Maneja la selección de un juego para mostrar sus estadísticas detalladas
   * @param juego El juego seleccionado
   */
  seleccionarJuego(juego: Juego): void {
    this.juegoSeleccionado = juego;
    console.log('Juego seleccionado:', juego);
    
    // Cargar estadísticas específicas del juego
    this.cargarEstadisticasJuego(juego.id);
  }
  
  /**
   * Carga las estadísticas específicas de un juego
   * @param juegoId ID del juego seleccionado
   */
  cargarEstadisticasJuego(juegoId: number): void {
    this.cargandoEstadisticasJuego = true;
    this.estadisticasJuego = null;
    
    this.estadisticasService.getEstadisticasJuego(juegoId).subscribe({
      next: (response) => {
        this.estadisticasJuego = response;
        console.log('Estadísticas del juego cargadas:', this.estadisticasJuego);
        this.cargandoEstadisticasJuego = false;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas del juego:', error);
        this.cargandoEstadisticasJuego = false;
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    });
  }

  /**
   * Calcula el porcentaje de victorias
   */
  get porcentajeVictorias(): number {
    if (this.estadisticas.total_partidas === 0) return 0;
    return (this.estadisticas.partidas_ganadas / this.estadisticas.total_partidas) * 100;
  }

  /**
   * Calcula el porcentaje de derrotas
   */
  get porcentajeDerrotas(): number {
    if (this.estadisticas.total_partidas === 0) return 0;
    return (this.estadisticas.partidas_perdidas / this.estadisticas.total_partidas) * 100;
  }

  
}