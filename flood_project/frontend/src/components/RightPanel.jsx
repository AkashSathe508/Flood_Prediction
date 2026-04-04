import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useRegion } from '../context/RegionContext'
import { getEvacuationRoute } from '../services/api'
import RainfallChart from './RainfallChart'
import WaterLevelChart from './WaterLevelChart'

const modelContributions = [
  { name: 'CNN Satellite Analysis', value: 42, color: '#3b82f6' },
  { name: 'LSTM Rainfall Forecast', value: 33, color: '#06b6d4' },
  { name: 'Water Level Sensors', value: 15, color: '#22c55e' },
  { name: 'Routing / Traffic', value: 10, color: '#eab308' },
]

export default function RightPanel({ selectedRouteId, setSelectedRouteId, riskScore, rainfallData, waterLevelData }) {
  const { region } = useRegion()
  const [routeOptions, setRouteOptions] = useState([
    { id: 'route_0', name: 'Route A', distance: '...', risk: 0, time: '...', color: '#22c55e' },
    { id: 'route_1', name: 'Route B', distance: '...', risk: 0, time: '...', color: '#eab308' },
    { id: 'route_2', name: 'Route C', distance: '...', risk: 0, time: '...', color: '#ef4444' },
  ])

  // Fetch real routes when region changes
  useEffect(() => {
    async function fetchRoutes() {
      try {
        const destLat = region.lat - 0.03
        const destLng = region.lng - 0.04
        const res = await getEvacuationRoute(region.lat, region.lng, destLat, destLng)
        if (res.data && res.data.routes) {
          const colors = ['#22c55e', '#eab308', '#ef4444']
          const names = ['Route A', 'Route B', 'Route C']
          const mapped = res.data.routes.map((r, i) => ({
            id: r.id || `route_${i}`,
            name: names[i] || `Route ${i + 1}`,
            distance: `${r.distance_km} km`,
            risk: r.risk_score || 0,
            time: `${r.duration_min} min`,
            color: colors[i] || '#64748b',
          }))
          setRouteOptions(mapped)
        }
      } catch (err) {
        console.warn('Route fetch for panel failed:', err)
      }
    }
    fetchRoutes()
  }, [region.lat, region.lng])

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto">
      {/* Rainfall Chart (from real Open-Meteo data) */}
      <RainfallChart data={rainfallData} />

      {/* Water Level Chart (from real river discharge) */}
      <WaterLevelChart data={waterLevelData} />

      {/* Evacuation Route Comparison */}
      <div className="panel-card p-4 rounded-xl flex-shrink-0">
        <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-3 border-b border-white/10 pb-2">Route Comparison</h3>
        <div className="space-y-2">
          {routeOptions.map((route, idx) => {
            const isSafest = idx === 0
            const isSelected = selectedRouteId === route.id || (!selectedRouteId && isSafest)
            return (
              <div 
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all duration-200 ${
                  isSelected ? 'bg-blue-500/10 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-white/5 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-blue-400' : 'text-slate-400'}`}>
                    {route.name} {isSafest && '(SAFEST)'}
                  </span>
                  <div className="w-2 h-2 rounded-full" style={{ background: route.color, boxShadow: `0 0 8px ${route.color}` }}></div>
                </div>
                <div className="grid grid-cols-3 gap-1 text-[9px] font-mono">
                  <div className="text-slate-500">Dist: <span className="text-slate-300 font-bold">{route.distance}</span></div>
                  <div className="text-slate-500">Risk: <span className={route.risk > 50 ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>{route.risk}%</span></div>
                  <div className="text-slate-500 text-right">Time: <span className="text-cyan-400 font-bold">{route.time}</span></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Model Contribution */}
      <div className="panel-card p-4 rounded-xl flex-shrink-0">
        <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-3">AI Model Contribution</h3>
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={modelContributions} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                formatter={(value) => [`${value}%`, 'Weight']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={10}>
                {modelContributions.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
