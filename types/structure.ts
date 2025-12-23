
import { LocalizedString } from './core';

export interface StructureType {
    id: string;
    code: string;
    name: LocalizedString;
    icon: string;
}

export interface StructureMain {
    id: string;
    typeId: string;
    code: string;
    name: string;
    kmStart?: number;
    kmEnd?: number;
    isSplit: boolean; // True if structure has separate Left/Right sides
    // Helper property for UI (joined from types)
    typeCode?: string; 
}

export interface StructureLayer {
    id: string;
    name: LocalizedString;
    orderIndex: number;
}

export interface StructureSurface {
    id: string;
    structureId: string;
    layerId: string;
    fileUrl: string;
    geojson?: any;
    updatedAt: string;
}

export interface StructureGroup {
    id: string;
    structureId: string;
    name: string;
    groupType: 'PIER' | 'ABUTMENT' | 'SPAN' | 'OTHER';
    direction: 'L' | 'R' | 'C'; // Left, Right, Center
    orderIndex: number;
}

export interface StructureElement {
    id: string;
    groupId: string;
    name: string;
    elementClass: 'PILE' | 'FOUNDATION' | 'COLUMN' | 'CAP_BEAM' | 'BEAM' | 'DECK' | 'OTHER' | 'LEAN_CONCRETE' | 'EXCAVATION';
}

export interface ElementCoordinates {
    id: string;
    elementId: string;
    shape: 'CYLINDER' | 'BOX' | 'PRISM' | 'POLYGON'; // Added POLYGON
    coords: { x: number, y: number, z: number }; // Center or Main Reference Z
    dimensions: { d1: number, d2: number, d3: number }; // d1: radius/width, d2: height, d3: length
    rotation: { x: number, y: number, z: number };
    // NEW FIELDS
    polygonPoints?: { x: number, y: number }[]; // Array of {x,y} for corners
    slope?: number; // For excavation slope
}

// Composite type for UI Tree
export interface StructureTreeItem extends StructureMain {
    groups: (StructureGroup & {
        elements: (StructureElement & {
            coordinates?: ElementCoordinates
        })[]
    })[];
    surfaces?: StructureSurface[]; // NEW for Earthworks
}
