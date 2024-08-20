import { useEffect, useRef } from "react";
import { Engine, Scene } from "babylonjs";

export declare type BabylonjsProps = {
  antialias?: boolean;
  engineOptions?: any;
  adaptToDeviceRatio?: boolean;
  renderChildrenWhenReady?: boolean;
  sceneOptions?: any;
  onSceneReady: (scene: Scene) => void;
  /**
   * Automatically trigger engine resize when the canvas resizes (default: true)
   */
  observeCanvasResize?: boolean;
  onRender?: (scene: Scene) => void;
  children?: React.ReactNode;
};

function Viewer(props: BabylonjsProps & React.CanvasHTMLAttributes<HTMLCanvasElement>) {
    const { antialias, engineOptions, adaptToDeviceRatio, sceneOptions, onRender, onSceneReady, ...rest } = props;
    const reactCanvas = useRef(null);
    // set up basic engine and scene
    useEffect(() => {
      const { current: canvas } = reactCanvas;
  
      if (!canvas) return;
  
      const engine = new Engine(canvas, antialias, engineOptions, adaptToDeviceRatio);
      const scene = new Scene(engine, sceneOptions);
      if (scene.isReady()) {
        onSceneReady(scene);
      } else {
        scene.onReadyObservable.addOnce((scene) => onSceneReady(scene));
      }
  
      engine.runRenderLoop(() => {
        if (typeof onRender === "function") onRender(scene);
        scene.render();
      });
  
      const resize = () => {
        scene.getEngine().resize();
      };
  
      if (window) {
        window.addEventListener("resize", resize);
      }
  
      return () => {
        scene.getEngine().dispose();
  
        if (window) {
          window.removeEventListener("resize", resize);
        }
      };
    }, [antialias, engineOptions, adaptToDeviceRatio, sceneOptions, onRender, onSceneReady]);

    return <canvas ref={reactCanvas} {...rest} />;
}

export default Viewer;