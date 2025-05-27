<?php

namespace App\ManagerBundle\Controller;

use App\ManagerBundle\Service\ManagerService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Juego')]
class ManagerController extends AbstractController
{
    private ManagerService $managerService;

    public function __construct(ManagerService $managerService)
    {
        $this->managerService = $managerService;
    }

    #[Route('/manager/getEstadisticas', name: 'get_estadisticas_manager', methods: ['GET'])]
    public function getEstadisticas(): Response
    {
        return $this->managerService->getEstadisticas();
    }

}