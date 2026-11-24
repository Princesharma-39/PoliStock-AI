import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { fetchElectionAnalysis } from '../hooks/useApi';
import {
  Card, SectionTitle, SentimentBadge, Select,
  LoadingSpinner, CompanyCard, SectorRow
} from '../components/ui';

const STATES = [
'National',
'Andhra Pradesh',
'Arunachal Pradesh',
'Assam',
'Bihar',
'Chhattisgarh',
'Delhi',
'Goa',
'Gujarat',
'Haryana',
'Himachal Pradesh',
'Jharkhand',
'Karnataka',
'Kerala',
'Madhya Pradesh',
'Maharashtra',
'Manipur',
'Meghalaya',
'Mizoram',
'Nagaland',
'Odisha',
'Punjab',
'Rajasthan',
'Sikkim',
'Tamil Nadu',
'Telangana',
'Tripura',
'Uttar Pradesh',
'Uttarakhand',
'West Bengal'
];

const YEARS = [
'1952',
'1977',
'1984',
'1989',
'1991',
'1998',
'1999',
'2004',
'2009',
'2014',
'2019',
'2024'
];

const PARTIES = [
'BJP',
'INC',
'AAP',
'SP',
'BSP',
'INLD',
'HUNG',
'JP'
];

export default function Dashboard() {
  const [state, setState] = useState('National');
  const [year, setYear] = useState('2024');
  const [party, setParty] = useState('BJP');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    try {
      const data = await fetchElectionAnalysis(year, party);
      setResult(data);
    } catch {
      alert('Could not connect to backend. Make sure Flask is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <SectionTitle
            label="Election Dashboard"
            title="Market Impact Analysis"
            subtitle="Select parameters and analyze how election outcomes reshape stock markets."
          />
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
              <Select label="State / Region" options={STATES} value={state} onChange={setState} />
              <Select label="Election Year" options={YEARS} value={year} onChange={setYear} />
              <Select label="Political Party" options={PARTIES} value={party} onChange={setParty} />
            </div>
            <button
              onClick={analyze}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 transition-all disabled:opacity-50"
            >
              <Search size={16} />
              {loading ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </Card>
        </motion.div>

        {loading && <LoadingSpinner />}

        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Sentiment */}
            <div className="flex items-center gap-4 glass rounded-2xl p-6">
              <div>
                <p className="text-dim text-xs font-mono uppercase tracking-wider mb-2">Market Sentiment</p>
                <SentimentBadge sentiment={result.sentiment} />
              </div>
              <div className="w-px h-12 bg-border mx-2" />
              <div>
                <p className="text-dim text-xs font-mono uppercase tracking-wider mb-2">Election</p>
                <p className="font-display font-bold text-white">{result.year} General Election</p>
              </div>
              <div className="w-px h-12 bg-border mx-2" />
              <div>
                <p className="text-dim text-xs font-mono uppercase tracking-wider mb-2">Party</p>
                <p className="font-display font-bold text-white">{result.party}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sectors */}
              <Card>
                <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full" />
                  Predicted Winning Sectors
                </h3>
                {result.sectors?.map((s, i) => <SectorRow key={s.name} sector={s} index={i} />)}
              </Card>

              {/* Quick stats */}
              <Card>
                <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green rounded-full" />
                  Key Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-border/50">
                    <span className="text-dim text-sm">Top Sector Gain</span>
                    <span className="text-green font-mono font-bold">
                      {result.sectors.filter(s => s.direction === 'up').sort((a,b) =>
                        parseFloat(b.change) - parseFloat(a.change))[0]?.change || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border/50">
                    <span className="text-dim text-sm">Bullish Sectors</span>
                    <span className="text-white font-mono font-bold">
                      {result.sectors.filter(s => s.direction === 'up').length} / {result.sectors.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border/50">
                    <span className="text-dim text-sm">Companies Flagged</span>
                    <span className="text-white font-mono font-bold">{result.companies.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-dim text-sm">Overall Signal</span>
                    <SentimentBadge sentiment={result.sentiment} />
                  </div>
                </div>
              </Card>
            </div>

            {/* Companies */}
            <div>
              <h3 className="font-display font-bold text-white text-xl mb-6">
                Top Impacted Companies

              </h3>
              <p className="text-dim mb-4">
Showing companies most likely to be impacted
by <span className="text-white font-semibold">
{result.party}
</span> policies in the{" "}
<span className="text-white font-semibold">
{result.year}
</span> election cycle.
</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {result.companies?.map(c => <CompanyCard key={c.name} company={c} />)}
              </div>
            </div>
          </motion.div>
        )}

        {!result && !loading && (
          <div className="text-center py-20 text-dim">
            <p className="text-lg">Select parameters above and click <strong className="text-white">Run Analysis</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}
