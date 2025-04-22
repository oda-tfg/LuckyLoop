<?php

namespace App\Entity;

use App\Repository\PartidaRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

// Definimos un enum para los posibles resultados de la partida
enum ResultadoPartida: string
{
    case VICTORIA = 'victoria';
    case DERROTA = 'derrota';
    case EMPATE = 'empate';
}

#[ORM\Entity(repositoryClass: PartidaRepository::class)]
class Partida
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?float $dineroApostado = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $fechaJuego = null;
    
    #[ORM\Column(type: "string", length: 10, enumType: ResultadoPartida::class)]
    private ?ResultadoPartida $resultado = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Usuario $usuario = null;

    #[ORM\ManyToOne(inversedBy: 'partidas')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Juego $juego = null;

    #[ORM\Column]
    private ?float $beneficio = null;

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

    public function getResultado(): ?ResultadoPartida
    {
        return $this->resultado;
    }

    public function setResultado(ResultadoPartida $resultado): static
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
    
    public function getBeneficio(): ?float
    {
        return $this->beneficio;
    }
    
    public function setBeneficio(float $beneficio): static
    {
        $this->beneficio = $beneficio;
        
        return $this;
    }
    
    public function isVictoria(): bool
    {
        return $this->resultado === ResultadoPartida::VICTORIA;
    }
    
    public function isDerrota(): bool
    {
        return $this->resultado === ResultadoPartida::DERROTA;
    }
    
    public function isEmpate(): bool
    {
        return $this->resultado === ResultadoPartida::EMPATE;
    }
}