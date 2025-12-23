
import React from 'react';
import { ThreeElements } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {
      ambientLight: any;
      directionalLight: any;
      group: any;
      mesh: any;
      boxGeometry: any;
      meshStandardMaterial: any;
      cylinderGeometry: any;
      extrudeGeometry: any;
    }
  }
}

export * from './types/core';
export * from './types/map';
export * from './types/project';
export * from './types/ui';
export * from './types/structure';
export * from './types/supabase';
