
export * from './types/core';
export * from './types/map';
export * from './types/project';
export * from './types/ui';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      directionalLight: any;
      group: any;
      mesh: any;
      boxGeometry: any;
      meshStandardMaterial: any;
      cylinderGeometry: any;
      extrudeGeometry: any;
      primitive: any;
    }
  }
}