
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Info,
  TrendingUp,
  TrendingDown,
  Newspaper,
  ExternalLink,
  Calendar,
  Activity
} from 'lucide-react';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import {
  fetchCompanyAnalysis,
  fetchMarketData,
  fetchCompanyNews
} from '../hooks/useApi';

import { Card, SectionTitle, LoadingSpinner } from '../components/ui';

const SUGGESTIONS = [
  'Maruti',
  'Reliance',
  'Infosys',
  'TCS',
  'Adani',
  'Tata',
  'L&T',
  'Mahindra'
];

const PERIODS = [
  { label: '1 Month', value: '1mo' },
  { label: '3 Months', value: '3mo' },
  { label: '6 Months', value: '6mo' },
  { label: '1 Year', value: '1y' },
  { label: '2 Years', value: '2y' },
  { label: '5 Years', value: '5y' }
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl px-4 py-3">
        <p className="text-dim text-xs mb-1">{label}</p>
        <p className="text-accent font-mono font-bold">
          ₹{Number(payload[0].value).toLocaleString('en-IN', {
            maximumFractionDigits: 2
          })}
        </p>
      </div>
    );
  }

  return null;
};

const sentimentStyle = (sentiment) => {
  if (sentiment === 'Positive') {
    return 'bg-green-500/10 text-green-400 border-green-500/20';
  }

  if (sentiment === 'Negative') {
    return 'bg-red-500/10 text-red-400 border-red-500/20';
  }

  return 'bg-gray-500/10 text-gray-300 border-gray-500/20';
};

