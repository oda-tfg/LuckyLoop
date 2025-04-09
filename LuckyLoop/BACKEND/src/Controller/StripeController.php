<?php
// src/Controller/StripeController.php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Stripe\StripeClient;

class StripeController extends AbstractController
{
    #[Route('/create-payment-intent', name: 'create_payment_intent', methods: ['POST'])]
    public function createPaymentIntent(Request $request): JsonResponse
    {
        // Configura tu clave secreta de Stripe (modo prueba)
        $stripe = new StripeClient($_ENV['sk_test_51RA7GDATTvNshzGtOMfC7fBiefAEkmfU8qT7AW3ZmGcDPauRooLQZ18lf2YWixugNJiNkCRHYElGgaXB0anTWNwb00AADVwWz0']); // Reemplaza con tu clave secreta

        $data = json_decode($request->getContent(), true);
        $amount = $data['amount']; // El monto en centavos (ej. $50 = 5000)

        try {
            // Crea un PaymentIntent
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
}