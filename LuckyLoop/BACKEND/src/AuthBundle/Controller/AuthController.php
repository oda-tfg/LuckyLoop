<?php

namespace App\AuthBundle\Controller;

use App\AuthBundle\Services\AuthService;
use App\Entity\Usuario;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;



class AuthController extends AbstractController{

    private $authService;
public function __construct(AuthService $authService) {
    $this->authService = $authService;
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
    public function emailToken(Request $request)
    {
        return $this->authService->emailToken($request);
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
    public function cambiarPassword(Request $request)
    {
        return $this->authService->cambiarPassword($request);
    }
    
    #[Route('/api/usuario/registrar', name: 'registrar-usuario', methods: ['POST'])]
    #[OA\Post(
        path: '/api/usuario/registrar',
        summary: 'Registra un nuevo usuario',
        tags: ['Usuario'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                type: 'object',
                required: ['nombreUsuario', 'correoElectronico', 'contrasena', 'repetirContrasena', 'telefono'],
                properties: [
                    new OA\Property(property: 'nombreUsuario', type: 'string', example: 'usuario123'),
                    new OA\Property(property: 'correoElectronico', type: 'string', example: 'usuario@ejemplo.com'),
                    new OA\Property(property: 'contrasena', type: 'string', example: 'Contraseña123'),
                    new OA\Property(property: 'repetirContrasena', type: 'string', example: 'Contraseña123'),
                    new OA\Property(property: 'telefono', type: 'string', example: '123456789')
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Usuario registrado correctamente',
                content: new OA\JsonContent(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'code', type: 'boolean', example: 1),
                        new OA\Property(property: 'message', type: 'string', example: 'Usuario registrado exitosamente')
                    ]
                )
            ),
            new OA\Response(
                response: 400,
                description: 'Error en la validación de datos'
            )
        ]
    )]
    public function registrar(Request $request)
    {
        return $this->authService->registrar($request);
    }
}