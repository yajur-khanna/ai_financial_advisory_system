import os
import numpy as np
import pandas as pd

np.random.seed(42)

N = 5000

def normalize_probs(p):
    p = np.array(p, dtype=float)
    return p / p.sum()

# -----------------------------
# 1. Age bucket
# -----------------------------
age_bucket = np.random.choice(
    ["<30", "30-40", "40-50", "60+"],
    size=N,
    p=normalize_probs([0.22, 0.30, 0.28, 0.20])
)

# -----------------------------
# 2. Retirement goal horizon
# -----------------------------
retirement_goal = np.random.choice(
    ["<2 yrs", "2-5 yrs", "5-10 yrs", "10+ yrs"],
    size=N,
    p=normalize_probs([0.10, 0.18, 0.27, 0.45])
)

# -----------------------------
# 3. Desired advisor specialty
# -----------------------------
specialty_options = [
    "Tax Aware Investing",
    "Socially Conscious Investing",
    "Retirement Planning",
    "Estate Planning",
    "Management of New Wealth",
    "Tax Preparation",
    "Life Insurance",
    "Divorce Planning",
    "Entrepreneurial Wealth Management",
    "I don't know"
]

specialty = np.random.choice(
    specialty_options,
    size=N,
    p=normalize_probs([0.10, 0.06, 0.24, 0.10, 0.12, 0.09, 0.08, 0.04, 0.07, 0.10])
)

# -----------------------------
# 4. Approximate savings
# -----------------------------
savings = np.random.lognormal(mean=11.1, sigma=0.9, size=N)
savings = np.clip(savings, 1000, 5_000_000).astype(int)

# -----------------------------
# 5. Profession
# -----------------------------
profession_options = [
    "Software Engineer",
    "Doctor",
    "Teacher",
    "Lawyer",
    "Nurse",
    "Accountant",
    "Consultant",
    "Entrepreneur",
    "Student",
    "Professor",
    "Marketing Manager",
    "Sales Manager",
    "Financial Analyst",
    "Real Estate Agent",
    "Small Business Owner",
    "Product Manager",
    "Data Scientist",
    "Construction Manager",
    "Government Employee",
    "Retired"
]

profession = np.random.choice(
    profession_options,
    size=N,
    p=normalize_probs([
        0.08, 0.06, 0.07, 0.05, 0.06,
        0.06, 0.05, 0.06, 0.07, 0.03,
        0.05, 0.05, 0.04, 0.03, 0.05,
        0.05, 0.05, 0.03, 0.03, 0.08
    ])
)

# -----------------------------
# 6. Own house
# -----------------------------
owns_house = []
for a, s, prof in zip(age_bucket, savings, profession):
    if a == "<30":
        p = 0.18
    elif a == "30-40":
        p = 0.48
    elif a == "40-50":
        p = 0.68
    else:
        p = 0.78

    if s > 300_000:
        p += 0.10
    if prof in ["Doctor", "Lawyer", "Entrepreneur", "Small Business Owner", "Software Engineer"]:
        p += 0.05

    p = min(p, 0.95)
    owns_house.append(np.random.binomial(1, p))

owns_house = np.array(owns_house)

# -----------------------------
# 7. Risk tolerance score
# -----------------------------
risk_score = []
for a, s, r in zip(age_bucket, savings, retirement_goal):
    score = 3

    if a == "<30":
        score += 1
    elif a == "60+":
        score -= 1

    if r == "<2 yrs":
        score -= 1
    elif r == "10+ yrs":
        score += 1

    if s > 1_000_000:
        score += 1
    elif s < 30_000:
        score -= 1

    score += np.random.choice([-1, 0, 1], p=[0.2, 0.6, 0.2])
    score = max(1, min(5, score))
    risk_score.append(score)

risk_score = np.array(risk_score)

# -----------------------------
# Optional state column
# -----------------------------
state = np.random.choice(
    ["NY", "CA", "MA", "TX", "FL", "IL", "NJ", "WA"],
    size=N,
    p=normalize_probs([0.14, 0.18, 0.07, 0.13, 0.12, 0.10, 0.11, 0.15])
)

# -----------------------------
# Build dataframe
# -----------------------------
users = pd.DataFrame({
    "user_id": range(1, N + 1),
    "age_bucket": age_bucket,
    "retirement_goal": retirement_goal,
    "advisor_specialty_preference": specialty,
    "approx_savings": savings,
    "profession": profession,
    "owns_house": owns_house,
    "risk_tolerance_score": risk_score,
    "state": state
})

# -----------------------------
# Save
# -----------------------------
os.makedirs("data", exist_ok=True)
users.to_csv("data/simulated_users.csv", index=False)

print(users.head())
print(f"\nSaved {len(users)} users to data/simulated_users.csv")