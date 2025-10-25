'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

import type { DisasterEvent, DisasterType } from '@/types/disaster';

// Icônes personnalisées pour chaque type de catastrophe
const disasterIcons: Record<DisasterType, L.Icon> = {
  earthquake: L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef5350" width="32" height="32">
        <circle cx="12" cy="12" r="10" opacity="0.3"/>
        <circle cx="12" cy="12" r="6"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  }),
  fire: L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ff9800" width="32" height="32">
        <circle cx="12" cy="12" r="10" opacity="0.3"/>
        <path d="M12 2 L16 10 L12 18 L8 10 Z"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  }),
  cyclone: L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#42a5f5" width="32" height="32">
        <circle cx="12" cy="12" r="10" opacity="0.3"/>
        <path d="M12 2 C8 6 12 12 12 12 C12 12 6 8 2 12 C6 16 12 12 12 12 C12 12 8 18 12 22 C16 18 12 12 12 12 C12 12 18 16 22 12 C18 8 12 12 12 12 Z"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  }),
  flood: L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#66bb6a" width="32" height="32">
        <circle cx="12" cy="12" r="10" opacity="0.3"/>
        <path d="M4 14 Q6 12 8 14 T12 14 T16 14 T20 14 M4 18 Q6 16 8 18 T12 18 T16 18 T20 18" stroke-width="2" fill="none" stroke="#66bb6a"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  }),
  volcano: L.icon({
    iconUrl: 'data:image/svg+xml;base64=' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ab47bc" width="32" height="32">
        <circle cx="12" cy="12" r="10" opacity="0.3"/>
        <path d="M6 18 L10 10 L12 14 L14 10 L18 18 Z"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  }),
  drought: L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fdd835" width="32" height="32">
        <circle cx="12" cy="12" r="10" opacity="0.3"/>
        <circle cx="12" cy="12" r="6"/>
        <path d="M12 2 L12 6 M12 18 L12 22 M2 12 L6 12 M18 12 L22 12 M4.5 4.5 L7.5 7.5 M16.5 16.5 L19.5 19.5 M4.5 19.5 L7.5 16.5 M16.5 7.5 L19.5 4.5" stroke="#fdd835" stroke-width="2"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  }),
  storm: L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#42a5f5" width="32" height="32">
        <circle cx="12" cy="12" r="10" opacity="0.3"/>
        <path d="M12 2 L10 10 L14 10 L12 18 L14 12 L10 12 Z"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  }),
  other: L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9e9e9e" width="32" height="32">
        <circle cx="12" cy="12" r="10" opacity="0.3"/>
        <circle cx="12" cy="12" r="4"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  }),
};

interface DisasterMapProps {
  events: DisasterEvent[];
  onEventClick?: (event: DisasterEvent) => void;
}

export default function DisasterMap({ events, onEventClick }: DisasterMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialiser la carte
    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 18,
        worldCopyJump: true,
      });

      // Ajouter les tuiles OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // Initialiser le groupe de clusters
      markersRef.current = L.markerClusterGroup({
        chunkedLoading: true,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        maxClusterRadius: 50,
      });

      map.addLayer(markersRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!markersRef.current) return;

    // Nettoyer les marqueurs existants
    markersRef.current.clearLayers();

    // Ajouter les nouveaux marqueurs
    events.forEach((event) => {
      const icon = disasterIcons[event.type] || disasterIcons.other;

      const marker = L.marker([event.latitude, event.longitude], { icon });

      // Créer le popup
      const popupContent = `
        <div style="min-width: 200px; font-family: sans-serif;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #333;">
            ${event.title}
          </h3>
          <div style="font-size: 12px; color: #666; line-height: 1.6;">
            <p style="margin: 4px 0;"><strong>Type:</strong> ${getTypeLabel(event.type)}</p>
            <p style="margin: 4px 0;"><strong>Gravité:</strong> ${getSeverityLabel(event.severity)}</p>
            ${event.magnitude ? `<p style="margin: 4px 0;"><strong>Magnitude:</strong> ${event.magnitude}</p>` : ''}
            <p style="margin: 4px 0;"><strong>Date:</strong> ${formatDate(event.startDate)}</p>
            <p style="margin: 4px 0;"><strong>Source:</strong> ${event.source}</p>
            ${event.sourceUrl ? `<p style="margin: 8px 0 0 0;"><a href="${event.sourceUrl}" target="_blank" rel="noopener" style="color: #7c4dff;">Plus d'infos →</a></p>` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Gérer le clic sur le marqueur
      if (onEventClick) {
        marker.on('click', () => onEventClick(event));
      }

      markersRef.current?.addLayer(marker);
    });
  }, [events, onEventClick]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-lg overflow-hidden shadow-lg"
      style={{ minHeight: '500px' }}
    />
  );
}

function getTypeLabel(type: DisasterType): string {
  const labels: Record<DisasterType, string> = {
    earthquake: 'Séisme',
    fire: 'Incendie',
    cyclone: 'Cyclone',
    flood: 'Inondation',
    volcano: 'Volcan',
    drought: 'Sécheresse',
    storm: 'Tempête',
    other: 'Autre',
  };

  return labels[type];
}

function getSeverityLabel(severity: string): string {
  const labels: Record<string, string> = {
    low: 'Faible',
    medium: 'Moyen',
    high: 'Élevé',
    critical: 'Critique',
  };

  return labels[severity] || severity;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
