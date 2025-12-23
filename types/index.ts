
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

export * from './core';
export * from './map';
export * from './project';
export * from './ui';
export * from './supabase';
export * from './structure';
