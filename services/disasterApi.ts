import type {
  DisasterEvent,
  DisasterType,
  SeverityLevel,
  GDACSEvent,
  EONETEvent,
  USGSEarthquakeResponse,
  FIRMSFirePoint,
} from '@/types/disaster';

const GDACS_BASE_URL = 'https://www.gdacs.org/gdacsapi/api';
const EONET_BASE_URL = 'https://eonet.gsfc.nasa.gov/api/v3';
const USGS_BASE_URL = 'https://earthquake.usgs.gov/fdsnws/event/1';
const FIRMS_BASE_URL = 'https://firms.modaps.eosdis.nasa.gov';

// CORS proxy pour les APIs qui nécessitent un proxy
const CORS_PROXY = 'https://corsproxy.io/?';

/**
 * Convertit le type d'événement GDACS en type DisasterType
 */
function mapGDACSEventType(eventType: string): DisasterType {
  const mapping: Record<string, DisasterType> = {
    'EQ': 'earthquake',
    'TC': 'cyclone',
    'FL': 'flood',
    'VO': 'volcano',
    'WF': 'fire',
    'DR': 'drought',
  };

  return mapping[eventType] || 'other';
}

/**
 * Convertit le niveau d'alerte GDACS en SeverityLevel
 */
function mapGDACSAlertLevel(alertLevel: string): SeverityLevel {
  const level = alertLevel?.toLowerCase();

  if (level === 'red') return 'critical';
  if (level === 'orange') return 'high';
  if (level === 'green') return 'medium';

  return 'low';
}

/**
 * Convertit la catégorie EONET en type DisasterType
 */
function mapEONETCategory(categoryTitle: string): DisasterType {
  const title = categoryTitle.toLowerCase();

  if (title.includes('wildfire') || title.includes('fire')) return 'fire';
  if (title.includes('storm') || title.includes('cyclone') || title.includes('hurricane')) return 'cyclone';
  if (title.includes('flood')) return 'flood';
  if (title.includes('volcano')) return 'volcano';
  if (title.includes('drought')) return 'drought';

  return 'storm';
}

/**
 * Calcule le niveau de gravité basé sur la magnitude du séisme
 */
function calculateEarthquakeSeverity(magnitude: number): SeverityLevel {
  if (magnitude >= 7.0) return 'critical';
  if (magnitude >= 6.0) return 'high';
  if (magnitude >= 5.0) return 'medium';

  return 'low';
}

/**
 * Récupère les événements depuis GDACS
 */
