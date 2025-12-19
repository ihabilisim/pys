
import { LocalizedString } from './core';

export type DataStatus = 'ACTIVE' | 'PASSIVE' | 'DRAFT';
export type PolygonStatus = 'ACTIVE' | 'LOST' | 'DAMAGED';

export interface WeatherData {
  temp: number;
  wind: number;
  code: number;
}

export interface TopoItem {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  link: string;
  date: string;
  status: DataStatus;
}

export interface PolygonPoint {
  id: string;
  polygonNo: string;
  roadName?: string;
  km?: string;
  offset?: string;
  east: string;
  north: string;
  elevation: string;
  lat?: string;
  lng?: string;
  description: string;
  status: PolygonStatus;
}

export interface LandXMLFile {
  id: string;
  name: string;
  type: 'SURFACE' | 'ALIGNMENT';
  uploadedBy: string;
  uploadDate: string;
  size: string;
  url: string;
  description?: string;
  // Visual Properties
  color: string;
  opacity: number;
  isVisible: boolean; 
}

export interface ExternalMapLayer {
  id: string;
  name: string;
  category: string;
  type: 'GEOJSON';
  data: any;
  color: string;
  opacity: number;
  addedDate: string;
  isVisible: boolean;
  url?: string; // Uploaded file URL
}

export interface UtilityCategory {
    id: string;
    name: LocalizedString;
    color: string;
}

export interface SitePhoto {
    id: string;
    lat: number;
    lng: number;
    url: string;
    description: LocalizedString;
    date: string;
}

export interface ChainageMarker {
    id: string;
    km: string;
    lat: number;
    lng: number;
    align: 'start' | 'center' | 'end';
}

export interface SiteIssue {
    id: string;
    type: 'NCR' | 'SNAG' | 'SAFETY';
    status: 'OPEN' | 'CLOSED';
    lat: number;
    lng: number;
    description: string;
    photoUrl?: string;
    reportedDate: string;
    assignedTo?: string;
}

export interface MapNote {
    id: string;
    lat: number;
    lng: number;
    text: string;
    author: string;
    date: string;
}

export interface TopoData {
  polygonCount: number;
  surfaceArea: number; 
  lastUpdated: string;
}
