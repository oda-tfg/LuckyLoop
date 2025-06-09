<?php

namespace App\Tests\Unit\Service;

use App\EstadisticasBundle\Services\EstadisticasService;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Security\Core\Security;
use Doctrine\ORM\EntityManagerInterface;

class EstadisticasServiceTest extends TestCase
{
    // Variables para el servicio y sus dependencias mockeadas
    private $service;
    private $emMock;
    private $securityMock;

    // Este método se ejecuta antes de cada test
    protected function setUp(): void
    {
        // Creamos mocks (simulaciones) de las dependencias
        $this->emMock = $this->createMock(EntityManagerInterface::class);
        $this->securityMock = $this->createMock(Security::class);
        
        // Instanciamos el servicio real inyectando los mocks
        $this->service = new EstadisticasService($this->emMock, $this->securityMock);
    }

    public function testGetEstadisticas()
    {
        /******* Configuración de los mocks *******/
        
        // 1. Mock del usuario autenticado
        $usuarioMock = new \stdClass();
        $usuarioMock->saldoActual = 1000.0;
        $this->securityMock->method('getUser')->willReturn($usuarioMock);

        // 2. Mock del repositorio de Juego
        $juegoMock = new \stdClass();
        $juegoMock->id = 1;
        $juegoMock->nombre = "Ruleta";
        
        $juegoRepositoryMock = $this->createMock(\Doctrine\ORM\EntityRepository::class);
        $juegoRepositoryMock->method('findAll')->willReturn([$juegoMock]);
        
        // 3. Mock del repositorio de Partida
        $partidaRepositoryMock = $this->createMock(\Doctrine\ORM\EntityRepository::class);
        $partidaRepositoryMock->method('findBy')->willReturn([]); // No hay partidas
        
        // 4. Mock del repositorio de PerfilEconomico
        $perfilMock = new \stdClass();
        $perfilMock->dineroRetirado = 500.0;
        $perfilMock->dineroDepositado = 300.0;
        
        $perfilRepositoryMock = $this->createMock(\Doctrine\ORM\EntityRepository::class);
        $perfilRepositoryMock->method('findOneBy')->willReturn($perfilMock);
        
        // Configuramos el EntityManager para que devuelva nuestros repositorios mockeados
        $this->emMock->method('getRepository')->willReturnMap([
            ['App\Entity\Juego', $juegoRepositoryMock],
            ['App\Entity\Partida', $partidaRepositoryMock],
            ['App\Entity\PerfilEconomico', $perfilRepositoryMock]
        ]);

        /******* Ejecución del método a testear *******/
        $resultado = $this->service->getEstadisticas();

        /******* Verificaciones *******/
        
        // Comprobamos que devuelve un JsonResponse
        $this->assertInstanceOf(\Symfony\Component\HttpFoundation\JsonResponse::class, $resultado);
        
        // Verificamos los datos devueltos
        $datos = json_decode($resultado->getContent(), true);
        
        $this->assertEquals(0, $datos['total_partidas']); // No hay partidas
        $this->assertEquals(1200.0, $datos['beneficio_total']); // (500 + 1000) - 300
        $this->assertEquals("Ruleta", $datos['juegos'][0]['nombre']);
    }

    public function testGetEstadisticasPorJuegoSinUsuario()
    {
        // Configuramos el mock para que no haya usuario autenticado
        $this->securityMock->method('getUser')->willReturn(null);
        
        // Verificamos que lanza una excepción
        $this->expectException(\Symfony\Component\Security\Core\Exception\AuthenticationException::class);
        
        // Ejecutamos el método
        $this->service->getEstadisticasPorJuego(1);
    }
}