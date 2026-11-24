"""Historical election event study using adjusted daily prices from Yahoo Finance.

This module measures historical association, not election causality or a future forecast.
"""
from datetime import datetime, timedelta

import pandas as pd
import yfinance as yf

from market_data import COMPANY_TICKERS, ALIASES

BENCHMARK_TICKER = "^NSEI"

ELECTION_EVENTS = {
    "lok-sabha-2014": {
        "name": "2014 Lok Sabha election",
        "date": "2014-05-16",
        "type": "Lok Sabha",
        "note": "General election result day"
    },
    "lok-sabha-2019": {
        "name": "2019 Lok Sabha election",
        "date": "2019-05-23",
        "type": "Lok Sabha",
        "note": "General election result day"
    },
    "lok-sabha-2024": {
        "name": "2024 Lok Sabha election",
        "date": "2024-06-04",
        "type": "Lok Sabha",
        "note": "General election result day"
    }
}

ALLOWED_WINDOWS = {3, 5, 10}


def list_events():
    """Return supported event metadata for the API."""
    return [
        {"id": event_id, **event}
        for event_id, event in ELECTION_EVENTS.items()
    ]


def _clean_history(ticker, start, end):
    history = yf.Ticker(ticker).history(
        start=start,
        end=end,
        interval="1d",
        auto_adjust=True
    )
    if history.empty or "Close" not in history:
        raise ValueError(f"No historical price data returned for {ticker}.")

    close = history["Close"]
    if isinstance(close, pd.DataFrame):
        close = close.iloc[:, 0]

    close = close.dropna().astype(float)
    index = pd.to_datetime(close.index)
    if getattr(index, "tz", None) is not None:
        index = index.tz_localize(None)
    close.index = index.normalize()
    return close[~close.index.duplicated(keep="last")].sort_index()


def analyze_event(event_id, company, window=5):
    """Compare a company's daily returns with NIFTY 50 around an election."""
    if event_id not in ELECTION_EVENTS:
        raise ValueError(
            "Unsupported event_id. Choose from: "
            + ", ".join(ELECTION_EVENTS.keys())
        )

    try:
        window = int(window)
    except (TypeError, ValueError):
        raise ValueError("window must be 3, 5, or 10 trading days.")

    if window not in ALLOWED_WINDOWS:
        raise ValueError("window must be 3, 5, or 10 trading days.")

    company_key = str(company).strip().lower()
    company_key = ALIASES.get(company_key, company_key)
    ticker = COMPANY_TICKERS.get(company_key)
    if not ticker:
        raise ValueError(
            f"Unsupported company '{company}'. Supported keys: "
            + ", ".join(sorted(COMPANY_TICKERS.keys()))
        )

    event = ELECTION_EVENTS[event_id]
    event_date = datetime.strptime(event["date"], "%Y-%m-%d").date()
    start = event_date - timedelta(days=45)
    end = event_date + timedelta(days=45)

    try:
        stock_close = _clean_history(ticker, start, end)
        benchmark_close = _clean_history(BENCHMARK_TICKER, start, end)
    except Exception as exc:
        raise ValueError(f"Could not retrieve market history: {exc}")

    prices = pd.concat(
        [stock_close.rename("stock"), benchmark_close.rename("benchmark")],
        axis=1,
        join="inner"
    ).dropna().sort_index()

    if prices.empty:
        raise ValueError("No overlapping stock and NIFTY 50 trading dates.")

    event_timestamp = pd.Timestamp(event_date)
    eligible = prices.index[prices.index >= event_timestamp]
    if len(eligible) == 0:
        raise ValueError("No trading session found on or after the election date.")

    anchor_date = eligible[0]
    anchor_position = prices.index.get_loc(anchor_date)

    if anchor_position < window:
        raise ValueError("Insufficient trading history before this event.")
    if anchor_position + window >= len(prices.index):
        raise ValueError(
            "Insufficient post-election trading history for this event window."
        )

    returns = prices.pct_change() * 100
    returns["abnormal_return"] = returns["stock"] - returns["benchmark"]

    selected_dates = prices.index[
        anchor_position - window: anchor_position + window + 1
    ]
    rows = []
    for index, date in enumerate(selected_dates):
        row = returns.loc[date]
        relative_day = index - window
        rows.append({
            "date": date.strftime("%Y-%m-%d"),
            "event_day": relative_day,
            "stock_return_pct": round(float(row["stock"]), 4)
                if pd.notna(row["stock"]) else None,
            "benchmark_return_pct": round(float(row["benchmark"]), 4)
                if pd.notna(row["benchmark"]) else None,
            "abnormal_return_pct": round(float(row["abnormal_return"]), 4)
                if pd.notna(row["abnormal_return"]) else None
        })

    window_returns = returns.loc[selected_dates]
    valid_abnormal = window_returns["abnormal_return"].dropna()
    car = float(valid_abnormal.sum()) if not valid_abnormal.empty else None

    pre_dates = prices.index[anchor_position - window:anchor_position]
    post_dates = prices.index[anchor_position:anchor_position + window + 1]

    def cumulative_return(series, dates):
        values = series.loc[dates].dropna()
        if values.empty:
            return None
        return round(((1 + values / 100).prod() - 1) * 100, 4)

    stock_pre = cumulative_return(returns["stock"], pre_dates)
    stock_post = cumulative_return(returns["stock"], post_dates)
    benchmark_pre = cumulative_return(returns["benchmark"], pre_dates)
    benchmark_post = cumulative_return(returns["benchmark"], post_dates)

    return {
        "event": {
            "id": event_id,
            "name": event["name"],
            "scheduled_result_date": event["date"],
            "matched_trading_date": anchor_date.strftime("%Y-%m-%d"),
            "type": event["type"],
            "note": event["note"]
        },
        "company": {
            "key": company_key,
            "ticker": ticker
        },
        "benchmark": {
            "name": "NIFTY 50",
            "ticker": BENCHMARK_TICKER
        },
        "window_trading_days": window,
        "summary": {
            "stock_return_pre_pct": stock_pre,
            "benchmark_return_pre_pct": benchmark_pre,
            "stock_return_post_pct": stock_post,
            "benchmark_return_post_pct": benchmark_post,
            "cumulative_abnormal_return_pct_points": round(car, 4)
                if car is not None else None
        },
        "daily_returns": rows,
        "methodology": (
            "Daily adjusted-close returns are compared with NIFTY 50. "
            "Abnormal return = stock daily return minus benchmark daily return; "
            "CAR is the sum of abnormal returns over the selected event window. "
            "Pre window covers trading days -N to -1; post window covers day 0 to +N."
        ),
        "limitations": [
            "This is a historical association, not proof that the election caused the return.",
            "The event sample is small and does not control for company news or macroeconomic events.",
            "Yahoo Finance data availability and adjustments may change.",
            "Historical event results are not a forecast of future stock performance."
        ],
        "source": "Yahoo Finance via yfinance"
    }
