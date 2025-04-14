<?php

namespace App\UsuarioBundle\Controller;

use App\Entity\PerfilEconomico;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

use Symfony\Component\Routing\Attribute\Route;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;





final class UsuarioController extends AbstractController
{
    #[Route('/usuario', name: 'app_usuario')]
    public function index(): Response
    {
        return $this->render('usuario/index.html.twig', [
            'controller_name' => 'UsuarioController',
        ]);
    }

    #[Route('/api/usuario/getSaldo', name: 'get_saldo', methods: ['GET'])]
    #[OA\Get(
        path: '/api/usuario/getSaldo',
        summary: 'Obtener el saldo actual de un usuario por ID',
        tags: ['Usuario'],
        parameters: [

        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Saldo del usuario encontrado',
                content: new OA\JsonContent(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'saldo', type: 'number', example: 150.75)
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: 'Usuario no encontrado',
                content: new OA\JsonContent(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'error', type: 'string', example: 'Usuario no encontrado')
                    ]
                )
            )
        ]
    )]
    public function getSaldo(): JsonResponse
    {
        $usuario = $this->getUser();

        if (!$usuario) {
            return $this->json([
                'error' => 'Usuario no encontrado',
            ], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'saldo' => $usuario->getSaldoActual()
        ]);
    }


    #[OA\Post(
        path: '/api/usuario/updateSaldo',
        summary: 'Resta o suma saldo a un usuario',
        tags: ['Usuario'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                type: 'object',
                required: ['dinero'],
                properties: [
                    new OA\Property(property: 'dinero', type: 'integer', example: 50),
                    new OA\Property(property: 'deposito', type: 'boolean', example: false)
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Saldo actualizado correctamente',
                content: new OA\JsonContent(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'message', type: 'string', example: 'Saldo actualizado correctamente'),
                        new OA\Property(property: 'nuevoSaldo', type: 'number', example: 80.5)
                    ]
                )
            ),
            new OA\Response(
                response: 400,
                description: 'Faltan datos en la petición'
            ),
            new OA\Response(
                response: 404,
                description: 'Usuario no encontrado'
            )
        ]
    )]
    #[Route('/api/usuario/updateSaldo', name: 'update_saldo', methods: ['POST'])]
    public function restarSaldoApostado(EntityManagerInterface $entityManager, Request $request)
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['dinero'])) {
            return $this->json(['message' => 'El parámetro "dinero" es requerido.'], 400);
        }

        $dinero = $data['dinero'];
        $usuario = $this->getUser();

        if ($data['deposito'] != true) {
            //RESTAR SALDO
            if ($dinero < 0) {
                if ($usuario->getSaldoActual() < abs($dinero)) {
                    return $this->json(['message' => 'No tienes tanto saldo.'], 400);
                }

                $usuario->setSaldoActual($usuario->getSaldoActual() - abs($dinero));
            } else {
                //SUMAR SALDO
                $usuario->setSaldoActual($usuario->getSaldoActual() + $dinero);
            }
        } else {
            $usuario->setSaldoActual($usuario->getSaldoActual() + $dinero);

            //Insertar en dineroDepositado
            $perfilEconomico = $entityManager->getRepository(PerfilEconomico::class)->findOneBy(['usuario' => $usuario]);
            $perfilEconomico->setDineroDepositado($perfilEconomico->getDineroDepositado() + $dinero);
        }

        $entityManager->persist($usuario);
        $entityManager->flush();

        return $this->json([
            'nuevoSaldo' => $usuario->getSaldoActual()
        ]);

    }

}
