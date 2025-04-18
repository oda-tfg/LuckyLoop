<?php

namespace App\PartidaBundle\Services;

use App\Entity\Juego;
use App\Entity\Partida;
use App\Entity\ResultadoPartida;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\SecurityBundle\Security;

class PartidaService {
    private $em;
    private $security;
    
    public function __construct(EntityManagerInterface $em, Security $security) {
        $this->em = $em;
        $this->security = $security;
    }

    public function finPartida(Request $request) {
        $data = json_decode($request->getContent(), true);
        
        $juego = $this->em->getRepository(Juego::class)->find($data['juego_id']);

        $partida = new Partida();
        $partida->setUsuario($this->security->getUser());
        $partida->setJuego($juego);
        $partida->setBeneficio($data['beneficio']);
        $partida->setDineroApostado($data['dinero_apostado']);
        $partida->setResultado( ResultadoPartida::from($data['resultado']));
        $partida->setFechaJuego(new DateTime());
        
        $this->em->persist($partida);
        $this->em->flush();

        return new JsonResponse(['message'=>'Partida insertada']);
    }
}