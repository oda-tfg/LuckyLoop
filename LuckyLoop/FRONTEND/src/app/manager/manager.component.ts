import { Component, OnInit, OnDestroy } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Subject, takeUntil } from 'rxjs';
import { EstadisticasData, ManagerService } from './manager.service';

Chart.register(...registerables);

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  standalone:false,
  styleUrls: ['./manager.component.css']
})
export class ManagerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  loading = true;
  error = false;
  
  private charts: Chart[] = [];

  constructor(private managerService: ManagerService) {}

  ngOnInit(): void {
    this.loadEstadisticas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }

  private loadEstadisticas(): void {
    this.managerService.getEstadisticas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.loading = false;
          setTimeout(() => {
            this.createCharts(data);
          }, 100);
        },
        error: (err) => {
          this.loading = false;
          this.error = true;
          console.error('Error loading estadísticas:', err);
        }
      });
  }

  private createCharts(data: EstadisticasData): void {
    this.createDineroUsuarioChart(data.dineroUsuario);
    this.createApostadoFechasChart(data.apostadoFechas);
    this.createBeneficioFechasChart(data.beneficioFechas);
    this.createPositivoNegativoChart(data.numPersonasNegativoPositivo);
  }

  private createDineroUsuarioChart(data: Array<{ usuario: string; beneficio: number }>): void {
    const ctx = document.getElementById('dineroUsuarioChart') as HTMLCanvasElement;
    if (!ctx) return;

    const sortedData = data.sort((a, b) => b.beneficio - a.beneficio);
    
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sortedData.map(item => item.usuario),
        datasets: [{
          label: 'Beneficio',
          data: sortedData.map(item => item.beneficio),
          backgroundColor: sortedData.map(item => 
            item.beneficio >= 0 ? 'rgba(35, 255, 0, 0.7)' : 'rgba(255, 58, 58, 0.7)'
          ),
          borderColor: sortedData.map(item => 
            item.beneficio >= 0 ? '#23ff00' : '#ff3a3a'
          ),
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(10, 10, 25, 0.9)',
            borderColor: '#5100ff',
            borderWidth: 1,
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (context) => `Beneficio: €${context.parsed.y.toFixed(2)}`
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(81, 0, 255, 0.1)',
              display: true
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          },
          y: {
            grid: {
              color: 'rgba(81, 0, 255, 0.1)',
              display: true
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 12
              },
              callback: (value) => `€${value}`
            }
          }
        }
      }
    });
    
    this.charts.push(chart);
  }

  private createApostadoFechasChart(data: { [key: string]: number }): void {
    const ctx = document.getElementById('apostadoFechasChart') as HTMLCanvasElement;
    if (!ctx) return;

    const dates = Object.keys(data).sort();
    const values = dates.map(date => data[date]);
    
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates.map(date => this.formatDate(date)),
        datasets: [{
          label: 'Dinero Apostado',
          data: values,
          borderColor: '#00d9ff',
          backgroundColor: 'rgba(0, 217, 255, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          pointBackgroundColor: '#00d9ff',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(10, 10, 25, 0.9)',
            borderColor: '#00d9ff',
            borderWidth: 1,
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (context) => `Apostado: €${context.parsed.y.toFixed(2)}`
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(0, 217, 255, 0.1)',
              display: true
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 11
              }
            }
          },
          y: {
            grid: {
              color: 'rgba(0, 217, 255, 0.1)',
              display: true
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 12
              },
              callback: (value) => `€${value}`
            }
          }
        }
      }
    });
    
    this.charts.push(chart);
  }

  private createBeneficioFechasChart(data: { [key: string]: number }): void {
    const ctx = document.getElementById('beneficioFechasChart') as HTMLCanvasElement;
    if (!ctx) return;

    const dates = Object.keys(data).sort();
    const values = dates.map(date => data[date]);
    
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dates.map(date => this.formatDate(date)),
        datasets: [{
          label: 'Beneficio',
          data: values,
          backgroundColor: values.map(v => 
            v >= 0 ? 'rgba(35, 255, 0, 0.7)' : 'rgba(255, 58, 58, 0.7)'
          ),
          borderColor: values.map(v => 
            v >= 0 ? '#23ff00' : '#ff3a3a'
          ),
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(10, 10, 25, 0.9)',
            borderColor: '#5100ff',
            borderWidth: 1,
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (context) => `Beneficio: €${context.parsed.y.toFixed(2)}`
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(81, 0, 255, 0.1)',
              display: true
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 11
              }
            }
          },
          y: {
            grid: {
              color: 'rgba(81, 0, 255, 0.1)',
              display: true
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 12
              },
              callback: (value) => `€${value}`
            }
          }
        }
      }
    });
    
    this.charts.push(chart);
  }

  private createPositivoNegativoChart(data: { positivo: number; negativo: number }): void {
    const ctx = document.getElementById('positivoNegativoChart') as HTMLCanvasElement;
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['En Positivo', 'En Negativo'],
        datasets: [{
          data: [data.positivo, data.negativo],
          backgroundColor: [
            'rgba(35, 255, 0, 0.8)',
            'rgba(255, 58, 58, 0.8)'
          ],
          borderColor: [
            '#23ff00',
            '#ff3a3a'
          ],
          borderWidth: 3,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#ffffff',
              font: {
                size: 14,
                weight: 'bold'
              },
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(10, 10, 25, 0.9)',
            borderColor: '#5100ff',
            borderWidth: 1,
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            padding: 12,
            displayColors: true,
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = data.positivo + data.negativo;
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} usuarios (${percentage}%)`;
              }
            }
          }
        },
        cutout: '60%'
      }
    });
    
    this.charts.push(chart);
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  }

  private destroyCharts(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
  }

  retry(): void {
    this.error = false;
    this.loading = true;
    this.loadEstadisticas();
  }
}