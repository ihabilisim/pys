
import { tr } from './tr';
import { en } from './en';
import { ro } from './ro';

export const translations = {
  tr,
  en,
  ro
};

// Type definition to ensure type safety in components
export type TranslationKey = keyof typeof tr;
