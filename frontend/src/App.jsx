import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CompanyAnalyzer from './pages/CompanyAnalyzer';
import HistoricalTrends from './pages/HistoricalTrends';
import Prediction from './pages/Prediction';

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/company" element={<CompanyAnalyzer />} />
          <Route path="/history" element={<HistoricalTrends />} />
          <Route path="/predict" element={<Prediction />} />
        </Routes>

        {/* Footer */}
        <footer className="border-t border-border py-8 px-6 text-center">
          <p className="text-muted text-xs font-mono">
            PoliStock AI — For educational purposes only. Not financial advice.
            <span className="mx-2">·</span>
            Mock data only
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
