<?php

namespace App\JuegoBundle\Services;

use App\Entity\Juego;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class JuegoService
{
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    /**
     * Devuelve lista de juegos desde la base de datos.
     * @return JsonResponse
     */
    public function getJuegos(): JsonResponse
    {
        //obtener juegos de la BD
        $juegos = $this->entityManager->getRepository(Juego::class)->findAll();
        
        if (empty($juegos)) {
            return new JsonResponse(['message' => 'No se encontraron juegos'], Response::HTTP_NOT_FOUND);
        }
        
        //Paso 1: contar partidas de cada juego
        foreach ($juegos as $juego) {
            $cantidadPartidas = count($juego->getPartidas());
            $juego->cantidadPartidas = $cantidadPartidas;
        }
        
        //Paso 2: ordenar los juegos de mayor a menor
        usort($juegos, function($a, $b) {
            return $b->cantidadPartidas - $a->cantidadPartidas;
        });

        //Paso 3: marcar los 2 primeros juegos como hot
        $responseData = [];
        foreach ($juegos as $index => $juego) {
            $isHot = $index < 2; //Los dos primeros juegos son hot

            $responseData[] = [
                'id' => $juego->getId(),
                'name' => $juego->getNombre(),
                'image' => 'assets/images/' . strtolower(str_replace(' ', '', $juego->getNombre())) . '.webp',
                //'category' => 'Categoría de juego',
                'isHot' => $isHot,
                'url' => '/' . strtolower(str_replace(' ', '', $juego->getNombre()))
            ];
        }

        return new JsonResponse([
            'status' => 'success',
            'data' => $responseData
        ], Response::HTTP_OK);
    }
}