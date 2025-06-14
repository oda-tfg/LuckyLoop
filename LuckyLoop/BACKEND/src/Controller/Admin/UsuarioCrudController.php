<?php

namespace App\Controller\Admin;

use App\Entity\Usuario;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Field\EmailField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextEditorField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\NumberField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Doctrine\ORM\EntityManagerInterface;

class UsuarioCrudController extends AbstractCrudController
{
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public static function getEntityFqcn(): string
    {
        return Usuario::class;
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id')->hideOnForm(),
            TextField::new('nombre'),
            EmailField::new('email'),
            TextField::new('telefono'),
            TextField::new('password')->onlyOnForms()->setRequired($pageName === 'new'),
            ChoiceField::new('roles')
                ->setChoices([
                    'Usuario' => 'ROLE_USER',
                    'Administrador' => 'ROLE_ADMIN',
                    'Manager' => 'ROLE_MANAGER'
                ])
                ->allowMultipleChoices()
                ->setRequired(true),
            NumberField::new('saldoActual')->setNumDecimals(2)->setRequired(false),
            DateTimeField::new('fechaRegistro')->setRequired(false),
            AssociationField::new('nivel')->setRequired(false),
            TextField::new('tokenPassword')->hideOnIndex()->setRequired(false),
        ];
    }

    // Override the persistEntity method to hash the password before saving
    public function persistEntity(EntityManagerInterface $entityManager, $entityInstance): void
    {
        $this->hashPassword($entityInstance);
        parent::persistEntity($entityManager, $entityInstance);
    }

    // Also override updateEntity to hash the password when updating an existing user
    public function updateEntity(EntityManagerInterface $entityManager, $entityInstance): void
    {
        parent::updateEntity($entityManager, $entityInstance);
    }

    // Helper method to hash the password
    private function hashPassword($user): void
    {
        if ($user instanceof Usuario && $user->getPassword()) {
            $hashedPassword = $this->passwordHasher->hashPassword(
                $user,
                $user->getPassword()
            );
            $user->setPassword($hashedPassword);
        }

        // Set default values for new users if they're not provided
        if ($user instanceof Usuario && $user->getId() === null) {
            // Set default date if not provided
            if ($user->getFechaRegistro() === null) {
                $user->setFechaRegistro(new \DateTime());
            }

            // Set default saldo if not provided
            if ($user->getSaldoActual() === null) {
                $user->setSaldoActual(0.0);
            }
        }
    }
}