<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250126164804 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE partida CHANGE fecha_juego fecha_juego DATETIME DEFAULT CURRENT_TIMESTAMP');
        $this->addSql('ALTER TABLE perfil_economico CHANGE dinero_depositado dinero_depositado DOUBLE PRECISION DEFAULT \'0\', CHANGE dinero_retirado dinero_retirado DOUBLE PRECISION DEFAULT \'0\'');
        $this->addSql('ALTER TABLE recompensa CHANGE recompensa recompensa INT DEFAULT 0');
        $this->addSql('ALTER TABLE usuario CHANGE saldo_actual saldo_actual DOUBLE PRECISION DEFAULT \'0\', CHANGE fecha_registro fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP, CHANGE rol rol VARCHAR(255) DEFAULT \'normal\' NOT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_2265B05D3A909126 ON usuario (nombre)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_2265B05DC1E70A7F ON usuario (telefono)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX UNIQ_2265B05D3A909126 ON usuario');
        $this->addSql('DROP INDEX UNIQ_2265B05DC1E70A7F ON usuario');
        $this->addSql('ALTER TABLE usuario CHANGE saldo_actual saldo_actual DOUBLE PRECISION NOT NULL, CHANGE fecha_registro fecha_registro DATE NOT NULL, CHANGE rol rol VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE recompensa CHANGE recompensa recompensa VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE partida CHANGE fecha_juego fecha_juego DATE NOT NULL');
        $this->addSql('ALTER TABLE perfil_economico CHANGE dinero_depositado dinero_depositado DOUBLE PRECISION NOT NULL, CHANGE dinero_retirado dinero_retirado DOUBLE PRECISION NOT NULL');
    }
}
