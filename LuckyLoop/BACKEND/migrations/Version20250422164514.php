<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250422164514 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE usuario (id INT AUTO_INCREMENT NOT NULL, nivel_id INT DEFAULT NULL, roles LONGTEXT NOT NULL COMMENT '(DC2Type:json)', nombre VARCHAR(30) NOT NULL, email VARCHAR(50) NOT NULL, telefono VARCHAR(9) NOT NULL, password VARCHAR(20) NOT NULL, saldo_actual DOUBLE PRECISION DEFAULT '0', fecha_registro DATETIME DEFAULT NULL, token_password VARCHAR(50) DEFAULT NULL, UNIQUE INDEX UNIQ_2265B05DC1E70A7F (telefono), INDEX IDX_2265B05DDA3426AE (nivel_id), UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL (email), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE usuario ADD CONSTRAINT FK_2265B05DDA3426AE FOREIGN KEY (nivel_id) REFERENCES recompensa (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE partida ADD CONSTRAINT FK_A9C1580CDB38439E FOREIGN KEY (usuario_id) REFERENCES usuario (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE partida ADD CONSTRAINT FK_A9C1580C13375255 FOREIGN KEY (juego_id) REFERENCES juego (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE perfil_economico ADD CONSTRAINT FK_413CB439DB38439E FOREIGN KEY (usuario_id) REFERENCES usuario (id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE partida DROP FOREIGN KEY FK_A9C1580CDB38439E
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE perfil_economico DROP FOREIGN KEY FK_413CB439DB38439E
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE usuario DROP FOREIGN KEY FK_2265B05DDA3426AE
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE usuario
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE partida DROP FOREIGN KEY FK_A9C1580C13375255
        SQL);
    }
}
