<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250424181045 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE juego DROP categoria
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE perfil_economico DROP FOREIGN KEY FK_413CB439DB38439E
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE perfil_economico ADD CONSTRAINT FK_413CB439DB38439E FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE juego ADD categoria VARCHAR(50) DEFAULT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE perfil_economico DROP FOREIGN KEY FK_413CB439DB38439E
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE perfil_economico ADD CONSTRAINT FK_413CB439DB38439E FOREIGN KEY (usuario_id) REFERENCES usuario (id)
        SQL);
    }
}