export default function CompanyAnalyzer() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);

  const [marketData, setMarketData] = useState(null);
  const [marketError, setMarketError] = useState('');

  const [newsData, setNewsData] = useState(null);
  const [newsError, setNewsError] = useState('');

  const [period, setPeriod] = useState('6mo');
  const [loading, setLoading] = useState(false);

  const search = async (q = query, selectedPeriod = period) => {
    if (!q.trim() || loading) return;

    setLoading(true);

    setMarketError('');
    setNewsError('');

    setMarketData(null);
    setNewsData(null);
    setResult(null);

    try {
      const [
        companyResponse,
        marketResponse,
        newsResponse
      ] = await Promise.allSettled([
        fetchCompanyAnalysis(q),
        fetchMarketData(q, selectedPeriod),
        fetchCompanyNews(q)
      ]);

      // Political company analysis
      if (companyResponse.status === 'fulfilled') {
        const data = companyResponse.value;

        if (!data.error) {
          setResult(data);
        }
      }

      // Stock market data
      if (marketResponse.status === 'fulfilled') {
        setMarketData(marketResponse.value);
      } else {
        setMarketError(
          marketResponse.reason?.message ||
          'Could not fetch stock data.'
        );
      }

      // Company news and sentiment
      if (newsResponse.status === 'fulfilled') {
        setNewsData(newsResponse.value);
      } else {
        setNewsError(
          newsResponse.reason?.message ||
          'Could not fetch company news.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value) =>
    Number(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  const formatDate = (date) => {
    if (!date) return 'Date unavailable';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const sentimentCounts = newsData?.sentiment_counts || {
    positive: 0,
    negative: 0,
    neutral: 0
  };

  const totalSentiment =
    sentimentCounts.positive +
    sentimentCounts.negative +
    sentimentCounts.neutral;

  const sentimentItems = [
    {
      label: 'Positive',
      key: 'positive',
      color: 'bg-green-400',
      count: sentimentCounts.positive
    },
    {
      label: 'Negative',
      key: 'negative',
      color: 'bg-red-400',
      count: sentimentCounts.negative
    },
    {
      label: 'Neutral',
      key: 'neutral',
      color: 'bg-gray-400',
      count: sentimentCounts.neutral
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">

        {/* PAGE HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <SectionTitle
            label="Company Analyzer"
            title="Political Relation Scanner"
            subtitle="Explore political exposure, historical stock prices, latest company news and news sentiment."
          />
        </motion.div>

        {/* SEARCH SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && search()}
                placeholder="Search company (e.g. Maruti, Infosys, Reliance)..."
                className="w-full bg-surface border border-border text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-muted"
              />
            </div>

            <button
              onClick={() => search()}
              disabled={loading}
              className="px-6 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 transition-all disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Search'}
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mt-4 items-center">
            <span className="text-dim text-xs">Try:</span>

            {SUGGESTIONS.map((company) => (
              <button
                key={company}
                onClick={() => {
                  setQuery(company);
                  search(company);
                }}
                disabled={loading}
                className="text-xs text-accent hover:text-accent/80 underline underline-offset-2 disabled:opacity-50"
              >
                {company}
              </button>
            ))}
          </div>
        </motion.div>

        {loading && <LoadingSpinner />}

        {/* REAL STOCK MARKET DATA */}
        {marketData && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 mb-10"
          >
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">
                  Live Market Data
                </h2>

                <p className="text-dim text-sm mt-1">
                  {marketData.company} · {marketData.ticker}
                </p>
              </div>

              <select
                value={period}
                onChange={(e) => {
                  const selected = e.target.value;
                  setPeriod(selected);
                  search(query, selected);
                }}
                className="bg-surface border border-border text-white rounded-xl px-4 py-3 text-sm"
              >
                {PERIODS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <p className="text-dim text-sm">Latest Closing Price</p>

                <h3 className="text-2xl font-bold text-white mt-2">
                  ₹{formatPrice(marketData.latest_price)}
                </h3>

                <p className="text-muted text-xs mt-2">
                  Date: {marketData.latest_date}
                </p>
              </Card>

              <Card>
                <p className="text-dim text-sm">Previous Close</p>

                <h3 className="text-2xl font-bold text-white mt-2">
                  ₹{formatPrice(marketData.previous_close)}
                </h3>
              </Card>

              <Card>
                <p className="text-dim text-sm">Daily Change</p>

                <div className="flex items-center gap-2 mt-2">
                  {marketData.change >= 0 ? (
                    <TrendingUp className="text-green" size={22} />
                  ) : (
                    <TrendingDown className="text-red-400" size={22} />
                  )}

                  <h3
                    className={`text-2xl font-bold ${
                      marketData.change >= 0
                        ? 'text-green'
                        : 'text-red-400'
                    }`}
                  >
                    {marketData.change >= 0 ? '+' : ''}
                    ₹{formatPrice(marketData.change)}
                  </h3>
                </div>

                <p
                  className={`text-sm mt-2 ${
                    marketData.change_percent >= 0
                      ? 'text-green'
                      : 'text-red-400'
                  }`}
                >
                  {marketData.change_percent >= 0 ? '+' : ''}
                  {marketData.change_percent}%
                </p>
              </Card>
            </div>

            {/* HISTORICAL STOCK CHART */}
            <Card>
              <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
                <div>
                  <h3 className="font-display font-semibold text-white">
                    Historical Stock Price
                  </h3>

                  <p className="text-dim text-xs mt-1">
                    {marketData.ticker} · {period}
                  </p>
                </div>

                <span className="text-xs text-dim">
                  Source: Yahoo Finance
                </span>
              </div>

              <ResponsiveContainer width="100%" height={320}>
                <LineChart
                  data={marketData.history}
                  margin={{ top: 5, right: 15, bottom: 5, left: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e2d40"
                  />

                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#8ca0b8', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={35}
                  />

                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fill: '#8ca0b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={75}
                    tickFormatter={(value) => `₹${value}`}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>

              <p className="text-muted text-xs mt-4 text-center">
                {marketData.disclaimer}
              </p>
            </Card>
          </motion.div>
        )}

        {marketError && !loading && (
          <div className="glass border border-red-400/30 rounded-xl p-4 mb-8">
            <p className="text-red-400 font-semibold">
              Market data unavailable
            </p>

            <p className="text-dim text-sm mt-1">
              {marketError}
            </p>
          </div>
        )}

        {/* COMPANY NEWS AND SENTIMENT */}
        {newsData && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5 mb-10"
          >
            {/* NEWS HEADER */}
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                  <Newspaper size={23} className="text-accent" />
                  Latest Company News
                </h2>

                <p className="text-dim text-sm mt-1">
                  Recent news about {newsData.company}
                </p>
              </div>

              <span className="text-xs px-3 py-2 rounded-lg border border-accent/30 text-accent bg-accent/10">
                {newsData.total_news} Articles Found
              </span>
            </div>

            {/* SENTIMENT DASHBOARD */}
            <Card>
              <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity size={19} className="text-accent" />
                    <h3 className="text-white font-semibold text-lg">
                      News Sentiment Analysis
                    </h3>
                  </div>

                  <p className="text-dim text-xs mt-1">
                    AI-assisted analysis of news headlines using VADER
                  </p>
                </div>

                <span
                  className={`px-3 py-2 rounded-lg text-sm font-semibold border ${sentimentStyle(newsData.overall_sentiment)}`}
                >
                  {newsData.overall_sentiment || 'Neutral'} Sentiment
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* AVERAGE SCORE */}
                <div className="bg-surface rounded-xl p-5">
                  <p className="text-dim text-sm">
                    Average Sentiment Score
                  </p>

                  <p className="text-white text-3xl font-bold mt-3">
                    {Number(newsData.average_score || 0).toFixed(3)}
                  </p>

                  <div className="mt-4 h-2 rounded-full bg-border overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        Number(newsData.average_score || 0) >= 0
                          ? 'bg-green-400'
                          : 'bg-red-400'
                      }`}
                      style={{
                        width: `${Math.min(
                          Math.abs(Number(newsData.average_score || 0)),
                          1
                        ) * 100}%`
                      }}
                    />
                  </div>

                  <div className="flex justify-between mt-2 text-xs text-muted">
                    <span>-1 Negative</span>
                    <span>+1 Positive</span>
                  </div>
                </div>

                {/* SENTIMENT DISTRIBUTION */}
                <div className="bg-surface rounded-xl p-5">
                  <p className="text-dim text-sm mb-4">
                    Sentiment Distribution
                  </p>

                  {sentimentItems.map((item) => {
                    const percentage = totalSentiment > 0
                      ? (item.count / totalSentiment) * 100
                      : 0;

                    return (
                      <div key={item.key} className="mb-4 last:mb-0">
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-dim">
                            {item.label}
                          </span>

                          <span className="text-white font-semibold">
                            {item.count} ({percentage.toFixed(0)}%)
                          </span>
                        </div>

                        <div className="h-2 bg-border rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color} rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-muted text-xs mt-5">
                Sentiment is calculated from headlines and may not reflect
                the full context or actual impact of a news article.
              </p>
            </Card>

            {/* INDIVIDUAL NEWS CARDS */}
            {newsData.news?.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {newsData.news.map((article, index) => (
                  <Card key={`${article.link}-${index}`}>
                    <div className="flex flex-col h-full gap-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-accent">
                          {article.publisher || 'News Source'}
                        </span>

                        <span
                          className={`text-xs px-2 py-1 rounded-full border font-medium ${sentimentStyle(article.sentiment)}`}
                        >
                          {article.sentiment || 'Neutral'}
                        </span>
                      </div>

                      <h3 className="text-white font-semibold leading-relaxed">
                        {article.title}
                      </h3>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-muted flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(article.published)}
                        </span>

                        <span className="text-xs text-dim">
                          Score: {Number(article.score || 0).toFixed(3)}
                        </span>
                      </div>

                      {article.link && (
                        <div className="mt-auto pt-2">
                          <a
                            href={article.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-accent text-sm font-medium hover:underline"
                          >
                            Read Full Article
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <p className="text-dim text-sm">
                  No recent news articles were found for this company.
                </p>
              </Card>
            )}

            <p className="text-muted text-xs text-center">
              Source: {newsData.source}. Headlines are provided for educational purposes.
            </p>
          </motion.div>
        )}

        {newsError && !loading && (
          <div className="glass border border-red-400/30 rounded-xl p-4 mb-8">
            <p className="text-red-400 font-semibold">
              Company news unavailable
            </p>

            <p className="text-dim text-sm mt-1">
              {newsError}
            </p>
          </div>
        )}

        {/* POLITICAL COMPANY ANALYSIS */}
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass rounded-2xl p-6">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <h2 className="font-display text-2xl font-bold text-white">
                  {result.name}
                </h2>

                <span className="px-3 py-1 rounded-full text-xs font-medium border text-accent border-accent/30 bg-accent/10">
                  {result.relation} Political Relation
                </span>
              </div>

              <p className="text-dim leading-relaxed">
                {result.description}
              </p>

              {result.note && (
                <p className="text-yellow-400 text-xs mt-3 flex items-center gap-1">
                  <Info size={12} />
                  {result.note}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="font-display font-semibold text-white mb-3 flex items-center gap-2">
                  <TrendingUp size={16} className="text-green" />
                  Why It May Benefit
                </h3>

                <p className="text-dim text-sm leading-relaxed">
                  {result.why_benefit}
                </p>
              </Card>

              <Card>
                <h3 className="font-display font-semibold text-white mb-3">
                  Past Election Impact
                </h3>

                <p className="text-dim text-sm leading-relaxed">
                  {result.past_impact}
                </p>
              </Card>
            </div>
          </motion.div>
        )}

        {/* EMPTY STATE */}
        {!result &&
          !marketData &&
          !newsData &&
          !loading &&
          !marketError &&
          !newsError && (
            <div className="text-center py-20 text-dim">
              <p>
                Search a company above to see its political analysis,
                stock market data and latest news.
              </p>
            </div>
          )}

      </div>
    </div>
  );
}
