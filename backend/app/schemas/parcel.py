from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field

ValidStatus = Literal[
    "booked", "received_at_branch", "in_transit",
    "at_destination_branch", "out_for_delivery", "delivered", "returned"
]
ValidPayment = Literal["prepaid", "cod"]


class ParcelCreate(BaseModel):
    recipient_name: str = Field(min_length=1)
    recipient_phone: str = Field(min_length=1)
    recipient_address: str = Field(min_length=1)
    recipient_district: str = Field(min_length=1)
    origin_branch_id: int
    destination_branch_id: int
    payment_type: ValidPayment = "prepaid"
    weight_kg: Decimal = Decimal("0.5")
    price: Decimal
    cod_amount: Decimal = Decimal("0")
    notes: str | None = None


class ParcelOut(BaseModel):
    id: int
    tracking_code: str
    sender_id: int
    recipient_name: str
    recipient_phone: str
    recipient_address: str
    recipient_district: str
    origin_branch_id: int
    current_branch_id: int
    destination_branch_id: int
    assigned_rider_id: int | None
    status: str
    payment_type: str
    weight_kg: Decimal
    price: Decimal
    cod_amount: Decimal
    cod_collected: bool
    notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class StatusUpdate(BaseModel):
    status: ValidStatus
    note: str | None = None


class RiderAssign(BaseModel):
    rider_id: int


class BranchTransfer(BaseModel):
    branch_id: int
    note: str | None = None


class TimelineOut(BaseModel):
    id: int
    status: str
    note: str | None
    updated_by: int
    timestamp: datetime

    model_config = {"from_attributes": True}


class PaginatedParcels(BaseModel):
    items: list[ParcelOut]
    total: int
    page: int
    per_page: int
