<?php 

namespace App\AuthBundle\Services;

use App\Service\MailService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use App\Entity\Usuario;
use Symfony\Component\HttpFoundation\Request;

class AuthService {
    private $entityManager;
    private $mailer;

    public function __construct(
        EntityManagerInterface $entityManager,
        MailService $mailer
    ) {
        $this->entityManager = $entityManager;
        $this->mailer = $mailer;
    }

    public function emailToken(Request $request) {
        $userRepo = $this->entityManager->getRepository(Usuario::class);
        $data = json_decode($request->getContent(), true);
        $email = $data['email'];
        $usuario = $userRepo->findOneBy(['email' => $email]);

        if (!$usuario) {
            return new JsonResponse(['error' => 'Email no encontrado'], 400);
        }

        $token = bin2hex(random_bytes(32));
        $usuario->setTokenPassword($token);
        $this->entityManager->persist($usuario);
        $this->entityManager->flush();

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

        $this->mailer->enviarEmail($email, 'Recuperar Contraseña', $mensaje, 'Recuperar Contraseña');

        return new JsonResponse([
            'message' => 'Email enviado correctamente'
        ]);
    }

    public function cambiarPassword(Request $request){
        $data = json_decode($request->getContent(), true);
        $user= $this->entityManager->getRepository(Usuario::class)->findOneBy(['email' => $data['email']]);

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
        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return new JsonResponse([
            'message' => 'Contraseña actualizada correctamente'
        ], 200);
    }
}