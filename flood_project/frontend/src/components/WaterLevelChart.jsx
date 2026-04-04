import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts'

export default function WaterLevelChart({ data = [] }) {
    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                        Water Level Forecast
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">Next 24 hours — meters</p>
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-cyan-400 rounded-full"></span>
                        <span className="text-slate-500">Predicted</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-red-400 rounded-full opacity-60"></span>
                        <span className="text-slate-500">Danger</span>
                    </span>
                </div>
            </div>

            <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.15} />
                                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false}
                            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} interval={3} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false}
                            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} domain={[0, 5]} />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(6,182,212,0.2)',
                                borderRadius: '12px', backdropFilter: 'blur(10px)', fontSize: '12px', color: '#e2e8f0'
                            }}
                            formatter={(val, name) => {
                                const labels = { level: 'Predicted', upper: 'Upper CI', lower: 'Lower CI', danger: 'Danger' }
                                return [`${val} m`, labels[name] || name]
                            }}
                        />
                        <Area type="monotone" dataKey="upper" stroke="none" fill="url(#confidenceGradient)" />
                        <Area type="monotone" dataKey="lower" stroke="none" fill="#0a0e1a" />
                        <Line type="monotone" dataKey="level" stroke="#06b6d4" strokeWidth={2.5}
                            dot={false} activeDot={{ r: 4, fill: '#06b6d4', stroke: '#0a0e1a', strokeWidth: 2 }} />
                        <ReferenceLine y={4.0} stroke="#ef4444" strokeDasharray="6 4" strokeOpacity={0.5}
                            label={{ value: 'DANGER', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
