'use client';

import { useEffect, useRef, useCallback, Fragment } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Tooltip, useMap } from 'react-leaflet';
import { Property } from '@/types';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';

interface MapClientProps {
  properties: Property[];
  selectedPropertyId: string | null;
  hoveredPropertyId: string | null;
  onPropertySelect: (id: string) => void;
  isDrawingMode?: boolean;
  onDrawComplete?: (coordinates: number[][]) => void;
  mapType?: 'dark' | 'light' | 'satellite';
  locateTrigger?: number; // increment to trigger locate
  flyToTrigger?: number;
  isSidebarCollapsed?: boolean;
}

// Map configuration
const MAP_CENTER: [number, number] = [39.8283, -98.5795]; // US Center
const MAP_ZOOM = 4;

const CARTO_API_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY?.trim();

const TILE_URLS = {
  dark: CARTO_API_KEY
    ? `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${CARTO_API_KEY}`
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
  light: CARTO_API_KEY
    ? `https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png?key=${CARTO_API_KEY}`
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png',
  satellite:
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};

const TILE_ATTRIBUTIONS = {
  dark: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  light: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  satellite: 'Tiles &copy; Esri',
};

// Component to handle programmatic map updates (zooming to selected, etc.)
function MapController({
  selectedProperty,
  hoveredPropertyId,
  flyToTrigger,
  isSidebarCollapsed,
}: {
  selectedProperty?: Property;
  hoveredPropertyId: string | null;
  flyToTrigger?: number;
  isSidebarCollapsed?: boolean;
}) {
  const map = useMap();
  const prevTriggerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!flyToTrigger || flyToTrigger === prevTriggerRef.current) return;
    prevTriggerRef.current = flyToTrigger;

    if (selectedProperty && selectedProperty.coordinates && selectedProperty.coordinates.length > 0) {
      const bounds = L.latLngBounds(selectedProperty.coordinates.map(c => [c[0], c[1]]));

      const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
      const isSidebarVisible = isDesktop && !isSidebarCollapsed;

      // When sidebar is open on desktop, offset map padding so the property is centered in visible map area
      const paddingTopLeft: [number, number] = isSidebarVisible ? [450, 50] : [50, 50];
      const paddingBottomRight: [number, number] = [50, 50];

      map.flyToBounds(bounds, {
        paddingTopLeft,
        paddingBottomRight,
        maxZoom: 16,
        duration: 1.5,
      });
    }
  }, [flyToTrigger, selectedProperty, isSidebarCollapsed, map]);

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 320);
    return () => clearTimeout(timer);
  }, [isSidebarCollapsed, map]);

  return null;
}

// Component to handle Geoman drawing mode
function GeomanController({ isDrawingMode, onDrawComplete }: { isDrawingMode?: boolean, onDrawComplete?: (c: number[][]) => void }) {
  const map = useMap();
  const drawnLayerRef = useRef<L.Polygon | null>(null);

  useEffect(() => {
    // Add translation and initial setup if needed
    map.pm.setLang('en');

    // Listen for drawing creation
    const handleDrawCreate = (e: any) => {
      const layer = e.layer as L.Polygon;
      drawnLayerRef.current = layer;

      const latlngs = layer.getLatLngs();
      let coordsArray: L.LatLng[] = [];

      if (Array.isArray(latlngs) && Array.isArray(latlngs[0])) {
        coordsArray = latlngs[0] as L.LatLng[];
      } else if (Array.isArray(latlngs)) {
        coordsArray = latlngs as unknown as L.LatLng[];
      }

      const coords = coordsArray.map(ll => [ll.lat, ll.lng]);
      if (onDrawComplete) onDrawComplete(coords);
    };

    map.on('pm:create', handleDrawCreate);

    return () => {
      map.off('pm:create', handleDrawCreate);
    };
  }, [map, onDrawComplete]);

  useEffect(() => {
    if (isDrawingMode) {
      map.pm.enableDraw('Polygon');
    } else {
      map.pm.disableDraw('Polygon');
      // Clear the unsaved layer if we cancel drawing
      if (drawnLayerRef.current) {
        map.removeLayer(drawnLayerRef.current);
        drawnLayerRef.current = null;
      }
    }
  }, [isDrawingMode, map]);

  return null;
}

