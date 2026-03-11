from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field

ValidRole = Literal["admin", "staff", "rider", "customer"]


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    branch_id: int | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str = Field(min_length=1)
    role: ValidRole
    branch_id: int | None = None


class UserUpdate(BaseModel):
    full_name: str | None = None
    role: ValidRole | None = None
    branch_id: int | None = None
    is_active: bool | None = None
