
import { LocalizedString } from './core';

export interface InfrastructureProject {
  id: string;
  name: LocalizedString; 
  description: LocalizedString; 
  link?: string; 
}

export interface ShortcutItem {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  type: 'PDF' | 'DWG';
  sourceType: 'FILE' | 'LINK';
  pathOrUrl: string; 
  revisionDate: string; 
}

export interface StockItem {
    id: string;
    name: LocalizedString;
    currentQuantity: number;
    criticalLevel: number;
    unit: string;
    icon: string;
}

export interface BoQItem {
    id: string;
    code: string;
    name: LocalizedString;
    totalQuantity: number;
    completedQuantity: number;
    unit: string;
}

// --- MATRIX TYPES ---
export type MatrixStatus = 'EMPTY' | 'PREPARING' | 'PENDING' | 'SIGNED' | 'REJECTED';

export interface MatrixCell {
    code: string;
    status: MatrixStatus;
    lastUpdated?: string;
    fileUrl?: string;
    updatedBy?: string;
}

export interface MatrixColumn {
    id: string;
    name: LocalizedString;
    group: LocalizedString;
    type: 'TRASARE' | 'VERIFICARE' | 'INFO';
}

export interface ProgressRow {
    id: string;
    structureId: string;
    location: string;
    foundationType?: string;
    orderIndex: number; // Added for 3D Sorting (KM Logic)
    cells: Record<string, MatrixCell>;
}

export interface PVLAStructure {
  id: string;
  name: string;
  km: string;
  type: 'Bridge' | 'Culvert';
  path?: string; 
}

export interface PVLAIndexConfig {
  title: LocalizedString;
  description: LocalizedString;
  fileUrl: string;
  lastUpdated: string;
}

export interface PVLAFile {
  id: string;
  name: string;
  type: 'Bridge' | 'Culvert';
  structureId?: string;
  structureName?: string;
  date: string;
  size: string;
  path: string; 
}

export interface ProductionStat {
  id: string;
  label: LocalizedString;
  value: number;
  target: number;
  unit: string;
  color: string;
  icon: string;
}

export interface MachineryStat {
    id: string;
    name: LocalizedString;
    total: number;
    active: number;
    maintenance: number;
    icon: string;
}

export interface DailyLog {
    date: string;
    summary: LocalizedString;
    weatherNote: string;
    personnelCount: number;
}

export interface TimelinePhase {
  id: number;
  label: LocalizedString;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  percentage: number;
  startDate: string;
  endDate: string;
  startKm: number;
  endKm: number;
}

export interface DroneFlight {
    id: string;
    title: LocalizedString;
    date: string;
    youtubeId: string;
    thumbnailUrl?: string;
    location: string;
}

export interface ChangelogEntry {
    id: string;
    version: string;
    date: string;
    title: LocalizedString;
    changes: string[]; // List of changes strings
    type: 'major' | 'minor' | 'patch';
}
