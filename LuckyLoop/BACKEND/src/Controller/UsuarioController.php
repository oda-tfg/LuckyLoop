<?php

namespace App\Controller;

use App\Entity\Usuario;
use App\Service\MailService;
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
        $usuario=$this->getUser();

        if (!$usuario) {
            return $this->json([
                'error' => 'Usuario no encontrado',
            ], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'saldo' => $usuario->getSaldoActual()
        ]);
    }


    #[Route('/api/usuario/restarSaldoApostado', name: 'restar_saldo', methods: ['POST'])]
    #[OA\Post(
        path: '/api/usuario/restarSaldoApostado',
        summary: 'Resta saldo a un usuario después de apostar',
        tags: ['Usuario'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                type: 'object',
                required: ['id', 'dineroApostado'],
                properties: [
                    new OA\Property(property: 'id', type: 'integer', example: 5),
                    new OA\Property(property: 'dineroApostado', type: 'number', format: 'float', example: 20.5)
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



    #[Route('/api/usuario/restarSaldoApostado', name: 'restar_saldo', methods: ['POST'])]
    public function restarSaldoApostado(EntityManagerInterface $entityManager, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Validar que se envió el dinero a apostar
        if (!isset($data['dineroApostado'])) {
            return $this->json(['error' => 'El parámetro "dineroApostado" es requerido.'], 400);
        }

        $dineroApostado = $data['dineroApostado'];
        
        // Obtener el usuario autenticado directamente del token
        $usuario = $this->getUser();

        if (!$usuario) {
            return $this->json(['error' => 'Usuario no autenticado'], 401);
        }

        // Verificar que el usuario es instancia de la entidad Usuario
        if (!$usuario instanceof Usuario) {
            return $this->json(['error' => 'Tipo de usuario no válido'], 403);
        }

        // Validar que el saldo no sea negativo después de la operación
        if ($usuario->getSaldoActual() < $dineroApostado) {
            return $this->json([
                'error' => 'Saldo insuficiente',
                'saldoActual' => $usuario->getSaldoActual()
            ], 400);
        }

        // Realizar la operación
        $nuevoSaldo = $usuario->getSaldoActual() - $dineroApostado;
        $usuario->setSaldoActual($nuevoSaldo);

        $entityManager->persist($usuario);
        $entityManager->flush();

        return $this->json([
            'message' => 'Saldo actualizado correctamente',
            'nuevoSaldo' => $nuevoSaldo
        ]);
    }

}
