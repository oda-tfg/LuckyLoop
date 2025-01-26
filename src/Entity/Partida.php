<?php

namespace App\Entity;

use App\Repository\PartidaRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PartidaRepository::class)]
class Partida
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?float $dineroApostado = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $fechaJuego = null;

    #[ORM\Column]
    private ?float $resultado = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Usuario $usuario = null;

    #[ORM\ManyToOne(inversedBy: 'partidas')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Juego $juego = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDineroApostado(): ?float
    {
        return $this->dineroApostado;
    }

    public function setDineroApostado(float $dineroApostado): static
    {
        $this->dineroApostado = $dineroApostado;

        return $this;
    }

    public function getFechaJuego(): ?\DateTimeInterface
    {
        return $this->fechaJuego;
    }

    public function setFechaJuego(\DateTimeInterface $fechaJuego): static
    {
        $this->fechaJuego = $fechaJuego;

        return $this;
    }

    public function getResultado(): ?float
    {
        return $this->resultado;
    }

    public function setResultado(float $resultado): static
    {
        $this->resultado = $resultado;

        return $this;
    }

    public function getUsuario(): ?Usuario
    {
        return $this->usuario;
    }

    public function setUsuario(?Usuario $usuario): static
    {
        $this->usuario = $usuario;

        return $this;
    }

    public function getJuego(): ?Juego
    {
        return $this->juego;
    }

    public function setJuego(?Juego $juego): static
    {
        $this->juego = $juego;

        return $this;
    }
}
