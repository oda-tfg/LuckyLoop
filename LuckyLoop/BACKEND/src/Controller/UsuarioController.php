<?php

namespace App\Controller;

use App\Entity\Usuario;
use App\Service\MailService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\MailerInterface;
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
    #[OA\Get(
        path: '/api/usuario/getSaldo/{id}',
        summary: 'Obtener el saldo actual de un usuario por ID',
        tags: ['Usuario'],
        parameters: [
            new OA\Parameter(
                name: 'id',
                in: 'path',
                required: true,
                description: 'ID del usuario',
                schema: new OA\Schema(type: 'integer', example: 5)
            )
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
    public function getSaldo(EntityManagerInterface $entityManager, $id): JsonResponse
    {
        $usuarioRep = $entityManager->getRepository(Usuario::class);
        $usuario = $usuarioRep->find($id);

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

    #[Route('/api/usuario/emailToken', name: 'generar_token', methods: ['POST'])]
    #[OA\Post(
        path: '/api/usuario/emailToken',
        summary: 'Genera un token a un usuario si su email existe y le envia un email',
        tags: ['Usuario'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                type: 'object',
                required: ['email'],
                properties: [
                    new OA\Property(property: 'email', type: 'email', example: 'example@gmail.com'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Email enviado correctamente',
                content: new OA\JsonContent(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'message', type: 'string', example: 'Email enviado correctamente'),
                    ]
                )
            ),
            new OA\Response(
                response: 400,
                description: 'Faltan datos en la petición'
            ),
            new OA\Response(
                response: 404,
                description: 'Email no encontrado'
            )
        ]
    )]
    public function emailToken(EntityManagerInterface $entityManager, Request $request, MailService $mailer)
    {

        $userRepo = $entityManager->getRepository(Usuario::class);
        $data = json_decode($request->getContent(), true);
        $email = $data['email'];
        $usuario = $userRepo->findOneBy(['email' => $email]);

        if (!$usuario) {
            return $this->json(['error' => 'Email no encontrado'], 400);
        }

        $token = bin2hex(random_bytes(32));
        $usuario->setTokenPassword($token);
        $entityManager->persist($usuario);
        $entityManager->flush();

        $mensaje = '
        <!DOCTYPE html>
        <html>
        <head>
            <title>Recuperar Contraseña</title>
        </head>
        <body>
            <p>Hola,</p>
            <p>Para recuperar tu contraseña, haz click en el siguiente enlace:</p>
            <p><a href="http://localhost:8000/api/usuario/comprobarToken/' . $token .'">Recuperar Contraseña</a></p>
            <p>Si no solicitaste un cambio de contraseña, puedes ignorar este mensaje.</p>
        </body>
        </html>';

        $mailer->enviarEmail($email, 'Recuperar Contraseña', $mensaje, 'Recuperar Contraseña');

        return $this->json([
            'message' => 'Email enviado correctamente'
        ]);
    }

    #[Route('/api/usuario/comprobarToken/{token}', name: 'comprobar_token', methods: ['GET'])]
    #[OA\Get(
        path: '/api/usuario/comprobarToken/{token}',
        summary: 'Comprueba si el token del usuario es valido',
        tags: ['Usuario'],
        parameters: [
            new OA\Parameter(
                name: 'token',
                description: 'Token de usuario a verificar',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'string', example: '1u23123891270389...')
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'ok',
                content: new OA\JsonContent(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'code', type: 'boolean', example: 1),
                    ]
                )
            ),
            new OA\Response(
                response: 400,
                description: 'token no valido'
            )
        ]
    )]
    public function comprobarToken($token, EntityManagerInterface $em)
    {
        $user = $em->getRepository(Usuario::class)->findOneBy(['tokenPassword' => $token]);

        if (!$user) {
            return new JsonResponse([
                'message' => 'Token no valido'
            ], 400);
        }

        return new JsonResponse([
            'message' => 'Token valido'
        ], 200);
    }

    #[Route('/api/usuario/cambiarPassword', name: 'cambiar_password', methods: ['POST'])]
    #[OA\Post(
        path: '/api/usuario/cambiarPassword',
        summary: 'Cambia la contraseña del usuario',
        tags: ['Usuario'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                type: 'object',
                required: ['password', 'confirmPassword', 'email','token'],
                properties: [
                    new OA\Property(property: 'password', type: 'string', example: 'NuevaContraseña123'),
                    new OA\Property(property: 'confirmPassword', type: 'string', example: 'NuevaContraseña123'),
                    new OA\Property(property: 'email', type: 'email', example: 'email@gmail.com'),
                    new OA\Property(property: 'token', type: 'token', example: '123fasdf11e...')
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Contraseña actualizada correctamente',
                content: new OA\JsonContent(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'code', type: 'boolean', example: 1),
                    ]
                )
            ),
            new OA\Response(
                response: 400,
                description: 'Error en la validación o token no válido'
            )
        ]
    )]
    public function cambiarPassword(EntityManagerInterface $em, Request $request)
    {
        $data = json_decode($request->getContent(), true);
        $user= $em->getRepository(Usuario::class)->findOneBy(['email' => $data['email']]);

        if (!$user) {
            return new JsonResponse([
                'message' => 'Email no encontrado'
            ], 400);
        }

        $password = $data['password'];
        $confirmPassword = $data['confirmPassword'];

        if($password !== $confirmPassword) {
            return new JsonResponse([
                'message' => 'Las contraseñas no coinciden'
            ], 400);
        }

        if($password==$user->getPassword()) {
            return new JsonResponse([
                'message' => 'La nueva contraseña no puede ser igual a la anterior'
            ], 400);
        }

        $user->setPassword(password_hash($password, PASSWORD_DEFAULT));
        $user->setTokenPassword('');
        $em->persist($user);
        $em->flush();

        return new JsonResponse([
            'message' => 'Contraseña actualizada correctamente'
        ], 200);
    }
}
