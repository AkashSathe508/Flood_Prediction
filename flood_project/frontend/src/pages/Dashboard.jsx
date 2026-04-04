import { useState, useCallback } from 'react'
import { useRegion } from '../context/RegionContext'
import TopNavBar from '../components/TopNavBar'
import LeftPanel from '../components/LeftPanel'
import RightPanel from '../components/RightPanel'
import BottomDataStream from '../components/BottomDataStream'
import MapView from '../components/MapView'
import useFloodData from '../hooks/useFloodData'

export default function Dashboard() {
  const { region } = useRegion()

  const [layers, setLayers] = useState({
    floodPrediction: true,
    waterSensors: true,
    evacuationRoutes: true,
    traffic: false,
    satellite: false,
    compareMode: false,
    populationExposure: false,
    criticalInfrastructure: false,
    flowDirection: false
  })

  const [timeOffset, setTimeOffset] = useState(0)
  const [selectedRouteId, setSelectedRouteId] = useState('primary')

  // Pass region lat/lng into the data hook so all API calls use current location
  const { riskScore, rainfallData, waterLevelData, alerts, loading } = useFloodData(region.lat, region.lng, 30000)

  const toggleLayer = useCallback((layer) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }))
  }, [])

  return (
    <div className="h-full w-full flex flex-col bg-slate-900">
      {/* Top Nav (Fixed) */}
      <TopNavBar riskScore={riskScore} />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Map Background (70%+) */}
        <div className="absolute inset-0 z-0">
          <MapView
            layers={layers}
            timeOffset={timeOffset}
            selectedRouteId={selectedRouteId}
            center={[region.lat, region.lng]}
            zoom={region.zoom || 12}
            bbox={region.bbox}
          />
        </div>

        {/* Left Panel (z-10 overlaid on map) */}
        <div className="relative z-10 w-80 h-full p-4 pointer-events-none flex flex-col justify-start">
          <div className="pointer-events-auto h-full space-y-4">
            <LeftPanel layers={layers} toggleLayer={toggleLayer} timeOffset={timeOffset} setTimeOffset={setTimeOffset} />
          </div>
        </div>

        {/* Spacer for Map focus */}
        <div className="flex-1 pointer-events-none z-10"></div>

        {/* Right Panel (z-10 overlaid on map) */}
        <div className="relative z-10 w-80 h-full p-4 pointer-events-none flex flex-col justify-start">
          <div className="pointer-events-auto h-full space-y-4">
            <RightPanel
              selectedRouteId={selectedRouteId}
              setSelectedRouteId={setSelectedRouteId}
              riskScore={riskScore}
              rainfallData={rainfallData}
              waterLevelData={waterLevelData}
            />
          </div>
        </div>
      </div>

      {/* Bottom Data Stream — receives live WebSocket alerts */}
      <BottomDataStream liveAlerts={alerts} />
    </div>
  )
}
