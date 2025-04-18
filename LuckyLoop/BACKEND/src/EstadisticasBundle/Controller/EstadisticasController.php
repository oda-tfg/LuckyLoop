<?php

namespace App\EstadisticasBundle\Controller;

use App\EstadisticasBundle\Services\EstadisticasService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Nelmio\ApiDocBundle\Annotation\Areas;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Estadisticas')]
class EstadisticasController extends AbstractController{    
    private EstadisticasService $estadisticasService;
    public function __construct(EstadisticasService $estadisticasService) {
        $this->estadisticasService=$estadisticasService;
    }

    #[Route('/api/getEstadisticas', name: 'get-estadisticas', methods: ['POST'])]
    #[OA\Post(
        path: '/api/getEstadisticas',
        summary: 'Obtiene las estadísticas del usuario actual',
        description: 'Devuelve estadísticas de partidas, beneficios y juegos disponibles',
        tags: ['Estadisticas']
    )]
    #[OA\Response(
        response: 200,
        description: 'Estadísticas obtenidas con éxito',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'total_partidas', type: 'integer', example: 100),
                new OA\Property(property: 'partidas_ganadas', type: 'integer', example: 60),
                new OA\Property(property: 'partidas_perdidas', type: 'integer', example: 35),
                new OA\Property(property: 'partidas_empatadas', type: 'integer', example: 5),
                new OA\Property(property: 'beneficio_total', type: 'number', format: 'float', example: 250.75),
                new OA\Property(property: 'retirado', type: 'number', format: 'float', example: 500),
                new OA\Property(property: 'depositado', type: 'number', format: 'float', example: 300),
                new OA\Property(
                    property: 'juegos',
                    type: 'array',
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'nombre', type: 'string', example: 'Ruleta')
                        ],
                        type: 'object'
                    )
                )
            ]
        )
    )]
    #[OA\Response(
        response: 401,
        description: 'No autorizado, se requiere autenticación'
    )]
    public function getEstadisticas(): JsonResponse {
        return $this->estadisticasService->getEstadisticas();
    }

    #[Route('/api/getEstadisticas/juego/{id}', name: 'get-estadisticas-juego', methods: ['POST'])]
    #[OA\Post(
        path: '/api/getEstadisticas/juego/{id}',
        summary: 'Obtiene las estadísticas de un juego específico',
        description: 'Devuelve estadísticas detalladas de un juego concreto para el usuario actual',
        tags: ['Estadisticas']
    )]
    #[OA\Parameter(
        name: 'id',
        in: 'path',
        required: true,
        description: 'ID del juego',
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Response(
        response: 200,
        description: 'Estadísticas del juego obtenidas con éxito',
        content: new OA\JsonContent(
            description: 'Los detalles específicos dependerán del juego'
        )
    )]
    #[OA\Response(
        response: 401,
        description: 'No autorizado, se requiere autenticación'
    )]
    #[OA\Response(
        response: 404,
        description: 'Juego no encontrado'
    )]
    public function getEstadisticasJuego($id): JsonResponse {
        return $this->estadisticasService->getEstadisticasPorJuego($id);
    }
}