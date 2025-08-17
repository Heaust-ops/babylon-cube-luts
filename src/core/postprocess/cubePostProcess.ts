import { CubeParser, ParsedCubeLUTData } from "../parser";
import { getCubeColorGrade3DPostProcess } from "./cube3dPostProcess";
import { getCubeColorGrade1DPostProcess } from "./cube1dPostProcess";

import type { Camera } from "@babylonjs/core/Cameras/camera";
import type { Scene } from "@babylonjs/core/scene";
import type { PostProcess } from "@babylonjs/core/PostProcesses/postProcess";

const getCubePostProcess = (shadersStore: { [key: string]: string }, scene: Scene, dataOrUrl: ParsedCubeLUTData | string, camera?: Camera | null): Promise<PostProcess | null> | PostProcess | null => {
  if (typeof dataOrUrl === "string") {
    const parser = new CubeParser();

    if (dataOrUrl.length < 5_000 && dataOrUrl.includes("://")) {
      return new Promise((res) => {
        parser.getParsedFromUrl(dataOrUrl as string).then((parsed) => {
          if (!parsed) return res(null);
          return res(getCubePostProcess(shadersStore, scene, parsed, camera));
        });
      });
    }

    dataOrUrl = parser.getParsed(dataOrUrl);
  }

  if (dataOrUrl.LUT_3D_SIZE) {
    return getCubeColorGrade3DPostProcess(shadersStore, scene, dataOrUrl, camera);
  }

  if (dataOrUrl.LUT_1D_SIZE) {
    return getCubeColorGrade1DPostProcess(shadersStore, scene, dataOrUrl, camera);
  }

  return null;
}

export { getCubePostProcess };
