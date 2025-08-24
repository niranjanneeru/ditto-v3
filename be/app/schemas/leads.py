from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field, EmailStr


class LeadIn(BaseModel):
    name: str = Field(..., description="Lead name")
    email: EmailStr = Field(..., description="Lead email")
    mobile: Optional[str] = Field(None, description="Lead mobile number")


class LeadBulkInsertResponse(BaseModel):
    total_rows: int
    inserted_count: int
    duplicate_count: int
    failed_count: int
    errors: List[str] = []


class SMS(BaseModel):
    content: str = Field(..., description="Content of the SMS")