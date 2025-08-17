import * as BABYLON from "@babylonjs/core";
import { CubeParser, getCubeColorGrade1DPostProcess, getCubeColorGrade3DPostProcess, getCubePostProcess } from "../src/core";

(window as any).BABYLON = BABYLON;
(window as any).CubeParser = CubeParser;
(window as any).getCubeColorGrade3DPostProcess = getCubeColorGrade3DPostProcess;
(window as any).getCubeColorGrade1DPostProcess = getCubeColorGrade1DPostProcess;
(window as any).getCubePostProcess = getCubePostProcess;
(window as any).CubeParser = CubeParser;

class App {
  camera: BABYLON.Camera;
  scene: BABYLON.Scene;
  engine: BABYLON.Engine;
  canvas: HTMLCanvasElement;

  private setupLight() {
    const position = new BABYLON.Vector3(0, 1.5, 0);
    const color = BABYLON.Color3.Red();
    const intensity = 0.2;

    const light = new BABYLON.PointLight("light", position, this.scene);
    light.diffuse = color;
    light.intensity = intensity * 10;

    return light;
  }


  private makeArcRotateCamera() {
    this.camera.dispose();
    this.camera = new BABYLON.ArcRotateCamera(
      "camera",
      0,
      Math.PI / 2,
      10,
      BABYLON.Vector3.Zero(),
      this.scene,
    );
    (this.camera as BABYLON.ArcRotateCamera).setTarget(BABYLON.Vector3.Zero());
    this.camera.attachControl(this.canvas, true);
  }

  multiCubeDemo() {
    this.makeArcRotateCamera();
    const matPBR = new BABYLON.PBRMaterial("");

    const matStd = new BABYLON.StandardMaterial("");
    matPBR.metallic = 0.2;
    matPBR.roughness = 0.23;
    for (let i = -3; i <= 3; i++) {
      for (let j = -3; j <= 3; j++) {
        const b = BABYLON.MeshBuilder.CreateBox("box", { size: 0.5 });
        b.position.set(i, (i + j - 1) % 2 === 0 ? 0.25 : 0, j);
        b.material = (i + j - 1) % 2 === 0 ? matStd : matPBR;
      }
    }

    const light = this.setupLight();
    const scaling = light.range ? light.range * 2 : 0;

    if (1) {
      const debugOverlay = BABYLON.MeshBuilder.CreateSphere("dbov", {
        diameter: 1,
      });
      debugOverlay.position.copyFrom(light.position);
      debugOverlay.scaling.setAll(scaling);
      debugOverlay.visibility = 0.3;
    }

    this.scene.createDefaultEnvironment();
    this.scene.environmentIntensity = 0.14;
  }


  createScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement) {
    const scene = new BABYLON.Scene(engine);
    (window as any).scene = scene;

    const camera = new BABYLON.FreeCamera(
      "camera1",
      new BABYLON.Vector3(0, 5, -10),
      scene,
    );

    this.camera = camera;
    this.scene = scene;
    this.engine = engine;

    camera.attachControl(canvas, true);

    this.multiCubeDemo();

    const fpsel = document.getElementById("fps")!;
    const avgArr = new Array(60).fill(60);

    const refreshTime = 1e3; // ms

    let prevTime = Date.now();
    this.scene.onBeforeRenderObservable.add(() => {
      avgArr.shift();
      avgArr.push(this.engine.getFps());

      const now = Date.now();
      if (now - prevTime < refreshTime) return;
      prevTime = now;
      fpsel.innerHTML = `fps: ${Math.floor(avgArr.reduce((a, b) => a + b) / avgArr.length)}`
    })

    return scene;
  }

  constructor() {
    const canvas = document.getElementById("bblon")! as unknown as HTMLCanvasElement;
    this.canvas = canvas;

    const engine = new BABYLON.Engine(canvas, true);


    const scene = this.createScene(engine, canvas);
    (window as any).scene = scene;

    engine.runRenderLoop(() => {
      scene.render();
    });
  }

  dispose() {
    this.scene.dispose();
    this.engine.dispose();
  }
}

let app = new App();
