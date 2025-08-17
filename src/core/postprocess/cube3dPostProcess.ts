import { ParsedCubeLUTData } from "../parser";
import lut3dfrag from "../shaders/lut3d.glsl";

import { RawTexture3D } from "@babylonjs/core/Materials/Textures/rawTexture3D";
import { Engine } from "@babylonjs/core/Engines/engine";
import { PostProcess } from "@babylonjs/core/PostProcesses/postProcess";

import type { Camera } from "@babylonjs/core/Cameras/camera";
import type { Scene } from "@babylonjs/core/scene";

const getCube3DLUT = (scene: Scene, data: ParsedCubeLUTData) => {
  if (!data.LUT_3D_SIZE) return null;

  const binary = new Float32Array(data.data)
  const dataTex = new RawTexture3D(
    binary, data.LUT_3D_SIZE, data.LUT_3D_SIZE, data.LUT_3D_SIZE,
    Engine.TEXTUREFORMAT_RGB,
    scene,
    false,
    false,
    Engine.TEXTURE_TRILINEAR_SAMPLINGMODE,
    Engine.TEXTURETYPE_FLOAT
  );

  return dataTex;
}

const getCubeColorGrade3DPostProcess = (shadersStore: { [key: string]: string }, scene: Scene, data: ParsedCubeLUTData, camera?: Camera | null) => {
  const dataTex = getCube3DLUT(scene, data);
  if (!dataTex) return null;

  const engine = scene.getEngine();

  shadersStore["__CubeColorGrade3D__FragmentShader"] = lut3dfrag;

  const pp = new PostProcess(
    `CubeColorGrade3D ${data.TITLE ?? "UNTITLED"}`,
    "__CubeColorGrade3D__",
    ["lut_size", "domain_min", "domain_max"],
    ["lut_tex"],
    1.0,
    camera ?? null,
    Engine.TEXTURE_LINEAR_LINEAR,
    engine
  );

  pp.onApplyObservable.addOnce((e) => {
    e.setTexture("lut_tex", dataTex);
    e.setFloat("lut_size", data.LUT_3D_SIZE!);
    e.setFloat3("domain_min", ...data.DOMAIN_MIN);
    e.setFloat3("domain_max", ...data.DOMAIN_MAX);
  });

  return pp;
}

export { getCubeColorGrade3DPostProcess, getCube3DLUT }
