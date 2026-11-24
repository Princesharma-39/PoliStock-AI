import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function Card({ children, className = '', glow = false }) {
  return (
    <div className={`glass rounded-2xl p-6 ${glow ? 'glow-blue' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({ label, title, subtitle }) {
  return (
    <div className="mb-10">
      {label && (
        <span className="font-mono text-xs tracking-widest text-accent uppercase">{label}</span>
      )}
      <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-2">{title}</h2>
      {subtitle && <p className="text-dim mt-3 max-w-xl">{subtitle}</p>}
    </div>
  );
}

export function SentimentBadge({ sentiment }) {
  const map = {
    Bullish: { color: 'text-green bg-green/10 border-green/20', icon: <TrendingUp size={14} /> },
    Bearish: { color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: <TrendingDown size={14} /> },
    Neutral: { color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', icon: <Minus size={14} /> },
  };
  const { color, icon } = map[sentiment] || map.Neutral;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${color}`}>
      {icon} {sentiment}
    </span>
  );
}

export function StatCard({ label, value, sub, color = 'blue' }) {
  const c = color === 'green' ? 'text-green' : color === 'red' ? 'text-red-400' : 'text-accent';
  return (
    <div className="glass rounded-xl p-5">
      <p className="text-dim text-xs font-mono uppercase tracking-wider mb-2">{label}</p>
      <p className={`font-display text-2xl font-bold ${c}`}>{value}</p>
      {sub && <p className="text-dim text-xs mt-1">{sub}</p>}
    </div>
  );
}

export function Select({ label, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-dim text-xs font-mono uppercase tracking-wider">{label}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-surface border border-border text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors cursor-pointer"
      >
        {options.map(o => (
          <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
            {typeof o === 'string' ? o : o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
    </div>
  );
}

export function CompanyCard({ company }) {
  const isUp = company.predicted?.startsWith('+');
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-5 hover:border-accent/30 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-display font-semibold text-white">{company.name}</h4>
          <span className="font-mono text-xs text-muted">{company.ticker}</span>
        </div>
        <span className={`font-mono text-sm font-bold ${isUp ? 'text-green' : 'text-red-400'}`}>
          {company.predicted}
        </span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full border ${
          company.relation === 'Direct'
            ? 'text-accent border-accent/30 bg-accent/10'
            : 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
        }`}>
          {company.relation}
        </span>
        <span className="text-dim text-xs">Historical: <span className="text-green">{company.historical}</span></span>
      </div>
      <p className="text-dim text-xs leading-relaxed">{company.reason}</p>
    </motion.div>
  );
}

export function SectorRow({ sector, index }) {
  const isUp = sector.direction === 'up';
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
    >
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${isUp ? 'bg-green' : 'bg-red-400'}`} />
        <span className="text-white text-sm font-medium">{sector.name}</span>
      </div>
      <span className={`font-mono text-sm font-bold ${isUp ? 'text-green' : 'text-red-400'}`}>
        {sector.change}
      </span>
    </motion.div>
  );
}
