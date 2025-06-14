<?php

namespace App\RankingBundle\Service;

use App\Entity\PerfilEconomico;
use App\Entity\Usuario;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class RankingService
{
    private $em;
    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public function getRanking()
    {
        $usuarios = $this->em->getRepository(Usuario::class)->findAll();

        $rankingUsuarios = $this->encontrarMayoresGanadores($usuarios);

        return new JsonResponse($rankingUsuarios);
    }

    public function encontrarMayoresGanadores($usuarios)
    {
        $ganadores = [];

        // Array para almacenar usuarios con su beneficio
        $usuariosConBeneficio = [];

        foreach ($usuarios as $usuario) {
            if ($usuario->getRoles()[0] != 'ROLE_MANAGER') {
                $perfilEconomico = $this->em->getRepository(PerfilEconomico::class)->findOneBy(['usuario' => $usuario]);

                if (isset($perfilEconomico)) {
                    $dineroDepositado = $perfilEconomico->getDineroDepositado();
                    $dineroRetirado = $perfilEconomico->getDineroRetirado();
                    $saldoActual = $usuario->getSaldoActual();

                    $beneficioTotal = $saldoActual - $dineroDepositado + $dineroRetirado;

                    $usuariosConBeneficio[] = [
                        'usuario' => $usuario->getNombre(),
                        'beneficio' => $beneficioTotal
                    ];
                }
            }

        }

        // Ordenamos el array por beneficio en orden descendente
        usort($usuariosConBeneficio, function ($a, $b) {
            return $b['beneficio'] <=> $a['beneficio'];
        });

        $limite = min(10, count($usuariosConBeneficio));

        for ($i = 0; $i < $limite; $i++) {
            $ganadores[] = $usuariosConBeneficio[$i];
        }

        return $ganadores;
    }
}