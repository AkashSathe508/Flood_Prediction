import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import FloodLayer from './FloodLayer'
import SensorLayer from './SensorLayer'
import EvacuationRoutes from './EvacuationRoutes'
import SatelliteOverlay from './SatelliteOverlay'
import SatelliteComparison from './SatelliteComparison'
import PopulationExposureLayer from './PopulationExposureLayer'
import CriticalInfrastructureLayer from './CriticalInfrastructureLayer'
import FlowDirectionLayer from './FlowDirectionLayer'

// ─── Region Fly-To Component ──────────────────────────────
function RegionFlyTo({ center, zoom, bbox }) {
  const map = useMap()

  useEffect(() => {
    if (bbox && bbox.length === 4) {
      // bbox = [south, west, north, east]
      map.fitBounds([
        [bbox[0], bbox[1]],
        [bbox[2], bbox[3]]
      ], { animate: true, duration: 1.2 })
    } else if (center) {
      map.flyTo(center, zoom || 12, { duration: 1.2 })
    }
  }, [center, zoom, bbox, map])

  return null
}

export default function MapView({ layers = {}, timeOffset = 0, selectedRouteId, center = [28.6139, 77.2090], zoom = 12, bbox }) {
  
  if (layers.compareMode) {
    return (
      <div className="w-full h-full relative">
        <SatelliteComparison />
      </div>
    )
  }

  return (
    <MapContainer center={center} zoom={zoom} zoomControl={false}
                  style={{ height: '100%', width: '100%' }}
                  className="z-0">

      {/* Fly to new region on change */}
      <RegionFlyTo center={center} zoom={zoom} bbox={bbox} />

      {/* Base tile layer */}
      <TileLayer
        attribution='&copy; <a href="https://carto.com">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {/* Satellite overlay */}
      {layers.satellite && <SatelliteOverlay />}

      {/* Population Exposure */}
      {layers.populationExposure && <PopulationExposureLayer />}

      {/* Flood zones (tied to predictive timeOffset) */}
      {layers.floodPrediction && <FloodLayer zones={[]} timeOffset={timeOffset} />}

      {/* Flow Direction Arrows */}
      {layers.flowDirection && <FlowDirectionLayer />}

      {/* Critical Infrastructure */}
      {layers.criticalInfrastructure && <CriticalInfrastructureLayer />}

      {/* Sensors */}
      {layers.waterSensors && <SensorLayer sensors={[]} />}

      {/* Evacuation routes */}
      {layers.evacuationRoutes && <EvacuationRoutes routes={[]} selectedRouteId={selectedRouteId} />}

      {/* Map Controls */}
      <div className="leaflet-bottom leaflet-right" style={{ bottom: '50px', right: '340px' }}>
        <ZoomControl position="bottomright" />
      </div>
    </MapContainer>
  )
}
