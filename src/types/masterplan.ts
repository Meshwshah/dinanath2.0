export type Zone = 'Gold' | 'Platinum' | 'Diamond' | 'Common';

export type PlotStatus = 'Available' | 'On Hold' | 'Sold';

export type ViewMode = 'PDF' | 'Dark' | 'Satellite' | '3D';

export interface PlotDimensions {
  width: number;
  length: number;
  label: string; // e.g. "25.00m x 12.00m"
}

export interface PlotBBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlotData {
  id: string; // e.g. "plot-1"
  number: number;
  label: string; // "Plot 01"
  zone: Zone;
  status: PlotStatus;
  areaSmt: number;
  areaSft: number;
  dimensions: PlotDimensions;
  roadFrontage: string;
  points: [number, number][]; // Polygon vertices in masterplan coordinate space
  center: [number, number]; // Center coordinate for label and camera focus
  bbox: PlotBBox;
  features?: string[];
  price?: {
    totalEstimate: string;
    ratePerSft: string;
  };
}

export interface CommonPlotData {
  id: string;
  number: string;
  label: string;
  areaSmt: number;
  areaSft: number;
  zone: 'Common';
  points: [number, number][];
  center: [number, number];
  bbox: PlotBBox;
  description: string;
}

export interface SiteInfo {
  name: string;
  client: string;
  projectType: string;
  detail: string;
  architect: string;
  engineer: string;
  contactPhone: string;
  contactEmail: string;
  officeAddress: string;
  location: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  totalAreaSmt: number;
  totalAreaSft: number;
  totalPlots: number;
  commonPlot01Smt: number;
  commonPlot02Smt: number;
  naliyaSetbackSmt: number;
  treePlantationWidthMt: number;
  roads: {
    naliyaRoadMt: number;
    crossOverRoadMt: number;
    internalMajorRoadMt: number;
    internalMinorRoadMt: number;
  };
}

export interface CameraState {
  x: number;
  y: number;
  scale: number;
  isTransitioning: boolean;
}

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'warning';
}
