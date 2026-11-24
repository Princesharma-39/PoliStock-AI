import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, BarChart2, Shield, Zap } from 'lucide-react';

function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const lines = Array.from({ length: 6 }, (_, i) => ({
      points: Array.from({ length: 80 }, (_, j) => ({
        x: (j / 79) * w,
        y: h * 0.3 + i * 60 + Math.sin(j * 0.2 + i) * 40,
      })),
      offset: Math.random() * Math.PI * 2,
      speed: 0.004 + Math.random() * 0.003,
      color: i % 2 === 0 ? '59,130,246' : '16,185,129',
    }));

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      lines.forEach(line => {
        ctx.beginPath();
        line.points.forEach((p, j) => {
          const y = p.y + Math.sin(j * 0.15 + line.offset + t * line.speed) * 25;
          j === 0 ? ctx.moveTo(p.x, y) : ctx.lineTo(p.x, y);
        });
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, `rgba(${line.color},0)`);
        grad.addColorStop(0.3, `rgba(${line.color},0.15)`);
        grad.addColorStop(0.7, `rgba(${line.color},0.15)`);
        grad.addColorStop(1, `rgba(${line.color},0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-60" />;
}

const features = [
  { icon: <TrendingUp size={18} />, label: 'Market Sentiment', desc: 'Bullish/Bearish signals per election outcome' },
  { icon: <BarChart2 size={18} />, label: 'Sector Prediction', desc: 'Identify winning sectors before results' },
  { icon: <Shield size={18} />, label: 'Company Analysis', desc: 'Political relation & stock impact history' },
  { icon: <Zap size={18} />, label: 'Historical Trends', desc: 'Election vs market data since 2004' },
];

const stats = [
  { val: '4+', label: 'Elections Analysed' },
  { val: '50+', label: 'Companies Tracked' },
  { val: '6', label: 'Key Sectors' },
  { val: '20yr', label: 'Historical Data' },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden grid-bg">
      <AnimatedBackground />

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-green/6 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-36 pb-24">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <span className="glass px-4 py-2 rounded-full text-xs font-mono text-accent border border-accent/20 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green rounded-full animate-pulse" />
            AI-Powered Election Market Intelligence
          </span>
        </motion.div>

        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="font-display text-5xl md:text-7xl font-extrabold text-white leading-tight">
            Predict Stock Trends
            <br />
            <span className="text-gradient">Through Elections</span>
          </h1>
          <p className="mt-6 text-dim text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Analyze how political changes influence companies and market sectors.
            Data-driven insights for every Indian election cycle.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-10"
        >
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 transition-all hover:scale-105 active:scale-100"
          >
            Analyze Election <ArrowRight size={18} />
          </Link>
          <Link
            to="/company"
            className="flex items-center justify-center gap-2 px-8 py-4 glass text-white font-semibold rounded-xl hover:border-accent/30 transition-all"
          >
            Explore Companies
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-3xl mx-auto"
        >
          {stats.map(({ val, label }) => (
            <div key={label} className="text-center">
              <div className="font-display text-3xl font-bold text-gradient">{val}</div>
              <div className="text-dim text-sm mt-1">{label}</div>
            </div>
          ))}
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16"
        >
          {features.map(({ icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="glass rounded-2xl p-5 hover:border-accent/30 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4 group-hover:bg-accent/20 transition-colors">
                {icon}
              </div>
              <h3 className="font-display font-semibold text-white text-sm mb-1">{label}</h3>
              <p className="text-dim text-xs leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
