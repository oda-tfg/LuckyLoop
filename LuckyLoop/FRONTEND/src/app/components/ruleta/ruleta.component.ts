import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import * as THREE from 'three';
// @ts-ignore
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
// @ts-ignore
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
// @ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-ruleta',
  templateUrl: './ruleta.component.html',
  standalone: false,
  styleUrls: ['./ruleta.component.css']
})
export class RuletaComponent implements AfterViewInit {
  @ViewChild('canvas3D', { static: true }) canvasRef!: ElementRef;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private wheel!: THREE.Object3D;
  private ball!: THREE.Object3D;
  private spinning = false;
  private rotationSpeed = 0.1;
  private ballAngle = 0;

  private europeanOrder = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13,
    36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20,
    14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
  ];

  ngAfterViewInit(): void {
    this.initScene();
    this.animate();
  }

  private initScene(): void {
    const canvas = this.canvasRef.nativeElement;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    this.camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    this.camera.position.set(0, 60, 60);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    const spotlight = new THREE.SpotLight(0xffffff, 1);
    spotlight.position.set(0, 150, 100);
    spotlight.castShadow = true;
    this.scene.add(spotlight);

    const loader = new GLTFLoader();
    loader.load('assets/models/roulette.glb', gltf => {
      const model = gltf.scene;
      model.scale.set(20, 20, 20);
      model.position.set(0, 0, 0);
      this.scene.add(model);

      model.traverse(child => {
        if (child.name.toLowerCase().includes('wheel') || child.name.toLowerCase().includes('circle')) {
          this.wheel = child;
        }

        if (child.name.toLowerCase().includes('ball')) {
          this.ball = child;
        }
      });

      if (!this.wheel) console.warn('⚠️ No se encontró la parte giratoria');
      if (!this.ball) console.warn('⚠️ No se encontró la bola');

      this.addNumberTexts(); // Añadir números
    });
  }

  private addNumberTexts(): void {
    const fontLoader = new FontLoader();
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font: any) => {
      const angleStep = (2 * Math.PI) / 37;
      const radius = 15.5;

      this.europeanOrder.forEach((num, i) => {
        const angle = i * angleStep + Math.PI / 2;

        const textGeo = new TextGeometry(num.toString(), {
          font: font,
          size: 0.3,
          height: 0.01
        } as any);
        
        textGeo.computeBoundingBox();
        textGeo.center(); // centra el texto sin deformarlo
        

        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(textGeo, material);

        textMesh.position.set(
          radius * Math.cos(angle),
          2.1,
          radius * Math.sin(angle)
        );

        textMesh.rotation.y = -angle; // rotar en su sitio sin estirar
        this.scene.add(textMesh);
      });
    });
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    if (this.spinning && this.wheel) {
      this.wheel.rotation.y += this.rotationSpeed;
      this.ballAngle += this.rotationSpeed * 1.8;
      this.rotationSpeed *= 0.98;

      if (this.ball) {
        const radius = 13.3;
        this.ball.position.x = radius * Math.cos(this.ballAngle);
        this.ball.position.z = radius * Math.sin(this.ballAngle);
        this.ball.position.y = 1.6;
      }

      if (this.rotationSpeed < 0.001) {
        this.spinning = false;
        this.rotationSpeed = 0.1;

        const number = this.europeanOrder[Math.floor(Math.random() * this.europeanOrder.length)];
        console.log('🎯 Número ganador:', number);

        const index = this.europeanOrder.indexOf(number);
        const anglePerNumber = (2 * Math.PI) / 37;
        const offset = Math.PI / 2;
        this.ballAngle = index * anglePerNumber + offset;
      }
    }

    this.renderer.render(this.scene, this.camera);
  };

  spin(): void {
    this.spinning = true;
  }
}
