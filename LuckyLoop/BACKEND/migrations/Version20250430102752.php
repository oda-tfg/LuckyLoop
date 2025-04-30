<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250430102752 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE juego ADD categoria VARCHAR(50) DEFAULT NULL, CHANGE nombre nombre VARCHAR(50) NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE partida CHANGE fecha_juego fecha_juego DATETIME DEFAULT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE perfil_economico DROP FOREIGN KEY FK_413CB439DB38439E
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE perfil_economico ADD CONSTRAINT FK_413CB439DB38439E FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE usuario CHANGE nombre nombre VARCHAR(30) NOT NULL, CHANGE email email VARCHAR(50) NOT NULL, CHANGE password password VARCHAR(20) NOT NULL, CHANGE fecha_registro fecha_registro DATETIME DEFAULT NULL, CHANGE token_password token_password VARCHAR(50) DEFAULT NULL
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE juego DROP categoria, CHANGE nombre nombre VARCHAR(255) NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE partida CHANGE fecha_juego fecha_juego DATETIME DEFAULT CURRENT_TIMESTAMP
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE perfil_economico DROP FOREIGN KEY FK_413CB439DB38439E
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE perfil_economico ADD CONSTRAINT FK_413CB439DB38439E FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE usuario CHANGE nombre nombre VARCHAR(255) NOT NULL, CHANGE email email VARCHAR(255) NOT NULL, CHANGE password password VARCHAR(255) NOT NULL, CHANGE fecha_registro fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP, CHANGE token_password token_password VARCHAR(255) DEFAULT NULL
        SQL);
    }
}
