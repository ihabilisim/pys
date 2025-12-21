
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
}

export interface StructureGroup {
    id: string;
    structureId: string;
    name: string;
    groupType: 'PIER' | 'ABUTMENT' | 'SPAN' | 'OTHER';
    orderIndex: number;
}

export interface StructureElement {
    id: string;
    groupId: string;
    name: string;
    elementClass: 'PILE' | 'FOUNDATION' | 'COLUMN' | 'CAP_BEAM' | 'BEAM' | 'DECK' | 'OTHER';
}

export interface ElementCoordinates {
    id: string;
    elementId: string;
    shape: 'CYLINDER' | 'BOX' | 'PRISM';
    coords: { x: number, y: number, z: number };
    dimensions: { d1: number, d2: number, d3: number }; // d1: radius/width, d2: height, d3: length
    rotation: { x: number, y: number, z: number };
}

// Composite type for UI Tree
export interface StructureTreeItem extends StructureMain {
    groups: (StructureGroup & {
        elements: (StructureElement & {
            coordinates?: ElementCoordinates
        })[]
    })[];
}
