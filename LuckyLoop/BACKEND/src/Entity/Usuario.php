<?php

namespace App\Entity;

use App\Repository\UsuarioRepository;
use DateTime;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UsuarioRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]

class Usuario implements UserInterface, PasswordAuthenticatedUserInterface
{

    public function __construct()
    {
        $this->fechaRegistro = new DateTime();
        $this->saldoActual = 0.0;
    }
    
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    private array $roles = [];

    #[ORM\Column(length: 30)]
    private ?string $nombre = null;


    #[ORM\Column(length: 50, unique: true)]
    private ?string $email = null;

    #[ORM\Column(length: 9, unique: true)]
    private ?string $telefono = null;

    #[ORM\Column(length: 80)]
    private ?string $password = null;

    #[ORM\Column(type: "float", nullable: true, options: ["default" => 0])]
    private ?float $saldoActual = null;

    #[ORM\Column(type: "datetime", nullable: true)]
    private ?\DateTimeInterface $fechaRegistro = null;

    #[ORM\ManyToOne(inversedBy: 'usuarios')]
    #[ORM\JoinColumn(nullable: true)]
    private ?Recompensa $nivel = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $tokenPassword = null;
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNombre(): ?string
    {
        return $this->nombre;
    }

    public function setNombre(string $nombre): static
    {
        $this->nombre = $nombre;

        return $this;
    }

    /**
     * @see UserInterface
     *
     * @return list<string>
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }


    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getTelefono(): ?string
    {
        return $this->telefono;
    }

    public function setTelefono(string $telefono): static
    {
        $this->telefono = $telefono;

        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    public function getSaldoActual(): ?float
    {
        return $this->saldoActual;
    }

    public function setSaldoActual(float $saldoActual): static
    {
        $this->saldoActual = $saldoActual;

        return $this;
    }

    public function getFechaRegistro(): ?\DateTimeInterface
    {
        return $this->fechaRegistro;
    }

    public function setFechaRegistro(\DateTimeInterface $fechaRegistro): static
    {
        $this->fechaRegistro = $fechaRegistro;

        return $this;
    }

    public function getNivel(): ?Recompensa
    {
        return $this->nivel;
    }

    public function setNivel(?Recompensa $nivel): static
    {
        $this->nivel = $nivel;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function getTokenPassword(): ?string
    {
        return $this->tokenPassword;
    }

    public function setTokenPassword(string $tokenPassword): static
    {
        $this->tokenPassword = $tokenPassword;

        return $this;
    }
}
