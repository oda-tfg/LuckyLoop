<?php

namespace App\Entity;

use App\Repository\JuegoRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: JuegoRepository::class)]
class Juego
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    
    #[ORM\Column(length: 255, unique: true)]
    private ?string $nombre = null;

    #[ORM\Column(type: 'integer', nullable: true, options: ['default' => 1])]
    private ?int $apuestaMinima = 1;

    #[ORM\Column]
    private ?int $apuestaMaxima = null;

    /**
     * @var Collection<int, Partida>
     */
    #[ORM\OneToMany(targetEntity: Partida::class, mappedBy: 'juego')]
    private Collection $partidas;

    public function __construct()
    {
        $this->partidas = new ArrayCollection();
    }

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

    /**
     * @return Collection<int, Partida>
     */
    public function getPartidas(): Collection
    {
        return $this->partidas;
    }

    public function addPartida(Partida $partida): static
    {
        if (!$this->partidas->contains($partida)) {
            $this->partidas->add($partida);
            $partida->setJuego($this);
        }

        return $this;
    }

    public function removePartida(Partida $partida): static
    {
        if ($this->partidas->removeElement($partida)) {
            // set the owning side to null (unless already changed)
            if ($partida->getJuego() === $this) {
                $partida->setJuego(null);
            }
        }

        return $this;
    }
}
