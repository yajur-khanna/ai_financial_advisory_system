# 📌 Mini Datalign — Project Plan

## 🎯 Objective
Build a **mini advisor-matching system** that:
- Matches users to financial advisors  
- Ranks top advisors using structured scoring  
- Provides **clear explanations** for each match  
- Surfaces **risk / red flags**  

Goal: simulate a real-world **Datalign-style matching engine** with added transparency.

---

# 🧠 Core Concept
> Match → Rank → Explain → Warn

Instead of just recommending advisors, the system helps users **understand and trust** the recommendation.

---

# ⚙️ System Architecture
User Input (Profile)
↓
Data Normalization
↓
Eligibility Filtering
↓
Feature Scoring
↓
Ranking (Top K)
↓
Explanation Generator
↓
Risk Detection Layer
↓
Streamlit UI


---

# 📊 Data Design

## User Features
- age  
- income  
- net worth  
- liquid assets  
- state  
- risk tolerance  
- years to retirement  
- goals (multi-select)  
- preferred fee model  

## Advisor Features
- firm_name  
- state, zip  
- specialties  
- client_types  
- min_assets, max_assets  
- fee_model, fee_pct  
- years_experience  
- fiduciary  
- disciplinary_flag  
- num_disclosures  
- virtual_available  

---

# 🔍 Matching Engine

## Step 1: Eligibility Filtering
Remove advisors if:
- user assets < advisor min_assets  
- no overlap between goals & specialties  
- location mismatch (and no virtual option)  

---

## Step 2: Feature Scoring

Each advisor gets scores for:

- goal_match  
- location_score  
- asset_fit  
- fee_fit  
- trust_score  

---

## Step 3: Final Ranking

score =
0.35 * goal_match +
0.20 * location_score +
0.20 * asset_fit +
0.10 * fee_fit +
0.15 * trust_score


Top 3 advisors returned.

---

# 💡 Differentiation Features

## 1. Explainable Matching
Generate human-readable reasons:

Example:
- Strong alignment with retirement goals  
- Located in your state  
- Fits your asset range  

Also show minor concerns:
- Higher-than-average fees  
- Some disclosures  

---

## 2. Risk / Red-Flag Detection

Highlight:
- disciplinary history  
- number of disclosures  
- high fees  
- low experience  
- non-fiduciary status  

Goal: **make trust visible**

---

# 🖥️ UI Design (Streamlit)

## Sidebar
- user inputs  

## Main Output
For each advisor:
- firm name  
- match score  
- confidence level  
- why it matches  
- concerns  
- risk flags  
- key attributes  

---

# 📁 Code Structure

mini-datalign/
├── data/
│ └── advisors.csv
├── src/
│ ├── load_data.py
│ ├── filters.py
│ ├── scoring.py
│ ├── explain.py
│ ├── risk.py
│ └── match_engine.py
├── app.py
├── requirements.txt
└── plan.md


---

# ⏱️ Execution Plan (2 Days)

## Day 1 — Core Engine

### Morning
- create advisor dataset  
- define user schema  
- implement filtering  

### Afternoon
- build scoring functions  
- implement ranking  
- test outputs  

### Night
- add explanation generator  
- add risk detection  

---

## Day 2 — UI + Polish

### Morning
- build Streamlit UI  
- connect match engine  

### Afternoon
- display explanations + risks  
- add score + confidence  

### Night
- polish UI  
- clean code  
- write README  

---

# 📈 Success Criteria

Project is complete if:
- returns top 3 advisors  
- each has:
  - score  
  - explanation  
  - risk flags  
- UI is functional  
- code is modular  

---

# 🚀 Resume Line

Built an explainable advisor-matching system using rule-based ranking and risk-aware filtering, delivering transparent financial recommendations.

---

# 🔮 Future Improvements

- ML-based ranking (XGBoost)  
- embeddings for goal matching  
- real SEC dataset  
- user feedback loop  
- what-if simulator  

---

# 🧠 Key Takeaways

- recommendation systems  
- feature engineering  
- explainable AI  
- product thinking  
- trust-aware systems  

---