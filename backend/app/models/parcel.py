import enum
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class ParcelStatus(str, enum.Enum):
    BOOKED = "booked"
    RECEIVED_AT_BRANCH = "received_at_branch"
    IN_TRANSIT = "in_transit"
    AT_DESTINATION_BRANCH = "at_destination_branch"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    RETURNED = "returned"


class PaymentType(str, enum.Enum):
    PREPAID = "prepaid"
    COD = "cod"


VALID_TRANSITIONS = {
    ParcelStatus.BOOKED: [ParcelStatus.RECEIVED_AT_BRANCH],
    ParcelStatus.RECEIVED_AT_BRANCH: [ParcelStatus.IN_TRANSIT],
    ParcelStatus.IN_TRANSIT: [ParcelStatus.AT_DESTINATION_BRANCH],
    ParcelStatus.AT_DESTINATION_BRANCH: [ParcelStatus.OUT_FOR_DELIVERY, ParcelStatus.RETURNED],
    ParcelStatus.OUT_FOR_DELIVERY: [ParcelStatus.DELIVERED, ParcelStatus.RETURNED],
    ParcelStatus.DELIVERED: [],
    ParcelStatus.RETURNED: [],
}


class Parcel(Base):
    __tablename__ = "parcels"

    id: Mapped[int] = mapped_column(primary_key=True)
    tracking_code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    recipient_name: Mapped[str] = mapped_column(String(150))
    recipient_phone: Mapped[str] = mapped_column(String(20))
    recipient_address: Mapped[str] = mapped_column(String(300))
    recipient_district: Mapped[str] = mapped_column(String(100))
    origin_branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"))
    current_branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"))
    destination_branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"))
    assigned_rider_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"), nullable=True
    )
    status: Mapped[str] = mapped_column(String(30), default=ParcelStatus.BOOKED)
    payment_type: Mapped[str] = mapped_column(String(10), default=PaymentType.PREPAID)
    weight_kg: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=Decimal("0.5"))
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    cod_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0"))
    cod_collected: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    timeline = relationship("ParcelTimeline", back_populates="parcel", order_by="ParcelTimeline.timestamp")


class ParcelTimeline(Base):
    __tablename__ = "parcel_timeline"

    id: Mapped[int] = mapped_column(primary_key=True)
    parcel_id: Mapped[int] = mapped_column(ForeignKey("parcels.id"))
    status: Mapped[str] = mapped_column(String(30))
    note: Mapped[str | None] = mapped_column(String(300), nullable=True)
    updated_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    parcel = relationship("Parcel", back_populates="timeline")
