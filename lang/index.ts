
import { tr } from './tr';
import { en } from './en';
import { ro } from './ro';

export const translations = {
  tr,
  en,
  ro
};

export type TranslationKey = keyof typeof tr;
