import React, { useEffect, useRef } from 'react';
import 'babylonjs';
import 'babylonjs-gui';
import 'babylonjs-loaders';
import 'babylonjs-materials';
import TOOLKIT from 'babylon-toolkit';
import Viewer from './Viewer';
import './App.css';

function App() {
  const onSceneReady = async (scene) => {
    // This gets the engine and canvas references (non-mesh)
    const engine = scene.getEngine();
    const canvas = scene.getEngine().getRenderingCanvas();

    // This creates and positions a debug camera (non-mesh)
    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    scene.activeCamera = camera;

    // This creates ambient light, aiming 0,1,0 - to the sky (non-mesh)
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    // This initializes the playground runtime libs (non-mesh)
    await TOOLKIT.SceneManager.InitializePlayground(engine, { showDefaultLoadingScreen: true, hideLoadingUIWithEngine: false });
    await BABYLON.Tools.LoadScriptAsync("https://cdn.babylonjs.com/havok/HavokPhysics_umd.js");
    
    // This enables the havok physics engine (non-mesh)
    // @ts-ignore
    globalThis.HK = await HavokPhysics();
    globalThis.HKP = new BABYLON.HavokPlugin();
    scene.enablePhysics(new BABYLON.Vector3(0,-9.81,0), globalThis.HKP);

    // This loads the sample scene & player armature exported from a unity starter assets project
    // https://assetstore.unity.com/packages/essentials/starter-assets-character-controllers-urp-267961
    const assetsManager = new BABYLON.AssetsManager(scene);
    assetsManager.addMeshTask("samplescene", null, TOOLKIT.SceneManager.PlaygroundRepo, "samplescene.gz.gltf");
    assetsManager.addMeshTask("playerarmature", null, TOOLKIT.SceneManager.PlaygroundRepo, "playerarmature.gz.gltf");
    await TOOLKIT.SceneManager.LoadRuntimeAssets(assetsManager, ["samplescene.gz.gltf", "playerarmature.gz.gltf"], ()=> {
      // This get the player armature transform node from scene hierarchy
      const player = scene.getNodeByName("PlayerArmature") as BABYLON.TransformNode;
      console.log("Attaching player controller...");

      // This instantiates a third person player controller script component from the babylon toolkit starter content package
      // @ts-ignore
      const controller = new PROJECT.ThirdPersonPlayerController(player, scene, { arrowKeyRotation: true, smoothMotionSpeed:true, smoothChangeRate: 25.0 });
      controller.enableInput = true;
      controller.attachCamera = true;
      controller.boomPosition.set(0, 0, -5);
      controller.moveSpeed = 5.335;
      controller.walkSpeed = 2.0;
      controller.jumpSpeed = 12.0;
      TOOLKIT.SceneManager.AttachScriptComponent(controller, "PROJECT.ThirdPersonPlayerController");
      
      // This finally hides the playground screen loader
      TOOLKIT.SceneManager.HideLoadingScreen(engine);
      TOOLKIT.SceneManager.FocusRenderCanvas(scene);
    });
  };

  return (    
    <div className="root">
      <Viewer antialias={true} adaptToDeviceRatio={true} onSceneReady={onSceneReady} className="canvas" id="my-canvas" />
    </div>
  );
}

export default App;