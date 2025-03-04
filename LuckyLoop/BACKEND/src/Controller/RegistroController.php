<?php

namespace App\Controller;

use App\Entity\Usuario;
use App\Form\RegistroType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;



class RegistroController extends AbstractController
{
    #[Route('/register', name: 'app_register')]
    public function register(Request $request, UserPasswordHasherInterface $passwordHasher, EntityManagerInterface $entityManager): Response
    {
        $user = new Usuario();
        $form = $this->createForm(RegistroType::class, $user);
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            // Hash the plain password
            $user->setPassword($passwordHasher->hashPassword($user,$form->get('password')->getData()));
            $user->setRoles($form->get('roles')->getData());
            $entityManager->persist($user);
            $entityManager->flush();
            return new RedirectResponse('/index.html');
        }
        return $this->render('registro/register.html.twig', [
            'registro' => $form->createView(),
        ]);
    }
}
