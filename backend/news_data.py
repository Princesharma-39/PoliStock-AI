
import feedparser
from urllib.parse import quote
from datetime import datetime, timezone

COMPANY_NAMES = {
    "maruti": "Maruti Suzuki India",
    "reliance": "Reliance Industries",
    "infosys": "Infosys",
    "tcs": "Tata Consultancy Services",
    "adani": "Adani Group",
    "tata": "Tata Motors",
    "mahindra": "Mahindra and Mahindra",
    "sbi": "State Bank of India",
    "hdfc": "HDFC Bank",
    "ntpc": "NTPC",
    "itc": "ITC Limited",
    "hul": "Hindustan Unilever",
    "sunpharma": "Sun Pharma",
    "rvnl": "RVNL",
    "irctc": "IRCTC",
    "tatapower": "Tata Power",
    "bel": "Bharat Electronics",
    "hal": "Hindustan Aeronautics",
    "siemens": "Siemens India",
    "abb": "ABB India",
    "lt": "Larsen and Toubro",
}


def fetch_company_news(company, limit=10):
    key = company.strip().lower()

    if key not in COMPANY_NAMES:
        raise ValueError(f"Company '{company}' is not supported yet.")

    company_name = COMPANY_NAMES[key]

    query = quote(company_name)
    url = (
        "https://news.google.com/rss/search"
        f"?q={query}&hl=en-IN&gl=IN&ceid=IN:en"
    )

    feed = feedparser.parse(url)

    if feed.bozo and not feed.entries:
        raise Exception("Unable to fetch company news right now.")

    articles = []

    for entry in feed.entries[:limit]:
        published = entry.get("published", "")

        articles.append({
            "title": entry.get("title", "No title"),
            "publisher": entry.get("source", {}).get("title", "Google News"),
            "published": published,
            "link": entry.get("link", ""),
            "summary": entry.get("summary", ""),
        })

    return {
        "company": company_name,
        "total_news": len(articles),
        "news": articles,
        "source": "Google News RSS",
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "disclaimer": "News headlines are for educational purposes only."
    }
