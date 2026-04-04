import { useState, useEffect, useCallback } from 'react'
import { useRegion } from '../context/RegionContext'

function debounce(fn, ms) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

export default function LeftPanel({ layers, toggleLayer, timeOffset, setTimeOffset }) {
  const { region, updateRegion, locateMe } = useRegion()
  const [isPlaying, setIsPlaying] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)

  const layerControls = [
    { id: 'floodPrediction', label: 'Flood Prediction (CNN+LSTM)', icon: '🌊', color: '#ef4444' },
    { id: 'populationExposure', label: 'Population Exposure', icon: '👥', color: '#a855f7' },
    { id: 'criticalInfrastructure', label: 'Critical Infrastructure', icon: '🏥', color: '#f59e0b' },
    { id: 'flowDirection', label: 'Flow Direction', icon: '↘️', color: '#38bdf8' },
    { id: 'waterSensors', label: 'Water Sensors', icon: '📡', color: '#3b82f6' },
    { id: 'evacuationRoutes', label: 'Evacuation Routes', icon: '🚨', color: '#22c55e' },
    { id: 'traffic', label: 'Traffic Density', icon: '🚗', color: '#eab308' },
    { id: 'satellite', label: 'Satellite Layer', icon: '🛰️', color: '#8b5cf6' },
    { id: 'compareMode', label: 'Before/After Comparison', icon: '◂▸', color: '#06b6d4' },
  ]

  // Debounced Nominatim search for region focus
  const searchLocation = useCallback(
    debounce(async (q) => {
      if (q.length < 3) { setSearchResults([]); return }
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`,
          { headers: { 'User-Agent': 'FloodSentinel/1.0' } }
        )
        const results = await res.json()
        setSearchResults(results)
        setShowResults(results.length > 0)
      } catch (err) {
        console.warn('Search failed:', err)
      }
    }, 400),
    []
  )

  const handleSelectLocation = (result) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    const bbox = result.boundingbox
      ? result.boundingbox.map(Number)
      : [lat - 0.15, lat + 0.15, lng - 0.25, lng + 0.25]

    updateRegion({
      lat, lng,
      regionName: result.display_name.split(',')[0],
      bbox: [bbox[0], bbox[2], bbox[1], bbox[3]],
      zoom: 12,
    })
    setSearchQuery(result.display_name.split(',')[0])
    setShowResults(false)
  }

  // Play animation effect
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeOffset(prev => {
          if (prev >= 24) {
            setIsPlaying(false)
            return 24
          }
          return prev + 3
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, setTimeOffset])

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Region Search (replaces old static dropdown) */}
      <div className="panel-card p-4 rounded-xl flex-shrink-0">
        <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-3">Region Focus</h3>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              searchLocation(e.target.value)
            }}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            placeholder={region.regionName}
            className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          />
          {/* Locate Me button */}
          <button
            onClick={locateMe}
            title="Use my location"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm hover:scale-110 transition-transform"
          >
            📍
          </button>

          {/* Search results dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e293b] border border-white/10 rounded-lg shadow-xl z-[9999] max-h-48 overflow-y-auto">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectLocation(r)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-blue-500/20 hover:text-white transition-colors border-b border-white/5 last:border-0"
                >
                  <div className="font-medium truncate">{r.display_name.split(',').slice(0, 2).join(',')}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">{r.display_name}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Layer Controls */}
      <div className="panel-card p-4 rounded-xl flex-1 overflow-y-auto">
        <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-4">Map Overlays</h3>
        <div className="space-y-2.5">
          {layerControls.map((layer) => (
            <label key={layer.id} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                layers[layer.id] ? 'bg-blue-500 border-blue-500' : 'border-slate-600 group-hover:border-slate-400'
              }`}>
                {layers[layer.id] && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={layers[layer.id]}
                onChange={() => toggleLayer(layer.id)}
              />
              <span className="text-sm opacity-80">{layer.icon}</span>
              <span className={`text-xs font-medium transition-colors ${layers[layer.id] ? 'text-slate-100' : 'text-slate-400 group-hover:text-slate-300'}`}>
                {layer.label}
              </span>
              {layers[layer.id] && (
                <div className="ml-auto w-2 h-2 rounded-full shadow-lg" style={{ backgroundColor: layer.color, boxShadow: `0 0 8px ${layer.color}` }}></div>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Time Simulation */}
      <div className="panel-card p-4 rounded-xl flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
            Predictive Timeline
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (timeOffset >= 24) setTimeOffset(0)
                setIsPlaying(prev => !prev)
              }}
              className="w-6 h-6 flex items-center justify-center bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/40 transition-colors border border-cyan-500/30"
            >
              {isPlaying ? "⏸" : "▶"}
            </button>

            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded border border-cyan-400/20">
              {timeOffset === 0 ? "LIVE" : `+${timeOffset}h Forecast`}
            </span>
          </div>
        </div>

        <input
          type="range"
          min="0"
          max="24"
          step="3"
          value={timeOffset}
          onChange={(e) => {
            setIsPlaying(false)
            setTimeOffset(parseInt(e.target.value, 10))
          }}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />

        <div className="flex justify-between text-[9px] text-slate-500 mt-2 font-mono">
          <span>NOW</span>
          <span>+6h</span>
          <span>+12h</span>
          <span>+18h</span>
          <span>+24h</span>
        </div>
      </div>
    </div>
  )
}
