<?php
// src/Controller/StripeController.php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Stripe\StripeClient;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class StripeController extends AbstractController
{

    private $entityManager;
    private $security;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }


    #[Route('/create-payment-intent', name: 'create_payment_intent', methods: ['POST'])]
    public function createPaymentIntent(Request $request): JsonResponse
    {
        $stripe = new StripeClient($_ENV['STRIPE_SECRET_KEY']);

        $data = json_decode($request->getContent(), true);
        $amount = $data['amount']; 

        try {
            $paymentIntent = $stripe->paymentIntents->create([
                'amount' => $amount,
                'currency' => 'eur',
                'payment_method_types' => ['card'],
            ]);

            return $this->json([
                'clientSecret' => $paymentIntent->client_secret,
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }


    #[Route('/api/update-saldo', name: 'update_saldo', methods: ['POST'])]
public function updateSaldo(Request $request): JsonResponse
{
    /** @var Usuario|null $user */
    $user = $this->getUser();

    if (!$user) {
        return $this->json(['error' => 'Usuario no autenticado'], 401);
    }

    $data = json_decode($request->getContent(), true);

    if (!isset($data['amount'])) {
        return $this->json(['error' => 'Falta el campo amount'], 400);
    }

    $amount = $data['amount'] / 100;

    $user->setSaldoActual($user->getSaldoActual() + $amount);
    $this->entityManager->flush();

    return $this->json([
        'success' => true,
        'newBalance' => $user->getSaldoActual()
    ]);
}

}