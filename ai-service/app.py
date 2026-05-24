"""
AI Service – Flask + scikit-learn
Endpoints:
  POST /predict/expenses    → Linear Regression expense forecast
  POST /predict/insights    → Isolation Forest anomaly detection + savings recommendations
  POST /predict/personality → K-Means financial personality clustering
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import IsolationForest
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)  # Allow requests from the Node.js backend

# ─────────────────────────────────────────────────────────────
#  Helper – convert incoming JSON transactions to a DataFrame
# ─────────────────────────────────────────────────────────────
def to_df(transactions):
    """
    Convert the list of transaction dicts from the request into a
    clean pandas DataFrame with proper dtypes.
    """
    df = pd.DataFrame(transactions)
    if df.empty:
        return df
    df['date']   = pd.to_datetime(df['date'])
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
    df['month']  = df['date'].dt.to_period('M')
    return df


# ─────────────────────────────────────────────────────────────
#  1. Expense Prediction  (Linear Regression)
# ─────────────────────────────────────────────────────────────
@app.route('/predict/expenses', methods=['POST'])
def predict_expenses():
    """
    Uses Linear Regression on monthly expense totals to predict
    the next month's spending.
    """
    data  = request.get_json()
    txns  = data.get('transactions', [])
    df    = to_df(txns)

    if df.empty or 'type' not in df.columns:
        return jsonify({'nextMonth': 0, 'avgMonthly': 0, 'trend': 'stable', 'trendPct': 0})

    # Filter to expenses only and group by month
    expenses = df[df['type'] == 'expense'].copy()
    if expenses.empty:
        return jsonify({'nextMonth': 0, 'avgMonthly': 0, 'trend': 'stable', 'trendPct': 0})

    monthly = (
        expenses.groupby('month')['amount']
        .sum()
        .reset_index()
        .sort_values('month')
    )

    avg_monthly = float(monthly['amount'].mean())

    # Need at least 2 months of data for regression
    if len(monthly) < 2:
        return jsonify({
            'nextMonth':   round(avg_monthly, 2),
            'avgMonthly':  round(avg_monthly, 2),
            'trend':       'stable',
            'trendPct':    0,
        })

    # X = month index (0, 1, 2, …), y = total expenses that month
    X = np.arange(len(monthly)).reshape(-1, 1)
    y = monthly['amount'].values

    model = LinearRegression()
    model.fit(X, y)

    # Predict the NEXT month (index = len(monthly))
    next_idx   = np.array([[len(monthly)]])
    next_month = float(model.predict(next_idx)[0])
    this_month = float(monthly['amount'].iloc[-1])

    trend_pct  = ((next_month - this_month) / this_month * 100) if this_month else 0
    trend      = 'up' if trend_pct > 2 else ('down' if trend_pct < -2 else 'stable')

    return jsonify({
        'nextMonth':  round(max(next_month, 0), 2),
        'avgMonthly': round(avg_monthly, 2),
        'trend':      trend,
        'trendPct':   round(abs(trend_pct), 1),
    })


# ─────────────────────────────────────────────────────────────
#  2. Insights: Anomaly Detection + Recommendations
# ─────────────────────────────────────────────────────────────
@app.route('/predict/insights', methods=['POST'])
def predict_insights():
    """
    Uses Isolation Forest to flag transactions that are statistical
    outliers (unusually large for their category).
    Also generates rule-based personalized savings recommendations.
    """
    data = request.get_json()
    txns = data.get('transactions', [])
    df   = to_df(txns)

    anomalies       = []
    recommendations = []

    if not df.empty and 'type' in df.columns:
        expenses = df[df['type'] == 'expense'].copy()

        # ── Anomaly Detection ──────────────────────────────────
        if len(expenses) >= 5:
            # Use amount + day-of-month as features for Isolation Forest
            features = expenses[['amount']].copy()
            features['day'] = expenses['date'].dt.day

            scaler  = StandardScaler()
            X_scaled = scaler.fit_transform(features)

            iso = IsolationForest(contamination=0.1, random_state=42)
            expenses = expenses.copy()
            expenses['anomaly'] = iso.fit_predict(X_scaled)

            # anomaly == -1 means outlier
            flagged = expenses[expenses['anomaly'] == -1].copy()

            # Calculate how far above category average each flagged txn is
            cat_avg = expenses.groupby('category')['amount'].mean().to_dict()
            for _, row in flagged.iterrows():
                avg = cat_avg.get(row['category'], row['amount'])
                pct_above = ((row['amount'] - avg) / avg * 100) if avg else 0
                anomalies.append({
                    'description': row['description'],
                    'amount':      round(float(row['amount']), 2),
                    'date':        str(row['date'].date()),
                    'category':    row['category'],
                    'pctAboveAvg': round(float(pct_above), 1),
                })

        # ── Recommendations ────────────────────────────────────
        if not expenses.empty:
            cat_totals = expenses.groupby('category')['amount'].sum().to_dict()
            total_exp  = expenses['amount'].sum()

            # Rule 1: Food spending > 30% of total
            food_total = cat_totals.get('Food', 0)
            if food_total / total_exp > 0.30 if total_exp else False:
                recommendations.append({
                    'icon':  '🍽️',
                    'title': 'Reduce dining out',
                    'detail': f'Food accounts for {food_total/total_exp*100:.0f}% of your expenses. Cooking at home 3x/week could help.',
                    'potentialSaving': round(food_total * 0.25, 2),
                })

            # Rule 2: Entertainment > $100/month average
            ent_monthly = cat_totals.get('Entertainment', 0) / max(len(df['month'].unique()), 1)
            if ent_monthly > 100:
                recommendations.append({
                    'icon':  '🎬',
                    'title': 'Audit your subscriptions',
                    'detail': f'You spend ~${ent_monthly:.0f}/month on entertainment. Cancel unused services.',
                    'potentialSaving': round(ent_monthly * 0.3, 2),
                })

            # Rule 3: Shopping > 20% of total
            shop_total = cat_totals.get('Shopping', 0)
            if shop_total / total_exp > 0.20 if total_exp else False:
                recommendations.append({
                    'icon':  '🛒',
                    'title': 'Apply the 24-hour rule',
                    'detail': 'Before any non-essential purchase, wait 24 hours to decide if you really need it.',
                    'potentialSaving': round(shop_total * 0.2, 2),
                })

            # Rule 4: No income recorded
            income_total = df[df['type'] == 'income']['amount'].sum() if 'type' in df.columns else 0
            if income_total == 0:
                recommendations.append({
                    'icon':  '💰',
                    'title': 'Track your income too',
                    'detail': 'Add your salary and other income sources to get an accurate savings ratio.',
                    'potentialSaving': None,
                })

            # Rule 5: Generic savings tip
            recommendations.append({
                'icon':  '📊',
                'title': 'Follow the 50/30/20 rule',
                'detail': '50% needs, 30% wants, 20% savings. Adjust your budget to hit these targets.',
                'potentialSaving': None,
            })

    return jsonify({'anomalies': anomalies[:5], 'recommendations': recommendations})


# ─────────────────────────────────────────────────────────────
#  3. Financial Personality  (K-Means Clustering)
# ─────────────────────────────────────────────────────────────
PERSONALITIES = [
    'Conservative Spender',
    'Impulsive Buyer',
    'Balanced Saver',
    'Experience Seeker',
    'Necessity Focused',
]

@app.route('/predict/personality', methods=['POST'])
def predict_personality():
    """
    Uses K-Means clustering on spending ratios across categories
    to assign a financial personality type.
    """
    data  = request.get_json()
    txns  = data.get('transactions', [])
    df    = to_df(txns)

    # Default personality when insufficient data
    default = {
        'type':   'Balanced Saver',
        'scores': {'Savings': 0.5, 'Impulse': 0.3, 'Necessity': 0.2},
    }

    if df.empty or 'type' not in df.columns:
        return jsonify(default)

    expenses = df[df['type'] == 'expense']
    if expenses.empty:
        return jsonify(default)

    total = expenses['amount'].sum()
    if total == 0:
        return jsonify(default)

    # Build feature vector: spending ratio per category
    cats = ['Food','Housing','Transport','Entertainment','Health','Shopping','Utilities','Other']
    cat_ratios = {}
    for c in cats:
        cat_ratios[c] = expenses[expenses['category'] == c]['amount'].sum() / total

    # Derived personality scores (0–1 scale for display)
    savings_score  = max(0, 1 - (cat_ratios.get('Shopping',0) + cat_ratios.get('Entertainment',0)) * 2)
    impulse_score  = cat_ratios.get('Shopping',0) + cat_ratios.get('Entertainment',0) * 0.5
    necessity_score = cat_ratios.get('Food',0) + cat_ratios.get('Housing',0) + cat_ratios.get('Utilities',0)

    # K-Means on the single user's feature vector (simulate cluster centers)
    # In production, this would be pre-trained on a dataset of many users.
    features = np.array([[
        cat_ratios.get('Food',0),
        cat_ratios.get('Housing',0),
        cat_ratios.get('Entertainment',0),
        cat_ratios.get('Shopping',0),
        cat_ratios.get('Transport',0),
    ]])

    # Pre-defined cluster centers representing each personality
    centers = np.array([
        [0.15, 0.35, 0.05, 0.05, 0.10],   # Conservative Spender
        [0.20, 0.25, 0.15, 0.25, 0.10],   # Impulsive Buyer
        [0.18, 0.30, 0.10, 0.12, 0.08],   # Balanced Saver
        [0.25, 0.20, 0.20, 0.10, 0.08],   # Experience Seeker
        [0.30, 0.35, 0.03, 0.04, 0.12],   # Necessity Focused
    ])

    # Find the closest cluster center by Euclidean distance
    distances  = np.linalg.norm(centers - features, axis=1)
    cluster_id = int(np.argmin(distances))
    personality = PERSONALITIES[cluster_id]

    return jsonify({
        'type': personality,
        'scores': {
            'Savings':   round(min(savings_score, 1.0), 2),
            'Impulse':   round(min(impulse_score, 1.0), 2),
            'Necessity': round(min(necessity_score, 1.0), 2),
        },
    })


# ─────────────────────────────────────────────────────────────
#  Health check
# ─────────────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'FinSight AI'})


if __name__ == '__main__':
    print('🤖  AI service running on http://localhost:8000')
    app.run(host='0.0.0.0', port=8000, debug=True)