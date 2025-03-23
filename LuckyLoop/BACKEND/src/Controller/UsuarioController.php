<?php

namespace App\Controller;

use App\Entity\Usuario;
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

    #[Route('/api/usuario/getSaldo/{id}', name: 'get_saldo', methods: ['GET'])]
    public function getSaldo(EntityManagerInterface $entityManager, $id): Response
    {
        $usuarioRep= $entityManager->getRepository(Usuario::class);
        $usuario= $usuarioRep->find($id);

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
    public function restarSaldoApostado(EntityManagerInterface $entityManager, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
    
        if (!isset($data['id']) || !isset($data['dineroApostado'])) {
            return $this->json(['error' => 'Parámetros "id" y "dineroApostado" son requeridos.'], 400);
        }
    
        $id = $data['id'];
        $dineroApostado = $data['dineroApostado'];
    
        $usuario = $entityManager->getRepository(Usuario::class)->find($id);
    
        if (!$usuario) {
            return $this->json(['error' => 'Usuario no encontrado'], 404);
        }
    
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
