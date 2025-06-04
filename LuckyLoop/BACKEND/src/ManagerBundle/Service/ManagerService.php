<?php

namespace App\ManagerBundle\Service;

use App\EstadisticasBundle\Services\EstadisticasService;

class ManagerService{

    private EstadisticasService $estadisticasService;

    public function __construct(EstadisticasService $estadisticasService) {
        $this->estadisticasService=$estadisticasService;
    }

    public function getEstadisticas(): array
    {
        //Dinero ganado y usuario
        $graficas['dineroUsuario']=$this->getGraficaDineroUsuario(); //PALOTES

        //Dinero apostado y fechas por partida
        $graficas['apostadoFechas']=$this->getApostadoFechas(); //GRÁFICA NORMAL

        //Beneficio y fecha por partida
        $graficas['beneficioFechas']=$this->getBeneficioFechas(); //ESTILO PALOTES

        //Numero de persona en positivo y nuemero de personas en negativo
        $graficas['numPersonasNegativoPositivo']=$this->getNumeroPositivoNegativo(); //GRAFICA ESTILO GALLETA
    }

    private function getGraficaDineroUsuario(){
        $this->estadisticasService->getEstadisticas();
    }
}