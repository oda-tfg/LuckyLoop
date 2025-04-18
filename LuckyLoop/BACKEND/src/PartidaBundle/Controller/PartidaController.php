<?php

namespace App\PartidaBundle\Controller;

use App\PartidaBundle\Services\PartidaService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Partida')]
class PartidaController extends AbstractController{    
    private PartidaService $partidaService;
    public function __construct(PartidaService $partidaService) {
        $this->partidaService=$partidaService;
    }

    #[Route('/api/finPartida', name: 'fin-partida', methods: ['POST'])]
    #[OA\Post(
        path: '/api/finPartida',
        summary: 'Inserta los datos de la partida',
        description: 'Inserta los datos de la partida',
        tags: ['Partida']
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'juego_id', type: 'integer', example: 1, description: 'ID del juego'),
                new OA\Property(property: 'beneficio', type: 'number', format: 'float', example: 25.50, description: 'Beneficio obtenido en la partida'),
                new OA\Property(property: 'dinero_apostado', type: 'number', format: 'float', example: 10.00, description: 'Cantidad apostada en la partida'),
                new OA\Property(property: 'resultado', type: 'string', example: 'victoria', description: 'Resultado de la partida (victoria, derrota, empate)')
            ],
            required: ['juego_id', 'beneficio', 'dinero_apostado', 'resultado']
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Datos insertados',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'Partida registrada correctamente'),
                new OA\Property(property: 'partida_id', type: 'integer', example: 42)
            ]
        )
    )]
    #[OA\Response(
        response: 400,
        description: 'Error en los parámetros',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'Falta un parámetro requerido')
            ]
        )
    )]
    #[OA\Response(
        response: 401,
        description: 'No autorizado, se requiere autenticación'
    )]
    public function finPartida(Request $request) {
       return $this->partidaService->finPartida($request);
    }
}