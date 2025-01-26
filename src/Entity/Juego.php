<?php

namespace App\Entity;

use App\Repository\JuegoRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: JuegoRepository::class)]
class Juego
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    
    #[ORM\Column(length: 255)]
    private ?string $nombre = null;

    #[ORM\Column(type: 'integer', nullable: true, options: ['default' => 1])]
    private ?int $apuestaMinima = 1;

    #[ORM\Column]
    private ?int $apuestaMaxima = null;

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

    public function getApuestaMinima(): ?int
    {
        return $this->apuestaMinima;
    }

    public function setApuestaMinima(int $apuestaMinima): static
    {
        $this->apuestaMinima = $apuestaMinima;

        return $this;
    }

    public function getApuestaMaxima(): ?int
    {
        return $this->apuestaMaxima;
    }

    public function setApuestaMaxima(int $apuestaMaxima): static
    {
        $this->apuestaMaxima = $apuestaMaxima;

        return $this;
    }
}
