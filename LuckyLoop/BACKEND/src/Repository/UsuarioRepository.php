<?php

namespace App\Repository;

use App\Entity\Usuario;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bridge\Doctrine\Security\User\UserLoaderInterface;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Translation\Exception\UnsupportedSchemeException;

/**
 * @extends ServiceEntityRepository<Usuario>
 */
class UsuarioRepository extends ServiceEntityRepository implements
    UserLoaderInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Usuario::class);
    }

    //    /**
    //     * @return Usuario[] Returns an array of Usuario objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('u')
    //            ->andWhere('u.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('u.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    public function findOneByNombre($nombre): ?Usuario
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.nombre = :val')
            ->setParameter('val', $nombre)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }

    public function findOneByEmail($email): ?Usuario
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.email = :val')
            ->setParameter('val', $email)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }

    public function usuarioEdad()
    {
        return $this->createQueryBuilder('u')
            ->select('u.fechaNacimiento')
            ->getQuery()
            ->getResult();
    }

    public function loadUserByIdentifier(string $email): ?Usuario
    {
        return $this->createQueryBuilder('u')
            ->where('u.email = :email')
            ->setParameter('email', $email)
            ->getQuery()
            ->getOneOrNullResult();
    }
    public function upgradePassword(PasswordAuthenticatedUserInterface $usuario, string $newHashedPassword): void
    {
        if (!$usuario instanceof Usuario) {
            throw new UnsupportedUserException();
        }
        $usuario->setPassword($newHashedPassword);
        $this->_em->persist($usuario);
        $this->_em->flush();
    }
}
