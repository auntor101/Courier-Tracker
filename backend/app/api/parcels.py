from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_current_user, require_rider, require_staff
from app.db import get_db
from app.models.parcel import Parcel, ParcelStatus, ParcelTimeline, PaymentType, VALID_TRANSITIONS
from app.models.user import Role, User
from app.schemas.parcel import (
    BranchTransfer,
    PaginatedParcels,
    ParcelCreate,
    ParcelOut,
    RiderAssign,
    StatusUpdate,
    TimelineOut,
)
from app.services.tracking import generate_tracking_code

router = APIRouter(prefix="/api/parcels", tags=["parcels"])


def _add_timeline(db: AsyncSession, parcel_id: int, status: str, user_id: int, note: str | None = None):
    entry = ParcelTimeline(parcel_id=parcel_id, status=status, updated_by=user_id, note=note)
    db.add(entry)


@router.post("", response_model=ParcelOut, status_code=201)
async def book_parcel(
    body: ParcelCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tracking_code = await generate_tracking_code(db)
    parcel = Parcel(
        tracking_code=tracking_code,
        sender_id=user.id,
        recipient_name=body.recipient_name,
        recipient_phone=body.recipient_phone,
        recipient_address=body.recipient_address,
        recipient_district=body.recipient_district,
        origin_branch_id=body.origin_branch_id,
        current_branch_id=body.origin_branch_id,
        destination_branch_id=body.destination_branch_id,
        payment_type=body.payment_type,
        weight_kg=body.weight_kg,
        price=body.price,
        cod_amount=body.cod_amount,
        notes=body.notes,
        status=ParcelStatus.BOOKED,
    )
    db.add(parcel)
    await db.flush()
    _add_timeline(db, parcel.id, ParcelStatus.BOOKED, user.id, "Parcel booked")
    await db.commit()
    await db.refresh(parcel)
    return parcel


@router.get("", response_model=PaginatedParcels)
async def list_parcels(
    search: str | None = None,
    status: str | None = None,
    branch_id: int | None = None,
    rider_id: int | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    parcel_query = select(Parcel)

    if user.role == Role.CUSTOMER:
        parcel_query = parcel_query.where(Parcel.sender_id == user.id)
    elif user.role == Role.RIDER:
        parcel_query = parcel_query.where(Parcel.assigned_rider_id == user.id)
    elif user.role == Role.STAFF:
        parcel_query = parcel_query.where(Parcel.current_branch_id == user.branch_id)

    if search:
        pattern = f"%{search}%"
        parcel_query = parcel_query.where(
            or_(
                Parcel.tracking_code.ilike(pattern),
                Parcel.recipient_name.ilike(pattern),
                Parcel.recipient_phone.ilike(pattern),
            )
        )
    if status:
        parcel_query = parcel_query.where(Parcel.status == status)
    if branch_id:
        parcel_query = parcel_query.where(Parcel.current_branch_id == branch_id)
    if rider_id:
        parcel_query = parcel_query.where(Parcel.assigned_rider_id == rider_id)

    count_query = select(func.count()).select_from(parcel_query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    parcel_query = parcel_query.order_by(Parcel.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    parcels_result = await db.execute(parcel_query)
    items = parcels_result.scalars().all()

    return PaginatedParcels(items=items, total=total, page=page, per_page=per_page)


@router.get("/track/{tracking_code}", response_model=ParcelOut)
async def track_parcel(tracking_code: str, db: AsyncSession = Depends(get_db)):
    parcel_row = await db.execute(select(Parcel).where(Parcel.tracking_code == tracking_code))
    parcel = parcel_row.scalar_one_or_none()
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")
    return parcel


@router.get("/track/{tracking_code}/timeline", response_model=list[TimelineOut])
async def parcel_timeline(tracking_code: str, db: AsyncSession = Depends(get_db)):
    parcel_row = await db.execute(
        select(Parcel).options(selectinload(Parcel.timeline)).where(Parcel.tracking_code == tracking_code)
    )
    parcel = parcel_row.scalar_one_or_none()
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")
    return parcel.timeline


@router.patch("/{parcel_id}/status", response_model=ParcelOut)
async def update_status(
    parcel_id: int,
    body: StatusUpdate,
    user: User = Depends(require_rider),
    db: AsyncSession = Depends(get_db),
):
    parcel_row = await db.execute(select(Parcel).where(Parcel.id == parcel_id))
    parcel = parcel_row.scalar_one_or_none()
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")

    if user.role == "rider" and parcel.assigned_rider_id != user.id:
        raise HTTPException(status_code=403, detail="You are not assigned to this parcel")

    current = ParcelStatus(parcel.status)
    try:
        new_status = ParcelStatus(body.status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status value")

    allowed = VALID_TRANSITIONS.get(current, [])
    if new_status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition from {current.value} to {new_status.value}",
        )

    parcel.status = new_status.value
    _add_timeline(db, parcel.id, new_status.value, user.id, body.note)
    await db.commit()
    await db.refresh(parcel)
    return parcel


@router.patch("/{parcel_id}/assign", response_model=ParcelOut)
async def assign_rider(
    parcel_id: int,
    body: RiderAssign,
    user: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    parcel_row = await db.execute(select(Parcel).where(Parcel.id == parcel_id))
    parcel = parcel_row.scalar_one_or_none()
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")

    rider_result = await db.execute(select(User).where(User.id == body.rider_id, User.role == Role.RIDER))
    rider = rider_result.scalar_one_or_none()
    if not rider:
        raise HTTPException(status_code=400, detail="Rider not found")

    parcel.assigned_rider_id = body.rider_id
    _add_timeline(db, parcel.id, parcel.status, user.id, f"Assigned to rider: {rider.full_name}")
    await db.commit()
    await db.refresh(parcel)
    return parcel


@router.patch("/{parcel_id}/transfer", response_model=ParcelOut)
async def transfer_branch(
    parcel_id: int,
    body: BranchTransfer,
    user: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    parcel_row = await db.execute(select(Parcel).where(Parcel.id == parcel_id))
    parcel = parcel_row.scalar_one_or_none()
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")

    transferable = [
        ParcelStatus.RECEIVED_AT_BRANCH.value,
        ParcelStatus.IN_TRANSIT.value,
        ParcelStatus.AT_DESTINATION_BRANCH.value,
    ]
    if parcel.status not in transferable:
        raise HTTPException(status_code=400, detail=f"Cannot transfer parcel with status {parcel.status}")

    from app.models.branch import Branch
    branch_check = await db.execute(select(Branch).where(Branch.id == body.branch_id))
    if not branch_check.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Target branch not found")

    parcel.current_branch_id = body.branch_id
    parcel.status = ParcelStatus.IN_TRANSIT.value
    _add_timeline(db, parcel.id, ParcelStatus.IN_TRANSIT.value, user.id, body.note or "Transferred to next branch")
    await db.commit()
    await db.refresh(parcel)
    return parcel


@router.patch("/{parcel_id}/cod", response_model=ParcelOut)
async def collect_cod(
    parcel_id: int,
    user: User = Depends(require_rider),
    db: AsyncSession = Depends(get_db),
):
    parcel_row = await db.execute(select(Parcel).where(Parcel.id == parcel_id))
    parcel = parcel_row.scalar_one_or_none()
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")

    if parcel.payment_type != PaymentType.COD.value:
        raise HTTPException(status_code=400, detail="Not a COD parcel")
    if parcel.assigned_rider_id != user.id and user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not assigned to you")
    if parcel.cod_collected:
        raise HTTPException(status_code=400, detail="COD already collected")

    parcel.cod_collected = True
    _add_timeline(db, parcel.id, parcel.status, user.id, "COD collected")
    await db.commit()
    await db.refresh(parcel)
    return parcel
