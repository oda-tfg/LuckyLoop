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
}