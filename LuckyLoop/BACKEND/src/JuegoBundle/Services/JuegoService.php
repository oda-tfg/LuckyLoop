<?php

namespace App\JuegoBundle\Services;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class JuegoService
{
    /**
     * Devuelve lista de juegos y coger id y nombre
     * @return JsonResponse
     */
    public function getJuegos(): JsonResponse
    {
        //lista de juegos
        $juegos = [
            [
                'id' => 1,
                'name' => 'BlackJack',
                'image' => 'assets/images/blackjack.webp',
                'category' => 'Juego de Mesa',
                'isHot' => true,
                'url' => '/blackjack'
            ],
            [
                'id' => 2,
                'name' => 'Plinko',
                'image' => 'assets/images/plinko.webp',
                'category' => 'Juego de Azar',
                'isHot' => true,
                'url' => '/plinko'
            ],
            [
                'id' => 3,
                'name' => 'Ruleta',
                'image' => 'assets/images/ruleta.webp',
                'category' => 'Juego de Mesa',
                'isHot' => false,
                'url' => '/ruleta'
            ],
            [
                'id' => 4,
                'name' => 'Programa y Gana',
                'image' => 'assets/images/programaGana.webp',
                'category' => 'Juego de Programación',
                'isHot' => true,
                'url' => null
            ]
        ];
        
        if (empty($juegos)) {
            return new JsonResponse(['message' => 'No se encontraron juegos'], Response::HTTP_NOT_FOUND);
        }
        
        //coger id, nombre e imagen
        $responseData = [];
        foreach ($juegos as $juego) {
            $responseData[] = [
                'id' => $juego['id'],
                'name' => $juego['name'],
                'image' => $juego['image'],
                'url' => $juego['url']
            ];
        }
        
        return new JsonResponse([
            'status' => 'success',
            'data' => $responseData
        ], Response::HTTP_OK);
    }
}