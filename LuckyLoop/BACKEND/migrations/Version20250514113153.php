<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250514113153 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE juego (id INT AUTO_INCREMENT NOT NULL, nombre VARCHAR(50) NOT NULL, apuesta_minima INT DEFAULT 1, apuesta_maxima INT NOT NULL, categoria VARCHAR(50) DEFAULT NULL, UNIQUE INDEX UNIQ_F0EC403D3A909126 (nombre), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE partida (id INT AUTO_INCREMENT NOT NULL, usuario_id INT NOT NULL, juego_id INT NOT NULL, dinero_apostado DOUBLE PRECISION NOT NULL, fecha_juego DATETIME DEFAULT NULL, resultado VARCHAR(10) NOT NULL, beneficio DOUBLE PRECISION NOT NULL, INDEX IDX_A9C1580CDB38439E (usuario_id), INDEX IDX_A9C1580C13375255 (juego_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE perfil_economico (id INT AUTO_INCREMENT NOT NULL, usuario_id INT NOT NULL, dinero_depositado DOUBLE PRECISION DEFAULT '0', dinero_retirado DOUBLE PRECISION DEFAULT '0', UNIQUE INDEX UNIQ_413CB439DB38439E (usuario_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE recompensa (id INT AUTO_INCREMENT NOT NULL, nivel INT NOT NULL, recompensa INT DEFAULT 0, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE usuario (id INT AUTO_INCREMENT NOT NULL, nivel_id INT DEFAULT NULL, roles JSON NOT NULL, nombre VARCHAR(30) NOT NULL, email VARCHAR(50) NOT NULL, telefono VARCHAR(9) NOT NULL, password VARCHAR(20) NOT NULL, saldo_actual DOUBLE PRECISION DEFAULT '0', fecha_registro DATETIME DEFAULT NULL, token_password VARCHAR(50) DEFAULT NULL, UNIQUE INDEX UNIQ_2265B05DC1E70A7F (telefono), INDEX IDX_2265B05DDA3426AE (nivel_id), UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL (email), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE partida ADD CONSTRAINT FK_A9C1580CDB38439E FOREIGN KEY (usuario_id) REFERENCES usuario (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE partida ADD CONSTRAINT FK_A9C1580C13375255 FOREIGN KEY (juego_id) REFERENCES juego (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE perfil_economico ADD CONSTRAINT FK_413CB439DB38439E FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE usuario ADD CONSTRAINT FK_2265B05DDA3426AE FOREIGN KEY (nivel_id) REFERENCES recompensa (id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE partida DROP FOREIGN KEY FK_A9C1580CDB38439E
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE partida DROP FOREIGN KEY FK_A9C1580C13375255
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE perfil_economico DROP FOREIGN KEY FK_413CB439DB38439E
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE usuario DROP FOREIGN KEY FK_2265B05DDA3426AE
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE juego
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE partida
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE perfil_economico
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE recompensa
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE usuario
        SQL);
    }
}
