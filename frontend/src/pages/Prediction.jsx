
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  TrendingUp,
  Info,
  Shield,
  BarChart3,
  Building2,
  Layers,
  MapPin
} from 'lucide-react';

import { fetchPrediction } from '../hooks/useApi';
import {
  Card,
  SectionTitle,
  Select,
  LoadingSpinner
} from '../components/ui';

const PARTIES = [
  'BJP', 'INC', 'AAP', 'SP', 'BSP', 'INLD',
  'TMC', 'DMK', 'AIADMK', 'JDU', 'RJD', 'HUNG'
];

const STATES = [
  'National',
  'Andhra Pradesh',
  'Bihar',
  'Delhi',
  'Gujarat',
  'Haryana',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'West Bengal'
];

function TagList({ items, color = 'accent' }) {
  if (!items?.length) {
    return <p className="text-dim text-sm">No data available.</p>;
  }

  const styles = {
    accent: 'bg-accent/10 border-accent/20 text-accent',
    green: 'bg-green/10 border-green/20 text-green',
    red: 'bg-red-400/10 border-red-400/20 text-red-400'
  };

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={`px-3 py-2 rounded-lg border text-sm ${styles[color]}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default function Prediction() {
  const [party, setParty] = useState('BJP');
  const [state, setState] = useState('National');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const predict = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await fetchPrediction(party, state);

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (err) {
      setError(
        err.message || 'Could not connect to backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">

        <SectionTitle
          label="Policy Impact Engine"
          title="Election Market Outlook"
          subtitle="Explore how political policy priorities may relate to Indian market sectors and companies."
        />

        {/* Disclaimer */}
        <div className="flex items-start gap-3 glass-light rounded-xl px-5 py-4 mb-8 border border-yellow-400/10">
          <Info
            size={17}
            className="text-yellow-400 mt-0.5 shrink-0"
          />
          <p className="text-dim text-xs leading-relaxed">
            Educational rule-based analysis using predefined
            party and state mappings. Results are not actual
            stock forecasts, trained ML predictions or financial advice.
          </p>
        </div>

        {/* Selection controls */}
        <Card className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <Select
              label="Political Party"
              options={PARTIES}
              value={party}
              onChange={setParty}
            />

            <Select
              label="Select State"
              options={STATES}
              value={state}
              onChange={setState}
            />
          </div>

          <button
            onClick={predict}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-green text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
          >
            <Zap size={16} />
            {loading ? 'Analyzing...' : 'Generate Analysis'}
          </button>
        </Card>

        {loading && <LoadingSpinner />}

        {error && (
          <Card className="mb-6">
            <p className="text-red-400">{error}</p>
          </Card>
        )}

        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >

            {/* Overview cards */}
            <div className="grid md:grid-cols-3 gap-5">

              <Card glow>
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="text-green" />
                  <h3 className="font-semibold text-white">
                    Analysis Type
                  </h3>
                </div>
                <p className="text-xl font-bold text-green">
                  {result.analysis_type || 'Policy Impact'}
                </p>
              </Card>

              <Card glow>
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="text-accent" />
                  <h3 className="font-semibold text-white">
                    Confidence
                  </h3>
                </div>
                <p className="text-xl font-bold text-accent">
                  Not calculated
                </p>
                <p className="text-xs text-dim mt-2">
                  No validated confidence model available
                </p>
              </Card>

              <Card glow>
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="text-yellow-400" />
                  <h3 className="font-semibold text-white">
                    Selected Region
                  </h3>
                </div>
                <p className="text-xl font-bold text-white">
                  {result.state}
                </p>
                <p className="text-xs text-dim mt-2">
                  Party: {result.party}
                </p>
              </Card>

            </div>

            {/* Reasoning */}
            <Card>
              <h3 className="font-bold text-white mb-3">
                Policy Impact Reasoning
              </h3>

              <p className="text-dim leading-relaxed">
                {result.reasoning || 'No reasoning available.'}
              </p>

              <p className="text-accent text-sm mt-4">
                {result.state_note}
              </p>

              <div className="mt-5 pt-4 border-t border-white/10">
                <p className="text-xs text-dim">
                  Data coverage: {result.data_coverage || 'Not specified'}
                </p>
              </div>
            </Card>

            {/* Sector analysis */}
            <div className="grid md:grid-cols-2 gap-6">

              <Card glow>
                <div className="flex items-center gap-3 mb-4">
                  <Layers className="text-accent" />
                  <h3 className="font-bold text-white">
                    Party-Related Sectors
                  </h3>
                </div>
                <TagList items={result.party_sectors} />
              </Card>

              <Card glow>
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="text-green" />
                  <h3 className="font-bold text-white">
                    State-Related Sectors
                  </h3>
                </div>
                <TagList items={result.state_sectors} color="green" />
              </Card>

            </div>

            <Card>
              <h3 className="font-bold text-white mb-4">
                Combined Beneficiary Sectors
              </h3>
              <TagList items={result.sectors} color="green" />
            </Card>

            {/* Company analysis */}
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="text-accent" />
                <h3 className="font-bold text-white">
                  Companies to Watch
                </h3>
              </div>

              <p className="text-xs text-dim mb-4">
                Companies associated with the selected party
                and state's mapped sectors. Inclusion does not
                indicate guaranteed stock performance.
              </p>

              {result.companies?.length ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {result.companies.map((company) => (
                    <div
                      key={company}
                      className="glass-light rounded-lg px-4 py-3 text-white"
                    >
                      {company}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-dim text-sm">
                  No company data available.
                </p>
              )}
            </Card>

            {/* State beneficiaries */}
            <div className="grid md:grid-cols-2 gap-6">

              <Card glow>
                <h3 className="font-bold text-white mb-4">
                  State Beneficiaries
                </h3>
                <TagList items={result.beneficiaries} />
              </Card>

              <Card>
                <h3 className="font-bold text-white mb-4">
                  Top State Sectors
                </h3>
                <TagList items={result.top_sectors} color="green" />
              </Card>

            </div>

            {/* Avoid sectors */}
            <Card>
              <h3 className="font-bold text-red-400 mb-4">
                Sectors Requiring Caution
              </h3>
              <TagList items={result.avoid} color="red" />
            </Card>

            {/* Source note */}
            <div className="text-center text-xs text-dim pt-3">
              {result.source_note}
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}
