import { ThreeElements } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

export * from './core';
export * from './map';
export * from './project';
export * from './ui';
export * from './supabase';
export * from './structure';