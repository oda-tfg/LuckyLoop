// components/roulette-wheel/roulette-wheel.component.ts
import { Component, ElementRef, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { RouletteService } from '../../services/roulette.service';
import * as THREE from 'three';
// Corregimos la importación de OrbitControls
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Subscription } from 'rxjs';
import { GameState } from '../../models/game-state.model';
import { gsap } from 'gsap';

@Component({
  selector: 'app-roulette-wheel',
  standalone:false,
  template: `
    <div class="roulette-container">
      <canvas #rouletteCanvas></canvas>
      <div class="winner-display" *ngIf="gameState?.lastWinningNumber !== null">
        Número ganador: {{ gameState?.lastWinningNumber }}
      </div>
      <button class="spin-button" [disabled]="gameState?.isSpinning" (click)="spinWheel()">¡GIRAR!</button>
    </div>
  `,
  styles: [`
    .roulette-container {
      position: relative;
      width: 100%;
      height: 100%;
      background-color: #004400;
      border-radius: 8px;
      overflow: hidden;
    }
    canvas {
      width: 100%;
      height: 100%;
    }
    .winner-display {
      position: absolute;
      top: 10px;
      left: 10px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8px 15px;
      border-radius: 5px;
      font-size: 18px;
      font-weight: bold;
    }
    .spin-button {
      position: absolute;
      bottom: 20px;
      right: 20px;
      padding: 12px 30px;
      background-color: #FF0000;
      color: white;
      border: none;
      border-radius: 5px;
      font-weight: bold;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 0 15px rgba(255, 0, 0, 0.7);
    }
    .spin-button:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 0 20px rgba(255, 0, 0, 0.9);
    }
    .spin-button:disabled {
      background-color: #888888;
      cursor: not-allowed;
      box-shadow: none;
    }
  `]
})
export class RouletteWheelComponent implements OnInit, OnDestroy {
  @ViewChild('rouletteCanvas', { static: true }) rouletteCanvas!: ElementRef<HTMLCanvasElement>;
  
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private rouletteWheel!: THREE.Group;
  private ball!: THREE.Mesh;
  private numberTextures: THREE.Texture[] = [];
  private numberLabels: THREE.Object3D[] = [];
  
  private subscription: Subscription = new Subscription();
  public gameState: GameState | null = null;
  
  // Orden correcto de los números de la ruleta europea según la imagen
  // Ordenados en sentido horario
  private readonly rouletteNumbers = [
    0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5, 10, 23, 8, 30, 11, 36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32
  ];
  
