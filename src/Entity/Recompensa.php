<?php

namespace App\Entity;

use App\Repository\RecompensaRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: RecompensaRepository::class)]
class Recompensa
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $nivel = null;

    #[ORM\Column(length: 255)]
    private ?string $recompensa = null;

    /**
     * @var Collection<int, Usuario>
     */
    #[ORM\OneToMany(targetEntity: Usuario::class, mappedBy: 'nivel')]
    private Collection $usuarios;

    public function __construct()
    {
        $this->usuarios = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNivel(): ?int
    {
        return $this->nivel;
    }

    public function setNivel(int $nivel): static
    {
        $this->nivel = $nivel;

        return $this;
    }

    public function getRecompensa(): ?string
    {
        return $this->recompensa;
    }

    public function setRecompensa(string $recompensa): static
    {
        $this->recompensa = $recompensa;

        return $this;
    }

    /**
     * @return Collection<int, Usuario>
     */
    public function getUsuarios(): Collection
    {
        return $this->usuarios;
    }

    public function addUsuario(Usuario $usuario): static
    {
        if (!$this->usuarios->contains($usuario)) {
            $this->usuarios->add($usuario);
            $usuario->setNivel($this);
        }

        return $this;
    }

    public function removeUsuario(Usuario $usuario): static
    {
        if ($this->usuarios->removeElement($usuario)) {
            // set the owning side to null (unless already changed)
            if ($usuario->getNivel() === $this) {
                $usuario->setNivel(null);
            }
        }

        return $this;
    }
}
