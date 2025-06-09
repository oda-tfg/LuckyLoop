<?php

namespace App\Tests\E2E;

use Symfony\Component\Panther\PantherTestCase;

class CategoriasTest extends PantherTestCase
{
    public function testCategoriasAPI()
    {
        $client = static::createPantherClient([
            'external_base_uri' => 'http://localhost:8000',
        ]);

        $crawler = $client->request('GET', '/api/getCategorias');

        // Esperar a que se cargue completamente
        $client->waitFor('body');

        $responseText = $crawler->filter('body')->text();
        
        // Decodificar JSON para verificar estructura
        $data = json_decode($responseText, true);
        
        $this->assertNotNull($data, 'La respuesta debe ser JSON válido');
        $this->assertEquals('success', $data['status']);
        $this->assertIsArray($data['categorias']);
        $this->assertContains('Azar', $data['categorias']);
    }
}