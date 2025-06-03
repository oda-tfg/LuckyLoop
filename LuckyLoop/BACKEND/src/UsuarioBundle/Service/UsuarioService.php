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

        if ($data['deposito'] != true && $data['retirada'] != true) {
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
        } elseif ($data['deposito'] = true && $data['retirada'] != true) {
            $usuario->setSaldoActual($usuario->getSaldoActual() + $dinero);

            //Insertar en dineroDepositado
            $perfilEconomico = $this->entityManager->getRepository(PerfilEconomico::class)->findOneBy(['usuario' => $usuario]);
            $perfilEconomico->setDineroDepositado($perfilEconomico->getDineroDepositado() + $dinero);

        } else{
            $usuario->setSaldoActual($usuario->getSaldoActual() - $dinero);

            //Insertar en dineroRetirado
            $perfilEconomico = $this->entityManager->getRepository(PerfilEconomico::class)->findOneBy(['usuario' => $usuario]);
            $perfilEconomico->setDineroRetirado($perfilEconomico->getDineroRetirado() + $dinero);
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

    
    public function cambiarNombre(Request $request): JsonResponse
    {
        //buscar usuario
        $usuario = $this->security->getUser();

        $data = json_decode($request->getContent(), true);
        $nuevoNombre = $data['nombre'] ?? null;

        if (!$nuevoNombre || trim($nuevoNombre) === '') {
            return new JsonResponse([
                'error' => 'El campo de nombre no puede estar vacío. Por favor, ingrese un nombre válido.'
            ], 400);
        }

        if ($usuario->getNombre() == $nuevoNombre) {
            return new JsonResponse([
                'error' => 'El nombre proporcionado es idéntico al actual. Por favor, elija un nombre diferente.'
            ], 400);
        }

        //cambiar nombre
        $usuario->setNombre($nuevoNombre);
        $this->entityManager->persist($usuario);
        $this->entityManager->flush();

        return new JsonResponse([
            'mensaje' => '¡Nombre actualizado con éxito! Su nuevo nombre de usuario ha sido guardado.',
            'nuevoNombre' => $nuevoNombre,
            'codigo' => 200,
            'fechaActualizacion' => (new \DateTime())->format('Y-m-d H:i:s')
        ]);
    }
}