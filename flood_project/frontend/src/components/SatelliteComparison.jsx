import { useState, useRef, useEffect } from 'react'

export default function SatelliteComparison() {
  const [sliderPos, setSliderPos] = useState(50)
  const containerRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleMove = (e) => {
    if (!isDragging || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100))
    setSliderPos(percent)
  }

  useEffect(() => {
    const handleUp = () => setIsDragging(false)
    if (isDragging) {
      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [isDragging])

  // Mock satellite images for demonstration
  // In a real app these would be actual satellite layers bound to the map bounds
  const beforeImg = "" // abstract terrain
  const afterImg = "" // flooded terrain lookalike

  return (
    <div className="absolute inset-0 z-[400] bg-slate-900 pointer-events-auto flex flex-col items-center justify-center p-8">
      {/* Disclaimer / Header */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[500] bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 text-center shadow-2xl">
        <h2 className="text-white text-sm font-bold tracking-widest uppercase mb-1">Satellite Intelligence</h2>
        <p className="text-cyan-400 text-[10px] font-mono">BEFORE vs AFTER FLOOD COMPARISON</p>
      </div>
      
      {/* Slider Container */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-5xl h-[70vh] rounded-2xl overflow-hidden comparison-slider border-4 border-white/10 shadow-2xl shadow-blue-500/10 cursor-ew-resize"
        onMouseDown={(e) => { setIsDragging(true); handleMove(e); }}
      >
        {/* AFTER Output (Base) */}
        <div className="absolute inset-0">
          <img src={afterImg} className="w-full h-full object-cover filter brightness-75 contrast-125 saturate-50 hue-rotate-15" alt="After" />
          <div className="absolute bottom-4 right-4 bg-red-500/80 text-white px-3 py-1 rounded text-xs font-bold font-mono border border-red-400">
            AFTER: 48h POST-STORM
          </div>
        </div>

        {/* BEFORE Output (Clipped) */}
        <div 
          className="absolute inset-0 border-r-2 border-white/50"
          style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
        >
          <img src={beforeImg} className="w-full h-full object-cover filter brightness-90 saturate-50" alt="Before" />
          <div className="absolute bottom-4 left-4 bg-green-500/80 text-white px-3 py-1 rounded text-xs font-bold font-mono border border-green-400">
            BEFORE: BASELINE
          </div>
        </div>

        {/* Handle */}
        <div 
          className="handle" 
          style={{ left: `${sliderPos}%` }}
        ></div>
      </div>
      
      <p className="mt-8 text-slate-500 text-xs text-center max-w-2xl font-mono">
        <span className="text-cyan-400">*</span> Drag the slider to compare baseline satellite imagery against post-storm CNN flood segmentations. The dark overlay on the right illustrates CNN-detected surface water boundaries.
      </p>
    </div>
  )
}
