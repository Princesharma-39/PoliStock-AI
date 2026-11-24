
from flask import Flask, jsonify, request
from flask_cors import CORS

from market_data import fetch_market_data
from news_data import fetch_company_news
from sentiment_analysis import analyze_news_list
from election_event_study import list_events, analyze_event

from data import (
    ELECTION_DATA,
    COMPANIES,
    HISTORICAL_TRENDS,
    PREDICTION_RULES,
    STATE_IMPACT,
    STATE_CAUTION,
    STATES,
)

app = Flask(__name__)
CORS(app)


# ---------------- HEALTH CHECK ----------------
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "PoliStock AI"
    })


# ---------------- STATES ----------------
@app.route("/api/states", methods=["GET"])
def get_states():
    return jsonify({
        "states": STATES
    })


# ---------------- ELECTION ANALYSIS ----------------
@app.route("/api/election-analysis", methods=["GET"])
def election_analysis():

    year = request.args.get("year", "2024").strip()
    party = request.args.get("party", "BJP").strip().upper()

    year_data = ELECTION_DATA.get(year)

    if not year_data:
        return jsonify({
            "error": f"No election data found for year {year}",
            "available_years": list(ELECTION_DATA.keys())
        }), 404

    party_data = year_data.get(party)

    # Historical mode
    if party_data:
        return jsonify({
            "year": year,
            "party": party,
            "sentiment": party_data.get("sentiment", "Neutral"),
            "sectors": party_data.get("sectors", []),
            "companies": party_data.get("companies", [])
        })

    # Prediction mode
    rule = PREDICTION_RULES.get(party)

    if not rule:
        return jsonify({
            "error": f"No prediction rule found for {party}",
            "available_parties": list(PREDICTION_RULES.keys())
        }), 404

    sectors = []

    for sector in rule.get("sectors", []):
        sectors.append({
            "name": sector,
            "change": "Projected",
            "direction": "up"
        })

    companies = []

    for company in rule.get("companies", []):
        companies.append({
            "name": company,
            "ticker": company.upper(),
            "relation": "Predicted",
            "reason": "Based on predefined policy-sector mapping",
            "historical": "N/A",
            "predicted": "Projected"
        })

    return jsonify({
        "year": year,
        "party": party,
        "sentiment": "Projected",
        "sectors": sectors,
        "companies": companies
    })


# ---------------- COMPANY ANALYSIS ----------------
@app.route("/api/company-analysis", methods=["GET"])
def company_analysis():

    query = request.args.get("q", "").lower().strip()

    if not query:
        return jsonify({
            "error": "Please provide a company name using ?q="
        }), 400

    matched = None

    for key, company in COMPANIES.items():

        company_name = company.get("name", "").lower()

        if (
            key.lower() in query
            or query in key.lower()
            or query in company_name
            or company_name in query
        ):
            matched = company
            break

    if not matched:

        matched = COMPANIES.get(
            "tata",
            list(COMPANIES.values())[0]
        )

        matched = {
            **matched,
            "note": (
                "Showing closest match. Try: "
                "adani, tata, lt, reliance, infosys, "
                "ntpc, tcs, siemens, abb, apollo, "
                "nestle, mazagon, bel, hal"
            )
        }

    return jsonify(matched)


# ---------------- HISTORICAL TRENDS ----------------
@app.route("/api/historical-trends", methods=["GET"])
def historical_trends():

    return jsonify({
        "trends": HISTORICAL_TRENDS
    })


