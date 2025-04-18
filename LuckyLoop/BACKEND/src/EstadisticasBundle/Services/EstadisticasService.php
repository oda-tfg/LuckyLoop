<?php

namespace App\EstadisticasBundle\Services;

use App\Entity\Juego;
use App\Entity\Partida;
use App\Entity\PerfilEconomico;
use App\Entity\Usuario;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Exception\AuthenticationException;

class EstadisticasService
{
    private EntityManagerInterface $em;
    private Security $security;

    public function __construct(EntityManagerInterface $em, Security $security) 
    {
        $this->em = $em;
        $this->security = $security;
    }

    public function getEstadisticas()
    {
        $usuario = $this->security->getUser();

        $juegos=$this->em->getRepository(Juego::class)->findAll();
        $arrayJuegos=[];
        foreach ($juegos as $juego) {
            $arrayJuegos[]=[
                'id'=>$juego->getId(),
                'nombre'=>$juego->getNombre()
            ];
        }

        $partidas = $this->em->getRepository(Partida::class)->findBy(['usuario' => $usuario]);
        $numeroPartidas=count($partidas);
        $derrotas=0;
        $victorias=0;
        $empates=0;

        foreach ($partidas as $partida) {
            if($partida->isDerrota()){
                $derrotas++;
            }elseif ($partida->isVictoria()) {
                $victorias++;
            }else{
                $empates++;
            }
        }

        $saldoActual=$usuario->getSaldoActual();

        $perfilEconomico=$this->em->getRepository(PerfilEconomico::class)->findOneBy(['usuario'=>$usuario]);
        $retirado=$perfilEconomico->getDineroRetirado();
        $depositado=$perfilEconomico->getDineroDepositado();

        $beneficio=($retirado+$saldoActual)-$depositado;
        
        return new JsonResponse([
            'total_partidas' => $numeroPartidas,
            'partidas_ganadas'=>$victorias,
            'partidas_perdidas'=>$derrotas,
            'partidas_empatadas'=>$empates,
            'beneficio_total'=>$beneficio,
            'retirado'=>$retirado,
            'depositado'=>$depositado,
            'juegos'=>$arrayJuegos
        ]);
    }
    

    public function getEstadisticasPorJuego(int $juegoId)
    {
        $usuario = $this->security->getUser();
        
        if (!$usuario) {
            throw new AuthenticationException('Usuario no autenticado');
        }
        
        $partidas = $this->em->getRepository(Partida::class)->findBy([
            'usuario' => $usuario,
            'juego' => $juegoId
        ]);
        
        $numeroPartidas = count($partidas);
        $partidasGanadas = 0;
        $partidasEmpatadas = 0;
        $partidasPerdidas = 0;
        $beneficioTotal = 0;
        
        foreach ($partidas as $partida) {
            if ($partida->isVictoria()) {
                $partidasGanadas++;
                $beneficioTotal += $partida->getBeneficio();
            } elseif($partida->isDerrota()) {
                $partidasPerdidas++;
                $beneficioTotal -= $partida->getDineroApostado();
            }else{
                $partidasEmpatadas++;
            }
        }
        
        return new JsonResponse([
            'juego_id' => $juegoId,
            'total_partidas' => $numeroPartidas,
            'partidas_ganadas' => $partidasGanadas,
            'partidas_perdidas' => $partidasPerdidas,
            'partidas_empatadas'=>$partidasEmpatadas,
            'beneficio_total' => $beneficioTotal
        ]);
    }
}