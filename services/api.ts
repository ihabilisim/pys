
import { storageService } from './storage';
import { authService } from './auth';
import { dbService } from './db';

// This file now aggregates all sub-services into the existing apiService object
// to maintain backward compatibility with the rest of the application.
export const apiService = {
  ...storageService,
  ...authService,
  ...dbService
};
