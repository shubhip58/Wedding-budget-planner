from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

app = FastAPI(title="Wedding Budget Planner API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory store (no DB needed for free deploy) ──────────────────────────
budgets: dict = {}  # budget_id -> BudgetData

# ── Models ────────────────────────────────────────────────────────────────────
class ExpenseItem(BaseModel):
    id: Optional[str] = None
    category: str
    name: str
    estimated: float
    actual: float = 0.0
    paid: bool = False
    notes: Optional[str] = ""

class BudgetCreate(BaseModel):
    couple_names: str
    wedding_date: str
    total_budget: float
    currency: str = "INR"

class BudgetData(BaseModel):
    id: str
    couple_names: str
    wedding_date: str
    total_budget: float
    currency: str
    expenses: List[ExpenseItem] = []
    created_at: str

class BudgetSummary(BaseModel):
    id: str
    couple_names: str
    wedding_date: str
    total_budget: float
    currency: str
    total_estimated: float
    total_actual: float
    total_paid: float
    remaining_budget: float
    over_budget: bool
    expense_count: int
    categories: dict

# ── Default categories with suggested allocations ────────────────────────────
DEFAULT_CATEGORIES = [
    {"category": "Venue", "name": "Wedding Venue", "estimated": 0},
    {"category": "Catering", "name": "Food & Beverages", "estimated": 0},
    {"category": "Decoration", "name": "Flowers & Decor", "estimated": 0},
    {"category": "Photography", "name": "Photographer & Videographer", "estimated": 0},
    {"category": "Attire", "name": "Bridal Lehenga / Outfit", "estimated": 0},
    {"category": "Attire", "name": "Groom's Sherwani / Outfit", "estimated": 0},
    {"category": "Jewellery", "name": "Bridal Jewellery", "estimated": 0},
    {"category": "Music & Entertainment", "name": "DJ / Band / Performers", "estimated": 0},
    {"category": "Mehendi", "name": "Mehendi Artist", "estimated": 0},
    {"category": "Makeup & Hair", "name": "Bridal Makeup Artist", "estimated": 0},
    {"category": "Invitations", "name": "Wedding Cards & Printing", "estimated": 0},
    {"category": "Transportation", "name": "Baraat / Guest Transport", "estimated": 0},
    {"category": "Accommodation", "name": "Hotel for Out-of-town Guests", "estimated": 0},
    {"category": "Gifts & Favours", "name": "Return Gifts", "estimated": 0},
    {"category": "Pandit & Rituals", "name": "Pandit Ji & Puja Samagri", "estimated": 0},
    {"category": "Miscellaneous", "name": "Contingency / Other", "estimated": 0},
]

CATEGORY_SUGGESTIONS = {
    "Venue": 0.20,
    "Catering": 0.25,
    "Decoration": 0.10,
    "Photography": 0.08,
    "Attire": 0.10,
    "Jewellery": 0.07,
    "Music & Entertainment": 0.05,
    "Mehendi": 0.02,
    "Makeup & Hair": 0.03,
    "Invitations": 0.02,
    "Transportation": 0.02,
    "Accommodation": 0.02,
    "Gifts & Favours": 0.02,
    "Pandit & Rituals": 0.01,
    "Miscellaneous": 0.04,
}

# ── Helpers ───────────────────────────────────────────────────────────────────
def compute_summary(budget: BudgetData) -> BudgetSummary:
    total_estimated = sum(e.estimated for e in budget.expenses)
    total_actual = sum(e.actual for e in budget.expenses)
    total_paid = sum(e.actual for e in budget.expenses if e.paid)
    remaining = budget.total_budget - total_estimated

    categories: dict = {}
    for e in budget.expenses:
        cat = e.category
        if cat not in categories:
            categories[cat] = {"estimated": 0, "actual": 0, "count": 0}
        categories[cat]["estimated"] += e.estimated
        categories[cat]["actual"] += e.actual
        categories[cat]["count"] += 1

    return BudgetSummary(
        id=budget.id,
        couple_names=budget.couple_names,
        wedding_date=budget.wedding_date,
        total_budget=budget.total_budget,
        currency=budget.currency,
        total_estimated=total_estimated,
        total_actual=total_actual,
        total_paid=total_paid,
        remaining_budget=remaining,
        over_budget=total_estimated > budget.total_budget,
        expense_count=len(budget.expenses),
        categories=categories,
    )

# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "Wedding Budget Planner API", "version": "1.0.0"}

@app.post("/budget", response_model=BudgetData)
def create_budget(data: BudgetCreate):
    budget_id = str(uuid.uuid4())[:8]
    # Pre-fill expenses with suggested amounts
    expenses = []
    for item in DEFAULT_CATEGORIES:
        pct = CATEGORY_SUGGESTIONS.get(item["category"], 0)
        expenses.append(ExpenseItem(
            id=str(uuid.uuid4())[:8],
            category=item["category"],
            name=item["name"],
            estimated=round(data.total_budget * pct / max(
                sum(1 for d in DEFAULT_CATEGORIES if d["category"] == item["category"]), 1
            )),
            actual=0.0,
            paid=False,
            notes="",
        ))
    budget = BudgetData(
        id=budget_id,
        couple_names=data.couple_names,
        wedding_date=data.wedding_date,
        total_budget=data.total_budget,
        currency=data.currency,
        expenses=expenses,
        created_at=datetime.now().isoformat(),
    )
    budgets[budget_id] = budget
    return budget

@app.get("/budget/{budget_id}", response_model=BudgetData)
def get_budget(budget_id: str):
    if budget_id not in budgets:
        raise HTTPException(status_code=404, detail="Budget not found")
    return budgets[budget_id]

@app.get("/budget/{budget_id}/summary", response_model=BudgetSummary)
def get_summary(budget_id: str):
    if budget_id not in budgets:
        raise HTTPException(status_code=404, detail="Budget not found")
    return compute_summary(budgets[budget_id])

@app.put("/budget/{budget_id}/total")
def update_total(budget_id: str, total_budget: float):
    if budget_id not in budgets:
        raise HTTPException(status_code=404, detail="Budget not found")
    budgets[budget_id].total_budget = total_budget
    return {"message": "Updated", "total_budget": total_budget}

@app.post("/budget/{budget_id}/expense", response_model=ExpenseItem)
def add_expense(budget_id: str, expense: ExpenseItem):
    if budget_id not in budgets:
        raise HTTPException(status_code=404, detail="Budget not found")
    expense.id = str(uuid.uuid4())[:8]
    budgets[budget_id].expenses.append(expense)
    return expense

@app.put("/budget/{budget_id}/expense/{expense_id}", response_model=ExpenseItem)
def update_expense(budget_id: str, expense_id: str, updated: ExpenseItem):
    if budget_id not in budgets:
        raise HTTPException(status_code=404, detail="Budget not found")
    expenses = budgets[budget_id].expenses
    for i, e in enumerate(expenses):
        if e.id == expense_id:
            updated.id = expense_id
            expenses[i] = updated
            return updated
    raise HTTPException(status_code=404, detail="Expense not found")

@app.delete("/budget/{budget_id}/expense/{expense_id}")
def delete_expense(budget_id: str, expense_id: str):
    if budget_id not in budgets:
        raise HTTPException(status_code=404, detail="Budget not found")
    expenses = budgets[budget_id].expenses
    budgets[budget_id].expenses = [e for e in expenses if e.id != expense_id]
    return {"message": "Deleted"}

@app.get("/suggestions")
def get_suggestions(total_budget: float = 500000):
    suggestions = {}
    for cat, pct in CATEGORY_SUGGESTIONS.items():
        suggestions[cat] = round(total_budget * pct)
    return suggestions
