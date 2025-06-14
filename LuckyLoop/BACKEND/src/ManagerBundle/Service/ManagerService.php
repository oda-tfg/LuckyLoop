<?php

namespace App\ManagerBundle\Service;

use App\Entity\Partida;
use App\EstadisticasBundle\Services\EstadisticasService;
use App\RankingBundle\Service\RankingService;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\SecurityBundle\Security;


class ManagerService
{

    private Security $security;
    private RankingService $rankingService;
    private EntityManagerInterface $em;
    public function __construct(RankingService $rankingService, EntityManagerInterface $em, Security $security)
    {
        $this->rankingService = $rankingService;
        $this->em = $em;
        $this->security=$security;
    }

    public function getEstadisticas()
    {
        $usuario = $this->security->getUser();

        if($usuario->getRoles()[0]!='ROLE_MANAGER'){
            throw new Exception('HAS DE SER MANAGER PARA ACCEDER');
            
        }

        //Dinero ganado y usuario
        $graficas['dineroUsuario'] = $this->getGraficaDineroUsuario(); //PALOTES

        //Dinero apostado y fechas por partida
        $graficas['apostadoFechas'] = $this->getApostadoFechas(); //GRÁFICA NORMAL

        //Beneficio y fecha por partida
        $graficas['beneficioFechas'] = $this->getBeneficiosFechas(); //ESTILO PALOTES

        //Numero de persona en positivo y nuemero de personas en negativo
        $graficas['numPersonasNegativoPositivo'] = $this->getNumeroPositivoNegativo(); //GRAFICA ESTILO GALLETA

        return new JsonResponse($graficas);
    }

    private function getGraficaDineroUsuario()
    {

        //YA QUE TENEMOS LOS QUE MAS DINERO HAN GANADO REUTILIZAMOS
        return json_decode($this->rankingService->getRanking()->getContent(), true);
    }

    private function getApostadoFechas()
    {
        $partidas = $this->em->getRepository(Partida::class)->findAll();

        $grafica = [];

        foreach ($partidas as $partida) {
            $fecha = $partida->getFechaJuego()->format('Y-m-d');
            $dineroApostado = $partida->getDineroApostado();

            if (isset($grafica[$fecha])) {
                $grafica[$fecha] += $dineroApostado;
            } else {
                $grafica[$fecha] = $dineroApostado;
            }

        }

        return $grafica;
    }

    private function getBeneficiosFechas()
    {
        $partidas = $this->em->getRepository(Partida::class)->findAll();

        $grafica = [];

        foreach ($partidas as $partida) {
            $fecha = $partida->getFechaJuego()->format('Y-m-d');
            $beneficio = $partida->getBeneficio();

            if (isset($grafica[$fecha])) {
                $grafica[$fecha] += $beneficio;
            } else {
                $grafica[$fecha] = $beneficio;
            }

        }

        return $grafica;
    }

    private function getNumeroPositivoNegativo(){

        $usuariosBeneficios=json_decode($this->rankingService->getRanking()->getContent(), true);

        $grafica=[
            'positivo'=>0,
            'negativo'=>0
        ];

        foreach ($usuariosBeneficios as $usuario) {

            if($usuario['beneficio']>=0){
                $grafica['positivo']++;
            }else{
                $grafica['negativo']++;
            }
        }

        return $grafica;
    }
}