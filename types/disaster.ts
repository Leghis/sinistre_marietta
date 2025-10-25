export type DisasterType =
  | 'earthquake'
  | 'fire'
  | 'cyclone'
  | 'flood'
  | 'volcano'
  | 'drought'
  | 'storm'
  | 'other';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface DisasterEvent {
  id: string;
  type: DisasterType;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  severity: SeverityLevel;
  magnitude?: number;
  startDate: Date;
  endDate?: Date;
  source: string;
  sourceUrl?: string;
  affectedCountries?: string[];
  status?: 'active' | 'closed';
}

export interface DisasterStatistics {
  earthquake: number;
  fire: number;
  cyclone: number;
  flood: number;
  volcano: number;
  drought: number;
  storm: number;
  total: number;
}

export interface FilterOptions {
  types: DisasterType[];
  minSeverity: SeverityLevel | 'all';
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// API Response Types

export interface GDACSEvent {
  eventid: string;
  eventtype: string;
  eventname: string;
  description?: string;
  alertlevel: string;
  country?: string;
  fromdate: string;
  todate?: string;
  latitude: number;
  longitude: number;
  severitydata?: {
    severity?: number;
  };
  htmldescription?: string;
  url?: {
    geometry?: string;
    report?: string;
  };
}

export interface EONETEvent {
  id: string;
  title: string;
  description?: string;
  link?: string;
  categories: Array<{
    id: string;
    title: string;
  }>;
  sources: Array<{
    id: string;
    url: string;
  }>;
  geometry: Array<{
    date: string;
    type: string;
    coordinates: [number, number] | [number, number, number];
  }>;
  closed?: string;
}

export interface USGSEarthquakeProperties {
  mag: number;
  place: string;
  time: number;
  updated: number;
  tz?: number;
  url: string;
  detail: string;
  felt?: number;
  cdi?: number;
  mmi?: number;
  alert?: string;
  status: string;
  tsunami: number;
  sig: number;
  net: string;
  code: string;
  ids: string;
  sources: string;
  types: string;
  nst?: number;
  dmin?: number;
  rms: number;
  gap?: number;
  magType: string;
  type: string;
  title: string;
}

export interface USGSEarthquakeFeature {
  type: 'Feature';
  properties: USGSEarthquakeProperties;
  geometry: {
    type: 'Point';
    coordinates: [number, number, number]; // [longitude, latitude, depth]
  };
  id: string;
}

export interface USGSEarthquakeResponse {
  type: 'FeatureCollection';
  metadata: {
    generated: number;
    url: string;
    title: string;
    status: number;
    api: string;
    count: number;
  };
  features: USGSEarthquakeFeature[];
}

export interface FIRMSFirePoint {
  latitude: number;
  longitude: number;
  brightness: number;
  scan: number;
  track: number;
  acq_date: string;
  acq_time: string;
  satellite: string;
  confidence: string | number;
  version: string;
  bright_t31: number;
  frp: number;
  daynight: string;
}
