from __future__ import annotations


def is_eligible(user: dict, advisor: dict) -> bool:
    user_assets = float(user["liquid_assets"])
    advisor_min_assets = float(advisor["min_assets"])

    if user_assets < advisor_min_assets:
        return False

    user_goals = set(goal.lower() for goal in user["goals"])
    advisor_specialties = set(advisor["specialties"])
    if len(user_goals & advisor_specialties) == 0:
        return False

    same_state = user["state"].upper() == str(advisor["state"]).upper()
    virtual_ok = int(advisor["virtual_available"]) == 1
    if not same_state and not virtual_ok:
        return False

    return True