import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { fetchHistoricalTrends } from '../hooks/useApi';
import { SectionTitle, LoadingSpinner } from '../components/ui';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass px-4 py-3 rounded-xl text-xs space-y-1.5 min-w-[160px]">
        <p className="text-white font-medium mb-2">{label}</p>
        {payload.map(p => (
          <div key={p.dataKey} className="flex justify-between gap-4">
            <span style={{ color: p.color }}>{p.name}</span>
            <span className="text-white font-mono">{p.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function HistoricalTrends() {
  const [trends, setTrends] = useState([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistoricalTrends()
      .then(d => setTrends(d.trends || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen pt-24"><LoadingSpinner /></div>;

  const trend = trends[selected];

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <SectionTitle
            label="Historical Trends"
            title="Election vs Market Performance"
            subtitle="How Indian stock markets have reacted before and after every major election since 2004."
          />
        </motion.div>

        {/* Election selector */}
        <div className="flex flex-wrap gap-3 mb-8">
          {trends.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setSelected(i)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                selected === i
                  ? 'bg-accent/15 border-accent text-accent'
                  : 'glass border-border text-dim hover:text-white'
              }`}
            >
              {t.year || t.election.split(' ')[0]}
            </button>
          ))}
        </div>

        {trend && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Election info card */}
            <div className="glass rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-dim text-xs font-mono uppercase tracking-wider mb-1">Election</p>
                  <p className="text-white font-display font-bold">{trend.election}</p>
                </div>
                <div>
                  <p className="text-dim text-xs font-mono uppercase tracking-wider mb-1">Winner</p>
                  <p className="text-accent font-semibold">{trend.winner}</p>
                </div>
                <div>
                  <p className="text-dim text-xs font-mono uppercase tracking-wider mb-1">Recovery</p>
                  <p className="text-green font-semibold">{trend.recovery}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-dim text-xs font-mono uppercase tracking-wider mb-1">Market Reaction</p>
                <p className="text-white text-sm">{trend.market_reaction}</p>
              </div>
              {trend.event && (
                <div className="mt-3">
                  <p className="text-dim text-xs font-mono uppercase tracking-wider mb-1">Context</p>
                  <p className="text-dim text-sm">{trend.event}</p>
                </div>
              )}
            </div>

            {/* Chart */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-bold text-white mb-6">
                Nifty vs Sector Performance Around Election
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={trend.data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="niftyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="infraGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fmcgGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d40" />
                  <XAxis dataKey="period" tick={{ fill: '#4b6280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#4b6280', fontSize: 11 }} axisLine={false} tickLine={false} width={55} tickFormatter={v => v.toLocaleString()} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ color: '#6b8aab', fontSize: 12, paddingTop: 16 }}
                  />
                  <Area type="monotone" dataKey="nifty" name="Nifty 50" stroke="#3b82f6" fill="url(#niftyGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="infra" name="Infrastructure" stroke="#10b981" fill="url(#infraGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="fmcg" name="FMCG" stroke="#f59e0b" fill="url(#fmcgGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-muted text-xs mt-3 text-center">* Illustrative index values — not real-time data</p>
            </div>

            {/* Election markers guide */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Pre-Election (3M)', desc: 'Uncertainty premium; markets trade cautiously', color: 'border-muted' },
                { label: 'Election Day', desc: 'Maximum volatility — result-day swing', color: 'border-accent' },
                { label: 'Post-Election (6M)', desc: 'Policy clarity drives sector momentum', color: 'border-green' },
              ].map(({ label, desc, color }) => (
                <div key={label} className={`glass rounded-xl p-4 border-l-2 ${color}`}>
                  <p className="text-white text-sm font-semibold mb-1">{label}</p>
                  <p className="text-dim text-xs">{desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
