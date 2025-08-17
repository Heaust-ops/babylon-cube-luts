import { ParsedCubeLUTData } from "../parser";
import lut1dfrag from "../shaders/lut1d.glsl";

import { RawTexture } from "@babylonjs/core/Materials/Textures/rawTexture";
import { Engine } from "@babylonjs/core/Engines/engine";
import { PostProcess } from "@babylonjs/core/PostProcesses/postProcess";

import type { Camera } from "@babylonjs/core/Cameras/camera";
import type { Scene } from "@babylonjs/core/scene";

const getCube1DLUT = (scene: Scene, data: ParsedCubeLUTData) => {
  if (!data.LUT_1D_SIZE) return null;

  const binary = new Float32Array(data.data)
  const dataTex = new RawTexture(
    binary, data.LUT_1D_SIZE, 3,
    Engine.TEXTUREFORMAT_RGB,
    scene,
    false,
    false,
    Engine.TEXTURE_TRILINEAR_SAMPLINGMODE,
    Engine.TEXTURETYPE_FLOAT
  );

  return dataTex;
}

const getCubeColorGrade1DPostProcess = (shadersStore: { [key: string]: string }, scene: Scene, data: ParsedCubeLUTData, camera?: Camera | null) => {
  const dataTex = getCube1DLUT(scene, data);
  if (!dataTex) return null;

  const engine = scene.getEngine();

  shadersStore["__CubeColorGrade1D__FragmentShader"] = lut1dfrag;

  const pp = new PostProcess(
    `CubeColorGrade1D ${data.TITLE ?? "UNTITLED"}`,
    "__CubeColorGrade1D__",
    ["lut_size", "domain_min", "domain_max"],
    ["lut_tex"],
    1.0,
    camera ?? null,
    Engine.TEXTURE_LINEAR_LINEAR,
    engine
  );

  pp.onApplyObservable.addOnce((e) => {
    e.setTexture("lut_tex", dataTex);
    e.setFloat("lut_size", data.LUT_1D_SIZE!);
    e.setFloat3("domain_min", ...data.DOMAIN_MIN);
    e.setFloat3("domain_max", ...data.DOMAIN_MAX);
  });

  return pp;
}

export { getCubeColorGrade1DPostProcess, getCube1DLUT }
