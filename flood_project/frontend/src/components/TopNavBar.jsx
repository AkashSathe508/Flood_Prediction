import { useState, useCallback, useRef, useEffect } from 'react'
import { useRegion } from '../context/RegionContext'

function debounce(fn, ms) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

export default function TopNavBar({ riskScore }) {
  const { region, updateRegion } = useRegion()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Debounced Nominatim search
  const searchNominatim = useCallback(
    debounce(async (q) => {
      if (q.length < 3) { setSuggestions([]); return }
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`,
          { headers: { 'User-Agent': 'FloodSentinel/1.0' } }
        )
        const results = await res.json()
        setSuggestions(results)
        setShowDropdown(results.length > 0)
      } catch (err) {
        console.warn('Nominatim search failed:', err)
      }
    }, 400),
    []
  )

  const handleSelect = (result) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    const bbox = result.boundingbox
      ? result.boundingbox.map(Number)  // [south, north, west, east] from Nominatim
      : [lat - 0.15, lat + 0.15, lng - 0.25, lng + 0.25]

    updateRegion({
      lat,
      lng,
      regionName: result.display_name.split(',')[0],
      bbox: [bbox[0], bbox[2], bbox[1], bbox[3]], // [south, west, north, east]
      zoom: 12,
    })
    setQuery(result.display_name.split(',').slice(0, 2).join(','))
    setShowDropdown(false)
    setSuggestions([])
  }

  const riskLevel = riskScore?.level || 'MEDIUM'
  const riskColor = riskLevel === 'HIGH' ? 'text-red-400' : riskLevel === 'LOW' ? 'text-green-400' : 'text-yellow-400'

  return (
    <header className="h-14 bg-[#1e293b] border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-50 shadow-lg relative">
      <div className="flex items-center gap-4 w-1/3">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold shadow-md shadow-blue-500/20 text-white">
          FS
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-100 tracking-wide">AI Flood Intelligence Platform</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Command Center</p>
        </div>
      </div>

      {/* Search bar with Nominatim autocomplete */}
      <div className="flex-1 flex justify-center w-1/3">
        <div className="relative w-full max-w-md">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              searchNominatim(e.target.value)
            }}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            placeholder={`Search any location (current: ${region.regionName})...`}
            className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>

          {/* Dropdown results */}
          {showDropdown && suggestions.length > 0 && (
            <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-[#1e293b] border border-white/10 rounded-lg shadow-xl z-[9999] max-h-60 overflow-y-auto">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(s)}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-blue-500/20 hover:text-white transition-colors border-b border-white/5 last:border-0"
                >
                  <div className="font-medium">{s.display_name.split(',').slice(0, 2).join(',')}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">{s.display_name}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-6 w-1/3">
        <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-wider">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Region:</span>
            <span className="text-cyan-400 max-w-[80px] truncate">{region.regionName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Risk:</span>
            <span className={riskColor}>{riskLevel}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Rainfall:</span>
            <span className="text-green-400 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div> LIVE</span>
          </div>
        </div>
      </div>
    </header>
  )
}
