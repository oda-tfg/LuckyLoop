<?php

namespace App\RankingBundle\Controller;

use App\RankingBundle\Service\RankingService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Ranking')]
class RankingController extends AbstractController{    
    private RankingService $rankingService;
    public function __construct(RankingService $rankingService) {
        $this->rankingService=$rankingService;
    }

    #[Route('/api/getRanking', name: 'get_ranking', methods: ['POST'])]
    public function getRanking(){
        return $this->rankingService->getRanking();
    }
}