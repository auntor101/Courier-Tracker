from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.db import get_db
from app.models.parcel import Parcel, ParcelStatus
from app.models.user import Role, User
from app.schemas.dashboard import DashboardStats

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def stats(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    base_query = select(Parcel)
    if user.role == Role.CUSTOMER:
        base_query = base_query.where(Parcel.sender_id == user.id)
    elif user.role == Role.RIDER:
        base_query = base_query.where(Parcel.assigned_rider_id == user.id)
    elif user.role == Role.STAFF:
        base_query = base_query.where(Parcel.current_branch_id == user.branch_id)

    async def count_status(status_filter: str | None = None) -> int:
        count_query = select(func.count()).select_from(base_query.subquery()) if not status_filter else (
            select(func.count()).select_from(base_query.where(Parcel.status == status_filter).subquery())
        )
        return (await db.execute(count_query)).scalar() or 0

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_count_query = select(func.count()).select_from(
        base_query.where(Parcel.created_at >= today_start).subquery()
    )
    today_count = (await db.execute(today_count_query)).scalar() or 0

    cod_count_query = select(func.count()).select_from(
        base_query.where(Parcel.payment_type == "cod", Parcel.cod_collected == False).subquery()
    )
    cod_pending = (await db.execute(cod_count_query)).scalar() or 0

    return DashboardStats(
        total_parcels=await count_status(),
        booked=await count_status(ParcelStatus.BOOKED),
        in_transit=await count_status(ParcelStatus.IN_TRANSIT),
        out_for_delivery=await count_status(ParcelStatus.OUT_FOR_DELIVERY),
        delivered=await count_status(ParcelStatus.DELIVERED),
        returned=await count_status(ParcelStatus.RETURNED),
        cod_pending=cod_pending,
        today_bookings=today_count,
    )
