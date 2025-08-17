# Cube LUTs

A .cube LUT solution for [babylonjs](https://www.babylonjs.com/).

What's a .cube LUT? In a nutshell, a color grading file format. _(You can read more [here](https://helpx.adobe.com/in/premiere-pro/using/looks-and-luts.html))_

Right now the 1D luts can't handle higher resolution than gpu max texture size, this will change.

## How to use

```javascript
import { getCubePostProcess } from "babylon-cube-luts";
import { Effect } from "@babylonjs/core/Materials/effect";

// optionally disable babylon's own internal color grading
scene.imageProcessingConfiguration.isEnabled = false;
scene.imageProcessingConfiguration.toneMappingEnabled = false;

const pp = getCubePostProcess.enable(
  Effect.ShadersStore,
  /** your babylonjs scene */ scene,
  /** parsed LUT data, LUT data as a string, or the url to a LUT */ "raw.githubusercontent.com/blender/blender/refs/heads/main/release/datafiles/colormanagement/luts/AgX_Base_sRGB.cube",
  /** camera */ scene.activeCamera,
);
```

Start by importing the post process generator.

Maybe disable Babylon's own interal color grading system.

Pass is the url to the cube file along with other arguments and it will hand you and apply the color grading post process.

Have fun :)
