<?php

namespace App\UsuarioBundle\Service;

use App\Entity\PerfilEconomico;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\SecurityBundle\Security;

class UsuarioService {
    private EntityManagerInterface $entityManager;
    private Security $security;
    
    public function __construct(EntityManagerInterface $entityManager, Security $security) {
        $this->entityManager = $entityManager;
        $this->security = $security;
    }

    public function updateSaldo(Request $request): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['dinero'])) {
            return new JsonResponse(['message' => 'El parámetro "dinero" es requerido.'], 400);
        }

        $dinero = $data['dinero'];
        $usuario = $this->security->getUser();

        if ($data['deposito'] != true) {
            //RESTAR SALDO
            if ($dinero < 0) {
                if ($usuario->getSaldoActual() < abs($dinero)) {
                    return new JsonResponse(['message' => 'No tienes tanto saldo.'], 400);
                }

                $usuario->setSaldoActual($usuario->getSaldoActual() - abs($dinero));
            } else {
                //SUMAR SALDO
                $usuario->setSaldoActual($usuario->getSaldoActual() + $dinero);
            }
        } else {
            $usuario->setSaldoActual($usuario->getSaldoActual() + $dinero);

            //Insertar en dineroDepositado
            $perfilEconomico = $this->entityManager->getRepository(PerfilEconomico::class)->findOneBy(['usuario' => $usuario]);
            $perfilEconomico->setDineroDepositado($perfilEconomico->getDineroDepositado() + $dinero);
        }

        $this->entityManager->persist($usuario);
        $this->entityManager->flush();

        return new JsonResponse([
            'nuevoSaldo' => $usuario->getSaldoActual()
        ]);
    }

    public function getSaldo(){
        $usuario = $this->security->getUser();

        if (!$usuario) {
            return new JsonResponse([
                'error' => 'Usuario no encontrado',
            ], 400);
        }

        return new JsonResponse([
            'saldo' => $usuario->getSaldoActual()
        ]);
    }
}