// Component to handle locate-me via geolocation
function LocateController({ locateTrigger }: { locateTrigger?: number }) {
  const map = useMap();
  const markerRef = useRef<L.CircleMarker | null>(null);

  useEffect(() => {
    if (!locateTrigger) return;

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const latlng: L.LatLngExpression = [latitude, longitude];

        // Remove old marker
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }

        // Add user location marker
        markerRef.current = L.circleMarker(latlng, {
          radius: 8,
          fillColor: '#10b981',
          fillOpacity: 1,
          color: '#fff',
          weight: 3,
        }).addTo(map);

        markerRef.current.bindPopup('You are here').openPopup();
        map.flyTo(latlng, 13, { duration: 1.5 });
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Could not get your location. Please allow location access.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [locateTrigger, map]);

  return null;
}

function createPropertyLabelIcon(property: Property, isSelected: boolean) {
  const priceFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.price);

  const html = `
    <div class="polygon-property-badge ${isSelected ? 'polygon-badge-selected' : ''}">
      <span class="badge-title">${property.title}</span>
      <div class="badge-meta">
        <span class="badge-price">${priceFormatted}</span>
        <span class="badge-sep">•</span>
        <span class="badge-size">${property.size} ${property.sizeUnit}</span>
      </div>
      <div class="badge-type">
        <span>${property.type}</span>
        ${property.zoning ? `<span>•</span><span>${property.zoning}</span>` : ''}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'polygon-label-marker',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export default function MapClient({
  properties,
  selectedPropertyId,
  hoveredPropertyId,
  onPropertySelect,
  isDrawingMode,
  onDrawComplete,
  mapType = 'dark',
  locateTrigger,
  flyToTrigger,
  isSidebarCollapsed,
}: MapClientProps) {

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          key={mapType}
          url={TILE_URLS[mapType]}
          attribution={TILE_ATTRIBUTIONS[mapType]}
          subdomains={mapType === 'dark' || mapType === 'light' ? 'abcd' : 'abc'}
          maxZoom={20}
        />

        {/* Render existing properties */}
        {properties.map(property => {
          const isSelected = property.id === selectedPropertyId;
          const isHovered = property.id === hoveredPropertyId;

          const color = property.type === 'house' ? '#eab308' :
            property.type === 'farm' ? '#10b981' : '#3b82f6';

          const center = L.latLngBounds(property.coordinates.map(c => [c[0], c[1]])).getCenter();
          const labelIcon = createPropertyLabelIcon(property, isSelected);

          return (
            <Fragment key={property.id}>
              <Polygon
                positions={property.coordinates as [number, number][]}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: isSelected || isHovered ? 0.6 : 0.25,
                  weight: isSelected ? 4 : 2,
                  className: 'cursor-pointer transition-all',
                }}
                eventHandlers={{
                  click: (e) => {
                    L.DomEvent.stopPropagation(e as any);
                    onPropertySelect(property.id);
                  },
                }}
              >
                <Tooltip sticky direction="top" opacity={0.95} className="polygon-hover-tooltip">
                  Click to view more details
                </Tooltip>
              </Polygon>

              {/* Permanent small-font property list directly on the polygon */}
              <Marker
                position={[center.lat, center.lng]}
                icon={labelIcon}
                interactive={false}
              />
            </Fragment>
          );
        })}

        <MapController
          selectedProperty={selectedProperty}
          hoveredPropertyId={hoveredPropertyId}
          flyToTrigger={flyToTrigger}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <GeomanController isDrawingMode={isDrawingMode} onDrawComplete={onDrawComplete} />
        <LocateController locateTrigger={locateTrigger} />
      </MapContainer>
    </div>
  );
}

