import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function RainfallChart({ data = [] }) {
    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                        Rainfall Trend
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">Last 72 hours — mm/hr</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                    <span className="text-[10px] font-medium text-blue-400">LIVE</span>
                </div>
            </div>

            <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="rainfallGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false}
                            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} interval={11} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false}
                            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(42,147,255,0.2)',
                                borderRadius: '12px', backdropFilter: 'blur(10px)', fontSize: '12px', color: '#e2e8f0'
                            }}
                            formatter={(val) => [`${val.toFixed(1)} mm/hr`, 'Rainfall']}
                        />
                        <Area type="monotone" dataKey="rainfall" stroke="#3b82f6" fill="url(#rainfallGradient)"
                            strokeWidth={2} dot={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
