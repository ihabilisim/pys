
import React from 'react';

// Global declaration to fix JSX intrinsic element errors (div, span, Three.js elements, etc.)
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Three.js elements explicit declaration to fix TS errors
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
      group: any;
      mesh: any;
      boxGeometry: any;
      cylinderGeometry: any;
      sphereGeometry: any;
      planeGeometry: any;
      extrudeGeometry: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      primitive: any;
      
      // Catch-all for others
      [elemName: string]: any;
    }
  }
}

export * from './types/core';
export * from './types/map';
export * from './types/project';
export * from './types/ui';
export * from './types/structure';
export * from './types/supabase';