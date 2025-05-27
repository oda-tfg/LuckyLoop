<?php

namespace App\ManagerBundle\Service;

class ManagerService{

    public function __construct() {
        $this->var = $var;
    }

    public function getEstadisticas(): array
    {
        // Aquí iría la lógica para obtener las estadísticas del juego.
        // Por ejemplo, podrías consultar una base de datos o realizar cálculos.
        
        // Retornamos un ejemplo de estadísticas.
        return [
            'total_jugadores' => 100,
            'partidas_jugadas' => 250,
            'mejor_puntuacion' => 5000,
        ];
    }
}