# ---------------- DYNAMIC PREDICTION ----------------
@app.route("/api/prediction", methods=["GET"])
def prediction():

    party = request.args.get(
        "party", "BJP"
    ).strip().upper()

    state = request.args.get(
        "state", "National"
    ).strip()

    # 1. Validate party
    rule = PREDICTION_RULES.get(party)

    if not rule:
        return jsonify({
            "error": f"No prediction rule found for {party}",
            "available_parties": list(PREDICTION_RULES.keys())
        }), 404

    # 2. Fetch state data
    state_data = STATE_IMPACT.get(state)

    party_sectors = rule.get("sectors", [])
    party_companies = rule.get("companies", [])

    state_sectors = (
        state_data.get("top_sectors", [])
        if state_data else []
    )

    state_companies = (
        state_data.get("beneficiaries", [])
        if state_data else []
    )

    # 3. Combine party and state sectors
    combined_sectors = list(dict.fromkeys(
        state_sectors + party_sectors
    ))

    # 4. Combine companies
    combined_companies = list(dict.fromkeys(
        state_companies + party_companies
    ))

    # 5. State-specific explanation
    if state_data:

        state_note = (
            f"{state} has important economic sectors including "
            f"{', '.join(state_sectors)}. These are combined "
            f"with the selected party's policy-related sectors."
        )

        data_coverage = "State-specific data available"
        analysis_type = "Party + State Analysis"

    elif state == "National":

        state_note = (
            "National-level analysis based on the selected "
            "party's predefined sector profile."
        )

        data_coverage = "National-level data"
        analysis_type = "Party Analysis"

    else:

        state_note = (
            f"State-specific data for {state} is unavailable. "
            "Showing party-level analysis only."
        )

        data_coverage = "Limited state data"
        analysis_type = "Party Analysis"

    # 6. Combine party and state caution sectors
    party_avoid = rule.get("avoid", [])
    state_avoid = STATE_CAUTION.get(state, [])

    combined_avoid = list(dict.fromkeys(
        party_avoid + state_avoid
    ))

    # 7. Return results
    return jsonify({

        "party": party,
        "state": state,

        "signal": "Policy Impact Analysis",
        "confidence": "Not calculated",

        "analysis_type": analysis_type,
        "data_coverage": data_coverage,

        "sectors": combined_sectors,
        "companies": combined_companies,

        "party_sectors": party_sectors,
        "state_sectors": state_sectors,

        "beneficiaries": state_companies,
        "top_sectors": state_sectors,

        "avoid": combined_avoid,

        "party_avoid": party_avoid,
        "state_avoid": state_avoid,

        "reasoning": rule.get(
            "reasoning",
            "No reasoning available."
        ),

        "state_note": state_note,

        "source_note": (
            "Educational rule-based analysis using predefined "
            "party and state sector mappings. This is not a "
            "trained machine learning forecast or investment advice."
        )
    })


# ---------------- REAL MARKET DATA ----------------
@app.route("/api/market-data", methods=["GET"])
def market_data():

    company = request.args.get("company", "").strip()
    period = request.args.get("period", "6mo").strip()

    if not company:
        return jsonify({
            "error": "Please provide a company name."
        }), 400

    try:
        result = fetch_market_data(company, period)
        return jsonify(result)

    except ValueError as error:
        return jsonify({
            "error": str(error)
        }), 400

    except Exception as error:
        app.logger.exception("Market data request failed")
        return jsonify({
            "error": "Could not fetch market data.",
            "details": str(error)
        }), 502


# ---------------- COMPANY NEWS ----------------
@app.route("/api/company-news", methods=["GET"])
def company_news():

    company = request.args.get("company", "").strip()

    if not company:
        return jsonify({
            "error": "Please provide a company name."
        }), 400

    try:
        limit = int(request.args.get("limit", 10))

        if limit < 1 or limit > 20:
            return jsonify({
                "error": "Limit must be between 1 and 20."
            }), 400

        result = fetch_company_news(company, limit=limit)
        sentiment_result = analyze_news_list(result["news"])

        result["news"] = sentiment_result["news"]
        result["overall_sentiment"] = sentiment_result["overall_sentiment"]
        result["average_score"] = sentiment_result["average_score"]
        result["sentiment_counts"] = sentiment_result["sentiment_counts"]
        return jsonify(result)

    except ValueError as error:
        return jsonify({
            "error": str(error)
        }), 400

    except Exception as error:
        app.logger.exception("Company news request failed")

        return jsonify({
            "error": "Could not fetch company news.",
            "details": str(error)
        }), 502


# ---------------- HISTORICAL ELECTION EVENT STUDY ----------------
@app.route("/api/election-event-study/events", methods=["GET"])
def election_event_study_events():
    return jsonify({"events": list_events()})


@app.route("/api/election-event-study/analyze", methods=["GET"])
def election_event_study_analyze():
    event_id = request.args.get("event_id", "").strip()
    company = request.args.get("company", "").strip()
    window = request.args.get("window", "5").strip()

    if not event_id or not company:
        return jsonify({
            "error": "Please provide event_id and company query parameters."
        }), 400

    try:
        result = analyze_event(event_id, company, window)
        return jsonify(result)
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    except Exception:
        app.logger.exception("Election event study failed")
        return jsonify({
            "error": "Could not complete historical election event study."
        }), 502


# ---------------- GLOBAL ERROR HANDLER ----------------
@app.errorhandler(404)
def not_found(error):

    return jsonify({
        "error": "API endpoint not found"
    }), 404


@app.errorhandler(500)
def server_error(error):

    return jsonify({
        "error": "Internal server error"
    }), 500


# ---------------- RUN APP ----------------
if __name__ == "__main__":

    app.run(
        debug=True,
        host="0.0.0.0",
        port=5001
    )
