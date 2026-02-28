from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class ActionType(str, Enum):
    DEPOSIT = "deposit"
    WITHDRAW = "withdraw"
    SWAP = "swap"
    HOLD = "hold"


class Action(BaseModel):
    type: ActionType
    token: str
    amount: int
    reason: str
    metadata: Optional[dict] = None


class Balance(BaseModel):
    token: str
    amount: int


class OraclePrice(BaseModel):
    pair: str
    rate: float
    timestamp: datetime


class YieldInfo(BaseModel):
    token: str
    apy: float = Field(alias="yield_rate", default=0.0)
    timestamp: datetime

    class Config:
        populate_by_name = True


class Obligation(BaseModel):
    id: str
    recipient: str = ""
    amount: float = 0.0
    currency: str = "USDC"
    due_date: Optional[datetime] = None
    status: str = "pending"
    funded_by: Optional[str] = None
    # Legacy fields for backward compat
    token: str = ""
    due_at: Optional[datetime] = None
    description: Optional[str] = None


class AgentDecision(BaseModel):
    actions: List[Action] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = None
