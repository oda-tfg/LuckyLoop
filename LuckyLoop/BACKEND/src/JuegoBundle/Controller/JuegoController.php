<?php

namespace App\JuegoBundle\Controller;

use App\JuegoBundle\Services\JuegoService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Juego')]
class JuegoController extends AbstractController
{    
    private JuegoService $juegoService;
    
    public function __construct(JuegoService $juegoService) {
        $this->juegoService = $juegoService;
    }

    #[Route('/api/getJuegos', name: 'get-juegos', methods: ['GET'])]
    #[OA\Get(
        path: '/api/getJuegos',
        summary: 'Obtiene la lista de juegos disponibles',
        description: 'Devuelve todos los datos de los juegos disponibles en el sistema',
        tags: ['Juego']
    )]
    #[OA\Response(
        response: 200,
        description: 'Lista de juegos devuelta correctamente',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'status', type: 'string', example: 'success'),
                new OA\Property(
                    property: 'data', 
                    type: 'array',
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'name', type: 'string', example: 'BlackJack'),
                            new OA\Property(property: 'image', type: 'string', example: 'assets/images/blackjack.webp'),
                            new OA\Property(property: 'category', type: 'string', example: 'Juego de Mesa'),
                            new OA\Property(property: 'isHot', type: 'boolean', example: true),
                            new OA\Property(property: 'url', type: 'string', example: '/blackjack', nullable: true)
                        ]
                    )
                )
            ]
        )
    )]
    #[OA\Response(
        response: 404,
        description: 'No se encontraron juegos',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'No se encontraron juegos')
            ]
        )
    )]
    public function getJuegos(): Response
    {
        return $this->juegoService->getJuegos();
    }
}