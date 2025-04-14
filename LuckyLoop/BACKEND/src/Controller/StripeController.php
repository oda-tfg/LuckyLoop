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

}