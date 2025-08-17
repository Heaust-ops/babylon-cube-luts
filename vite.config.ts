import glsl from "vite-plugin-glsl";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/index.ts",
      name: "CubeLut",
      fileName: (format) => `cubeLut.${format}.js`,
      formats: ["es", "cjs", "umd"],
    },
    rollupOptions: {
      external: [
        "@babylonjs/core",
        "@babylonjs/core/Materials/Textures/rawTexture",
        "@babylonjs/core/Engines/engine",
        "@babylonjs/core/PostProcesses/postProcess",
        "@babylonjs/core/Cameras/camera",
        "@babylonjs/core/scene",
      ],
      output: {
        globals: {
          "@babylonjs/core": "BABYLON",
          // All specific imports will fall under the BABYLON namespace
          "@babylonjs/core/Materials/Textures/rawTexture": "BABYLON",
          "@babylonjs/core/Engines/engine": "BABYLON",
          "@babylonjs/core/PostProcesses/postProcess": "BABYLON",
          "@babylonjs/core/Cameras/camera": "BABYLON",
          "@babylonjs/core/scene": "BABYLON",
        },
      },
    },
  },
  plugins: [
    glsl({ compress: true }),
    dts({
      outDir: "dist/types",
    }),
  ],
});
