
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()


def analyze_sentiment(text):
    """
    Analyse a news headline and return its sentiment.
    """

    if not text or not text.strip():
        return {
            "sentiment": "Neutral",
            "score": 0.0,
            "positive": 0.0,
            "negative": 0.0,
            "neutral": 1.0
        }

    scores = analyzer.polarity_scores(text)
    compound = scores["compound"]

    if compound >= 0.05:
        label = "Positive"
    elif compound <= -0.05:
        label = "Negative"
    else:
        label = "Neutral"

    return {
        "sentiment": label,
        "score": round(compound, 3),
        "positive": round(scores["pos"], 3),
        "negative": round(scores["neg"], 3),
        "neutral": round(scores["neu"], 3)
    }


def analyze_news_list(news):
    """
    Analyse multiple news headlines and calculate
    the overall company sentiment.
    """

    analysed_news = []

    for article in news:
        title = article.get("title", "")
        result = analyze_sentiment(title)

        analysed_news.append({
            **article,
            **result
        })

    total = len(analysed_news)

    if total == 0:
        return {
            "news": [],
            "overall_sentiment": "Neutral",
            "average_score": 0.0,
            "sentiment_counts": {
                "positive": 0,
                "negative": 0,
                "neutral": 0
            }
        }

    counts = {
        "positive": sum(
            1 for item in analysed_news
            if item["sentiment"] == "Positive"
        ),
        "negative": sum(
            1 for item in analysed_news
            if item["sentiment"] == "Negative"
        ),
        "neutral": sum(
            1 for item in analysed_news
            if item["sentiment"] == "Neutral"
        )
    }

    average_score = sum(
        item["score"] for item in analysed_news
    ) / total

    if average_score >= 0.05:
        overall = "Positive"
    elif average_score <= -0.05:
        overall = "Negative"
    else:
        overall = "Neutral"

    return {
        "news": analysed_news,
        "overall_sentiment": overall,
        "average_score": round(average_score, 3),
        "sentiment_counts": counts
    }
