<?php

namespace App\Entity;

use App\Repository\PerfilEconomicoRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PerfilEconomicoRepository::class)]
class PerfilEconomico
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: "float", nullable: true, options: ["default" => 0])]
    private ?float $dineroDepositado = null;
    
    #[ORM\Column(type: "float", nullable: true, options: ["default" => 0])]
    private ?float $dineroRetirado = null;
    

    // En App\Entity\PerfilEconomico, modifica la anotación:
    #[ORM\OneToOne(cascade: ['persist'])]
    #[ORM\JoinColumn(nullable: false, onDelete: "CASCADE")]
    private ?Usuario $usuario = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDineroDepositado(): ?float
    {
        return $this->dineroDepositado;
    }

    public function setDineroDepositado(float $dineroDepositado): static
    {
        $this->dineroDepositado = $dineroDepositado;

        return $this;
    }

    public function getDineroRetirado(): ?float
    {
        return $this->dineroRetirado;
    }

    public function setDineroRetirado(float $dineroRetirado): static
    {
        $this->dineroRetirado = $dineroRetirado;

        return $this;
    }

    public function getUsuario(): ?Usuario
    {
        return $this->usuario;
    }

    public function setUsuario(Usuario $usuario): static
    {
        $this->usuario = $usuario;

        return $this;
    }
}
