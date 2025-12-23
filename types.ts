import { ThreeElements } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

export * from './types/core';
export * from './types/map';
export * from './types/project';
export * from './types/ui';
export * from './types/structure';
export * from './types/supabase';