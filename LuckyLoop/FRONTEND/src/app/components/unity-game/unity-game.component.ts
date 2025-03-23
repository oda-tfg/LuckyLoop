import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-unity-game',
  standalone: false,
  templateUrl: './unity-game.component.html',
  styleUrls: ['./unity-game.component.css']
})
export class UnityGameComponent implements OnInit { // 👈 Implementa OnInit

  ngOnInit(): void {
    this.loadUnityGame();
  }

  private loadUnityGame(): void {
    const buildUrl = 'assets/gameEjemplo/Build';
    const config = {
      dataUrl: `${buildUrl}/gameEjemplo.data`, // 👈 Sin .unityweb
      frameworkUrl: `${buildUrl}/gameEjemplo.framework.js`,
      codeUrl: `${buildUrl}/gameEjemplo.wasm`,
      streamingAssetsUrl: 'StreamingAssets',
      companyName: 'TuJuego',
      productName: 'TuJuego',
      productVersion: '1.0'
    };
  
    const script = document.createElement('script');
    script.src = `${buildUrl}/gameEjemplo.loader.js`;
    script.onload = () => {
      (window as any).createUnityInstance(document.querySelector('#unity-canvas'), config);
    };
    document.body.appendChild(script);
  }
}