export async function fetchGDACSEvents(): Promise<DisasterEvent[]> {
  try {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7); // 7 derniers jours

    const params = new URLSearchParams({
      eventlist: 'EQ;TC;FL;VO;WF;DR',
      fromdate: fromDate.toISOString().split('T')[0],
      todate: new Date().toISOString().split('T')[0],
      alertlevel: 'orange;red;green',
      pagesize: '100',
    });

    const url = `${GDACS_BASE_URL}/events/geteventlist/SEARCH?${params}`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`GDACS API error: ${response.status}`);
    }

    const data = await response.json();
    const events: GDACSEvent[] = data?.features || [];

    return events.map((event: GDACSEvent) => ({
      id: `gdacs-${event.eventid}`,
      type: mapGDACSEventType(event.eventtype),
      title: event.eventname || 'Événement sans nom',
      description: event.description || event.htmldescription,
      latitude: event.latitude,
      longitude: event.longitude,
      severity: mapGDACSAlertLevel(event.alertlevel),
      magnitude: event.severitydata?.severity,
      startDate: new Date(event.fromdate),
      endDate: event.todate ? new Date(event.todate) : undefined,
      source: 'GDACS',
      sourceUrl: event.url?.report,
      affectedCountries: event.country ? [event.country] : undefined,
      status: event.todate ? 'closed' : 'active',
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des événements GDACS:', error);
    return [];
  }
}

/**
 * Récupère les événements depuis NASA EONET
 */
export async function fetchEONETEvents(): Promise<DisasterEvent[]> {
  try {
    const params = new URLSearchParams({
      status: 'open',
      days: '7',
    });

    const url = `${EONET_BASE_URL}/events?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`EONET API error: ${response.status}`);
    }

    const data = await response.json();
    const events: EONETEvent[] = data?.events || [];

    return events.map((event: EONETEvent) => {
      const latestGeometry = event.geometry[event.geometry.length - 1];
      const coords = latestGeometry.coordinates;
      const [lon, lat] = Array.isArray(coords[0]) ? coords[0] : coords;

      return {
        id: `eonet-${event.id}`,
        type: event.categories[0] ? mapEONETCategory(event.categories[0].title) : 'other',
        title: event.title,
        description: event.description,
        latitude: lat as number,
        longitude: lon as number,
        severity: 'medium', // EONET ne fournit pas de niveau de gravité
        startDate: new Date(latestGeometry.date),
        endDate: event.closed ? new Date(event.closed) : undefined,
        source: 'NASA EONET',
        sourceUrl: event.link || (event.sources[0]?.url),
        status: event.closed ? 'closed' : 'active',
      };
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des événements EONET:', error);
    return [];
  }
}

/**
 * Récupère les séismes depuis USGS
 */
export async function fetchUSGSEarthquakes(): Promise<DisasterEvent[]> {
  try {
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 7); // 7 derniers jours

    const params = new URLSearchParams({
      format: 'geojson',
      starttime: startTime.toISOString(),
      minmagnitude: '4.5',
      orderby: 'time',
    });

    const url = `${USGS_BASE_URL}/query?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`USGS API error: ${response.status}`);
    }

    const data: USGSEarthquakeResponse = await response.json();

    return data.features.map((feature) => ({
      id: `usgs-${feature.id}`,
      type: 'earthquake' as DisasterType,
      title: feature.properties.title,
      description: `Magnitude ${feature.properties.mag} - ${feature.properties.place}`,
      latitude: feature.geometry.coordinates[1],
      longitude: feature.geometry.coordinates[0],
      severity: calculateEarthquakeSeverity(feature.properties.mag),
      magnitude: feature.properties.mag,
      startDate: new Date(feature.properties.time),
      source: 'USGS',
      sourceUrl: feature.properties.url,
      status: 'active',
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des séismes USGS:', error);
    return [];
  }
}

/**
 * Récupère les incendies depuis NASA FIRMS
 * Note: Nécessite une clé API (MAP_KEY) - ici nous utilisons un endpoint public limité
 */
export async function fetchFIRMSFires(): Promise<DisasterEvent[]> {
  try {
    // Alternative: utiliser EONET pour les incendies car FIRMS nécessite une clé API
    // On peut aussi utiliser l'endpoint public MODIS C6.1
    // Pour cette démo, nous retournons un tableau vide
    // Les utilisateurs devront s'inscrire sur https://firms.modaps.eosdis.nasa.gov/api/
    // et ajouter leur MAP_KEY

    console.warn('FIRMS API nécessite une clé MAP_KEY. Utilisez EONET pour les incendies.');
    return [];

    /* Avec une MAP_KEY:
    const MAP_KEY = 'VOTRE_CLE_API';
    const url = `https://firms.modaps.eosdis.nasa.gov/api/country/csv/${MAP_KEY}/VIIRS_NOAA20_NRT/WORLD/1`;

    const response = await fetch(url);
    const csvText = await response.text();

    // Parser le CSV et convertir en DisasterEvent[]
    // ...
    */
  } catch (error) {
    console.error('Erreur lors de la récupération des incendies FIRMS:', error);
    return [];
  }
}

/**
 * Récupère tous les événements de toutes les sources
 */
export async function fetchAllDisasterEvents(): Promise<DisasterEvent[]> {
  try {
    const [gdacsEvents, eonetEvents, usgsEvents] = await Promise.all([
      fetchGDACSEvents(),
      fetchEONETEvents(),
      fetchUSGSEarthquakes(),
      // fetchFIRMSFires(), // Décommenté si vous avez une clé API FIRMS
    ]);

    const allEvents = [...gdacsEvents, ...eonetEvents, ...usgsEvents];

    // Supprimer les doublons potentiels basés sur la proximité géographique et temporelle
    const uniqueEvents = removeDuplicates(allEvents);

    // Trier par date (plus récent en premier)
    uniqueEvents.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

    return uniqueEvents;
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les événements:', error);
    return [];
  }
}

/**
 * Supprime les événements en double basés sur la proximité géographique et temporelle
 */
function removeDuplicates(events: DisasterEvent[]): DisasterEvent[] {
  const unique: DisasterEvent[] = [];

  for (const event of events) {
    const isDuplicate = unique.some((existing) => {
      // Vérifier si c'est le même type
      if (existing.type !== event.type) return false;

      // Vérifier la proximité géographique (environ 50km)
      const distance = calculateDistance(
        existing.latitude,
        existing.longitude,
        event.latitude,
        event.longitude
      );

      if (distance > 50) return false;

      // Vérifier la proximité temporelle (même jour)
      const timeDiff = Math.abs(existing.startDate.getTime() - event.startDate.getTime());
      const dayInMs = 24 * 60 * 60 * 1000;

      return timeDiff < dayInMs;
    });

    if (!isDuplicate) {
      unique.push(event);
    }
  }

  return unique;
}

/**
 * Calcule la distance entre deux points géographiques (en km)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
