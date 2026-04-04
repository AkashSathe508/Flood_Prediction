import { useState, useEffect } from 'react'

export default function BottomDataStream({ liveAlerts = [] }) {
  const [events, setEvents] = useState([
    { id: 4, time: '12:36 PM', msg: 'Evacuation route A3 recalculated (traffic constraint)', type: 'route' },
    { id: 3, time: '12:35 PM', msg: 'CNN & LSTM fusion: flood probability elevated to 67%', type: 'ai' },
    { id: 2, time: '12:34 PM', msg: 'Sensor WS_12 (Yamuna) water level increased to 3.8m', type: 'sensor' },
    { id: 1, time: '12:32 PM', msg: 'Abnormal rainfall spike detected in grid sector 4B', type: 'weather' },
  ])

  // Merge live WebSocket alerts into the event stream
  useEffect(() => {
    if (liveAlerts.length > 0) {
      const latest = liveAlerts[0]
      if (latest && latest.message) {
        const time = latest.timestamp
          ? new Date(latest.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        const severityToType = { critical: 'ai', high: 'weather', medium: 'sensor', low: 'route' }
        const newEvent = {
          id: latest.id || Date.now(),
          time,
          msg: latest.message,
          type: severityToType[latest.severity] || 'sensor'
        }

        setEvents(prev => {
          // Avoid duplicates
          if (prev[0]?.id === newEvent.id) return prev
          return [newEvent, ...prev].slice(0, 15)
        })
      }
    }
  }, [liveAlerts])

  // Simulated background events as fallback
  useEffect(() => {
    const msgs = [
      { msg: 'River bank overflow detected by Satellite T3', type: 'ai' },
      { msg: 'Traffic density increased by 15% on Evac-Route 2', type: 'route' },
      { msg: 'Sensor WS_8 reporting normal stabilization', type: 'sensor' },
      { msg: 'Rainfall forecast reduced for upcoming 2 hours', type: 'weather' },
    ]
    
    const interval = setInterval(() => {
      const now = new Date()
      const timeFmt = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const randEvent = msgs[Math.floor(Math.random() * msgs.length)]
      
      setEvents(prev => [{ id: Date.now(), time: timeFmt, ...randEvent }, ...prev].slice(0, 15))
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  const colors = {
    route: 'text-green-400',
    ai: 'text-purple-400',
    sensor: 'text-blue-400',
    weather: 'text-yellow-400'
  }

  return (
    <div className="h-10 bg-[#0f172a] border-t border-white/5 flex items-center px-4 shrink-0 font-mono text-[11px] overflow-hidden">
      <div className="flex items-center gap-3 whitespace-nowrap px-2 border-r border-white/10 h-full text-slate-400 mr-4 tracking-widest uppercase">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]"></span>
        Live Feed
      </div>
      
      <div className="flex gap-8 overflow-x-hidden animate-slide relative flex-1">
        {events.map((ev) => (
          <div key={ev.id} className="flex items-center gap-2 whitespace-nowrap min-w-max">
            <span className="text-slate-500">{ev.time}</span>
            <span className="text-slate-600">—</span>
            <span className={colors[ev.type]}>{ev.msg}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