  // Colores de los números
  private readonly redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  
  constructor(private rouletteService: RouletteService) { }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (this.camera && this.renderer) {
      const aspectRatio = this.rouletteCanvas.nativeElement.clientWidth / this.rouletteCanvas.nativeElement.clientHeight;
      this.camera.aspect = aspectRatio;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.rouletteCanvas.nativeElement.clientWidth, this.rouletteCanvas.nativeElement.clientHeight);
    }
  }

  ngOnInit(): void {
    this.initThreeJS();
    this.createRouletteWheel();
    this.createBall();
    this.animate();
    
    this.subscription.add(
      this.rouletteService.gameState$.subscribe(state => {
        this.gameState = state;
        
        if (state.isSpinning) {
          this.animateSpinning();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    
    // Limpiar recursos de Three.js
    this.renderer.dispose();
    this.scene.clear();
    
    // Liberar las texturas
    this.numberTextures.forEach(texture => texture.dispose());
  }

  private initThreeJS(): void {
    // Crear escena
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x004400); // Verde oscuro de mesa de casino
    
    // Crear cámara
    const aspectRatio = this.rouletteCanvas.nativeElement.clientWidth / this.rouletteCanvas.nativeElement.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    this.camera.position.set(0, 10, 10);
    
    // Crear renderer
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.rouletteCanvas.nativeElement,
      antialias: true 
    });
    this.renderer.setSize(this.rouletteCanvas.nativeElement.clientWidth, this.rouletteCanvas.nativeElement.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Agregar luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 15, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    this.scene.add(directionalLight);
    
    // Luz puntual para dar profundidad
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 10, 0);
    pointLight.castShadow = true;
    this.scene.add(pointLight);
    
    // Configurar controles orbitales
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 20;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.1; // Limitar rotación vertical
    this.controls.minPolarAngle = Math.PI / 6; // Limitar rotación vertical inferior
  }

  private createRouletteWheel(): void {
    this.rouletteWheel = new THREE.Group();
    
    // Base de la ruleta
    const baseGeometry = new THREE.CylinderGeometry(5.5, 6, 0.8, 36);
    const baseMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x8B4513,
      specular: 0x222222,
      shininess: 30
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -0.4;
    base.castShadow = true;
    base.receiveShadow = true;
    this.rouletteWheel.add(base);
    
    // Plato giratorio exterior (marrón)
    const outerPlateGeometry = new THREE.CylinderGeometry(5, 5, 0.2, 36);
    const outerPlateMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x8B4513,
      specular: 0x444444,
      shininess: 50
    });
    const outerPlate = new THREE.Mesh(outerPlateGeometry, outerPlateMaterial);
    outerPlate.position.y = 0.1;
    outerPlate.castShadow = true;
    outerPlate.receiveShadow = true;
    this.rouletteWheel.add(outerPlate);
    
    // Plato giratorio interior (más oscuro)
    const innerPlateGeometry = new THREE.CylinderGeometry(3.8, 3.8, 0.3, 36);
    const innerPlateMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x654321,
      specular: 0x444444,
      shininess: 40
    });
    const innerPlate = new THREE.Mesh(innerPlateGeometry, innerPlateMaterial);
    innerPlate.position.y = 0.25;
    innerPlate.castShadow = true;
    innerPlate.receiveShadow = true;
    this.rouletteWheel.add(innerPlate);
    
    // Crear sectores para los números
    const sectorAngle = (2 * Math.PI) / this.rouletteNumbers.length;
    const sectorRadius = 4.8;
    const sectorInnerRadius = 3.8;
    const sectorHeight = 0.35;
    
    // Primero, crear las texturas de los números
    this.createNumberTextures();
    
    for (let i = 0; i < this.rouletteNumbers.length; i++) {
      const number = this.rouletteNumbers[i];
      const angleStart = i * sectorAngle;
      
      // Determinar color del sector
      let color;
      if (number === 0) {
        color = 0x008800; // Verde para el cero
      } else if (this.redNumbers.includes(number)) {
        color = 0xDD0000; // Rojo
      } else {
        color = 0x000000; // Negro
      }
      
      // Crear geometría del sector
      const sectorShape = new THREE.Shape();
      sectorShape.moveTo(0, 0);
      sectorShape.arc(0, 0, sectorRadius, angleStart, angleStart + sectorAngle, false);
      sectorShape.lineTo(sectorInnerRadius * Math.cos(angleStart + sectorAngle), sectorInnerRadius * Math.sin(angleStart + sectorAngle));
      sectorShape.arc(0, 0, sectorInnerRadius, angleStart + sectorAngle, angleStart, true);
      sectorShape.lineTo(sectorRadius * Math.cos(angleStart), sectorRadius * Math.sin(angleStart));
      
      const extrudeSettings = {
        steps: 1,
        depth: sectorHeight,
        bevelEnabled: false
      };
      
      const sectorGeometry = new THREE.ExtrudeGeometry(sectorShape, extrudeSettings);
      const sectorMaterial = new THREE.MeshPhongMaterial({ 
        color,
        specular: 0x333333,
        shininess: 30
      });
      
      const sector = new THREE.Mesh(sectorGeometry, sectorMaterial);
      sector.position.y = 0.1;
      sector.rotation.x = -Math.PI / 2;
      sector.castShadow = true;
      sector.receiveShadow = true;
      
      this.rouletteWheel.add(sector);
      
      // Añadir el número
      this.addNumberToSector(i, number, angleStart + (sectorAngle / 2));
    }
    
    // Agregar separadores entre sectores
    for (let i = 0; i < this.rouletteNumbers.length; i++) {
      const angle = i * sectorAngle;
      const middleRadius = (sectorRadius + sectorInnerRadius) / 2;
      const x = Math.cos(angle) * middleRadius;
      const z = Math.sin(angle) * middleRadius;
      
      const dividerGeometry = new THREE.BoxGeometry(0.03, 0.4, (sectorRadius - sectorInnerRadius) * 0.8);
      const dividerMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xC0C0C0,
        specular: 0xFFFFFF,
        shininess: 100
      });
      const divider = new THREE.Mesh(dividerGeometry, dividerMaterial);
      
      divider.position.set(x, 0.3, z);
      divider.lookAt(new THREE.Vector3(0, 0.3, 0));
      divider.castShadow = true;
      divider.receiveShadow = true;
      
      this.rouletteWheel.add(divider);
    }
    
    // Centro de la ruleta con cruz
    const centerGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16);
    const centerMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xDDCCAA, // Color dorado claro
      specular: 0xFFFFFF,
      shininess: 100
    });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.position.y = 0.3;
    center.castShadow = true;
    center.receiveShadow = true;
    this.rouletteWheel.add(center);
    
    // Crear cruz en el centro
    this.createCenterCross();
    
    this.scene.add(this.rouletteWheel);
  }

  private createCenterCross(): void {
    // Material para la cruz
    const crossMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xDDCCAA, // Color dorado claro
      specular: 0xFFFFFF,
      shininess: 100
    });
    
    // Crear brazos horizontales de la cruz
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      
      // Crear geometría para el brazo
      const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
      const arm = new THREE.Mesh(armGeometry, crossMaterial);
      
      // Posicionar y rotar el brazo
      arm.position.set(
        Math.cos(angle) * 1.5, 
        0.3, 
        Math.sin(angle) * 1.5
      );
      arm.rotation.z = Math.PI / 2;
      arm.rotation.x = angle;
      
      // Crear bola en el extremo del brazo
      const ballGeometry = new THREE.SphereGeometry(0.2, 16, 16);
      const ball = new THREE.Mesh(ballGeometry, crossMaterial);
      ball.position.set(
        Math.cos(angle) * 3, 
        0.3, 
        Math.sin(angle) * 3
      );
      
      this.rouletteWheel.add(arm);
      this.rouletteWheel.add(ball);
    }
  }

  private createNumberTextures(): void {
    // Limpiar texturas anteriores
    this.numberTextures.forEach(texture => texture.dispose());
    this.numberTextures = [];
    
    // Crear una textura para cada número de la ruleta
    for (let i = 0; i < this.rouletteNumbers.length; i++) {
      const number = this.rouletteNumbers[i];
      
      // Crear un canvas para la textura
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      
      // Limpiar el canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Configurar el estilo del texto
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Dibujar el número
      ctx.fillText(number.toString(), canvas.width / 2, canvas.height / 2);
      
      // Crear la textura
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      texture.minFilter = THREE.LinearFilter;
      this.numberTextures.push(texture);
    }
  }

  private addNumberToSector(index: number, number: number, angle: number): void {
    const radius = 4.3; // Radio donde ubicaremos los números (entre sector exterior e interior)
    
    // Calcular posición
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    // Crear material con la textura del número
    const material = new THREE.SpriteMaterial({
      map: this.numberTextures[index],
      color: 0xffffff
    });
    
    // Crear sprite
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.8, 0.8, 1);
    sprite.position.set(x, 0.55, z);
    
    // Almacenar la referencia y agregar a la ruleta
    this.numberLabels.push(sprite);
    this.rouletteWheel.add(sprite);
  }

  private createBall(): void {
    const ballGeometry = new THREE.SphereGeometry(0.22, 32, 32);
    const ballMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xFFFFFF,
      specular: 0xFFFFFF,
      shininess: 100
    });
    this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
    
    // Posicionar la bola en el borde de la ruleta
    this.ball.position.set(4.5, 0.8, 0);
    this.ball.castShadow = true;
    
    this.scene.add(this.ball);
  }

  private animate(): void {
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Actualizar controles
      this.controls.update();
      
      // Renderizar escena
      this.renderer.render(this.scene, this.camera);
    };
    
    animate();
  }

  private animateSpinning(): void {
    // Rotación inicial rápida
    gsap.to(this.rouletteWheel.rotation, {
      y: this.rouletteWheel.rotation.y + Math.PI * 10, // Más vueltas
      duration: 5,
      ease: 'power1.out'
    });
    
    // Animación de la bola
    const timeline = gsap.timeline();
    
    // La bola se mueve en círculo exterior
    timeline.to(this.ball.position, {
      x: 4.5 * Math.cos(Math.PI/6),
      z: 4.5 * Math.sin(Math.PI/6),
      y: 1,
      duration: 0.5,
      repeat: 8,
      ease: 'linear',
      onUpdate: () => {
        // Rotación de la bola
        this.ball.rotation.x += 0.2;
        this.ball.rotation.z += 0.2;
      }
    });
    
    // La bola cae en un número - importante! Usar el número ganador que viene del servicio
    const winningNumber = this.gameState?.lastWinningNumber ?? 0;
    
    // Encontrar el índice del número ganador en el arreglo de números de la ruleta
    const winningIndex = this.rouletteNumbers.indexOf(winningNumber);
    
    // Calcular el ángulo donde debe caer la bola
    const sectorAngle = (2 * Math.PI) / this.rouletteNumbers.length;
    const winningAngle = winningIndex * sectorAngle + sectorAngle/2;
    
    // Radio donde debe caer la bola (mismo radio donde están los números)
    const landingRadius = 4.3;
    
    // Hacer que la bola caiga específicamente en ese número
    timeline.to(this.ball.position, {
      x: Math.cos(winningAngle) * landingRadius,
      z: Math.sin(winningAngle) * landingRadius,
      y: 0.45, // Altura ligeramente menor para que parezca que descansa sobre la superficie
      duration: 1.5,
      ease: 'bounce.out'
    });
  }

  public spinWheel(): void {
    this.rouletteService.spinWheel();
  }
}