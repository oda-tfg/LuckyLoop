<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250126160437 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE partida (id INT AUTO_INCREMENT NOT NULL, usuario_id INT NOT NULL, juego_id INT NOT NULL, dinero_apostado DOUBLE PRECISION NOT NULL, fecha_juego DATE NOT NULL, resultado DOUBLE PRECISION NOT NULL, INDEX IDX_A9C1580CDB38439E (usuario_id), INDEX IDX_A9C1580C13375255 (juego_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE perfil_economico (id INT AUTO_INCREMENT NOT NULL, usuario_id INT NOT NULL, dinero_depositado DOUBLE PRECISION NOT NULL, dinero_retirado DOUBLE PRECISION NOT NULL, UNIQUE INDEX UNIQ_413CB439DB38439E (usuario_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE recompensa (id INT AUTO_INCREMENT NOT NULL, nivel INT NOT NULL, recompensa VARCHAR(255) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE usuario (id INT AUTO_INCREMENT NOT NULL, nivel_id INT NOT NULL, nombre VARCHAR(255) NOT NULL, correo VARCHAR(255) NOT NULL, telefono VARCHAR(9) NOT NULL, contraseña VARCHAR(255) NOT NULL, saldo_actual DOUBLE PRECISION NOT NULL, fecha_registro DATE NOT NULL, rol VARCHAR(255) NOT NULL, INDEX IDX_2265B05DDA3426AE (nivel_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE partida ADD CONSTRAINT FK_A9C1580CDB38439E FOREIGN KEY (usuario_id) REFERENCES usuario (id)');
        $this->addSql('ALTER TABLE partida ADD CONSTRAINT FK_A9C1580C13375255 FOREIGN KEY (juego_id) REFERENCES juego (id)');
        $this->addSql('ALTER TABLE perfil_economico ADD CONSTRAINT FK_413CB439DB38439E FOREIGN KEY (usuario_id) REFERENCES usuario (id)');
        $this->addSql('ALTER TABLE usuario ADD CONSTRAINT FK_2265B05DDA3426AE FOREIGN KEY (nivel_id) REFERENCES recompensa (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE partida DROP FOREIGN KEY FK_A9C1580CDB38439E');
        $this->addSql('ALTER TABLE partida DROP FOREIGN KEY FK_A9C1580C13375255');
        $this->addSql('ALTER TABLE perfil_economico DROP FOREIGN KEY FK_413CB439DB38439E');
        $this->addSql('ALTER TABLE usuario DROP FOREIGN KEY FK_2265B05DDA3426AE');
        $this->addSql('DROP TABLE partida');
        $this->addSql('DROP TABLE perfil_economico');
        $this->addSql('DROP TABLE recompensa');
        $this->addSql('DROP TABLE usuario');
    }
}
