
const BASE = (
  import.meta.env.VITE_API_URL || '/api'
).replace(/\/+$/, '');

async function apiRequest(endpoint) {
  const response = await fetch(`${BASE}${endpoint}`);

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(`Invalid server response (${response.status})`);
  }

  if (!response.ok) {
    throw new Error(
      data.error || `Request failed with status ${response.status}`
    );
  }

  return data;
}

export async function fetchElectionAnalysis(year, party) {
  return apiRequest(
    `/election-analysis?year=${encodeURIComponent(year)}&party=${encodeURIComponent(party)}`
  );
}

export async function fetchCompanyAnalysis(query) {
  return apiRequest(
    `/company-analysis?q=${encodeURIComponent(query)}`
  );
}

export async function fetchHistoricalTrends() {
  return apiRequest('/historical-trends');
}

export async function fetchPrediction(party, state) {
  return apiRequest(
    `/prediction?party=${encodeURIComponent(party)}&state=${encodeURIComponent(state)}`
  );
}

export async function fetchMarketData(company, period = '6mo') {
  return apiRequest(
    `/market-data?company=${encodeURIComponent(company)}&period=${encodeURIComponent(period)}`
  );
}

export async function fetchCompanyNews(company, limit = 10) {
  return apiRequest(
    `/company-news?company=${encodeURIComponent(company)}&limit=${encodeURIComponent(limit)}`
  );
}
