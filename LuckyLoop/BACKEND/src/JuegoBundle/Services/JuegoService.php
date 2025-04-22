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
        
        //datos de los juegos
        $responseData = [];
        foreach ($juegos as $juego) {
            $responseData[] = [
                'id' => $juego->getId(),
                'name' => $juego->getNombre(),
                'image' => 'assets/images/' . strtolower(str_replace(' ', '', $juego->getNombre())) . '.webp',
                'category' => 'Categoría de juego',
                'isHot' => true,
                'url' => '/'.$juego->getNombre()
            ];
        }
        
        return new JsonResponse([
            'status' => 'success',
            'data' => $responseData
        ], Response::HTTP_OK);
    }
}