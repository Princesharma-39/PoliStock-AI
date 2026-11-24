
import yfinance as yf

COMPANY_TICKERS = {
    "adani": "ADANIPORTS.NS",
    "tata": "TATAMOTORS.NS",
    "lt": "LT.NS",
    "reliance": "RELIANCE.NS",
    "sbi": "SBIN.NS",
    "hal": "HAL.NS",
    "bel": "BEL.NS",
    "hdfc": "HDFCBANK.NS",
    "mahindra": "M&M.NS",
    "maruti": "MARUTI.NS",
    "infosys": "INFY.NS",
    "tcs": "TCS.NS",
    "ntpc": "NTPC.NS",
    "itc": "ITC.NS",
    "hul": "HINDUNILVR.NS",
    "dabur": "DABUR.NS",
    "sunpharma": "SUNPHARMA.NS",
    "rvnl": "RVNL.NS",
    "irctc": "IRCTC.NS",
    "tatapower": "TATAPOWER.NS",
    "siemens": "SIEMENS.NS",
    "abb": "ABB.NS",
}

ALIASES = {
    "mahindra & mahindra": "mahindra",
    "m&m": "mahindra",
    "sun pharma": "sunpharma",
    "tata power": "tatapower",
    "hindustan unilever": "hul",
}

ALLOWED_PERIODS = {"1mo", "3mo", "6mo", "1y", "2y", "5y"}


def fetch_market_data(company, period="6mo"):
    if period not in ALLOWED_PERIODS:
        raise ValueError(
            f"Invalid period. Choose from: {', '.join(sorted(ALLOWED_PERIODS))}"
        )

    name = company.strip().lower()
    name = ALIASES.get(name, name)

    ticker = COMPANY_TICKERS.get(name)

    if not ticker:
        raise ValueError(f"Company '{company}' is not supported yet.")

    stock = yf.Ticker(ticker)
    history = stock.history(
        period=period,
        interval="1d",
        auto_adjust=True
    )

    if history.empty:
        raise ValueError(
            f"No market data available for {company} ({ticker})."
        )

    history = history.dropna(subset=["Close"])

    latest = history.iloc[-1]
    previous = history.iloc[-2] if len(history) > 1 else latest

    latest_close = float(latest["Close"])
    previous_close = float(previous["Close"])

    change = latest_close - previous_close
    change_percent = (
        (change / previous_close) * 100
        if previous_close else 0
    )

    chart_data = []

    for date, row in history.iterrows():
        chart_data.append({
            "date": date.strftime("%Y-%m-%d"),
            "close": round(float(row["Close"]), 2),
            "volume": int(row["Volume"])
        })

    return {
        "company": company,
        "ticker": ticker,
        "period": period,
        "latest_price": round(latest_close, 2),
        "previous_close": round(previous_close, 2),
        "change": round(change, 2),
        "change_percent": round(change_percent, 2),
        "latest_date": history.index[-1].strftime("%Y-%m-%d"),
        "history": chart_data,
        "source": "Yahoo Finance via yfinance",
        "disclaimer": "Market data may be delayed. For educational purposes only."
    }
