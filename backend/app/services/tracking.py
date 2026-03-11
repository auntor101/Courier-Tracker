from datetime import datetime, timezone

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.parcel import Parcel

MAX_RETRIES = 5


async def generate_tracking_code(db: AsyncSession) -> str:
    today = datetime.now(timezone.utc)
    prefix = f"CT-{today.strftime('%y%m%d')}"

    for attempt in range(MAX_RETRIES):
        result = await db.execute(
            select(func.count()).where(Parcel.tracking_code.like(f"{prefix}%"))
        )
        count = result.scalar() or 0
        seq = str(count + 1 + attempt).zfill(4)
        code = f"{prefix}-{seq}"

        exists = await db.execute(
            select(func.count()).where(Parcel.tracking_code == code)
        )
        if (exists.scalar() or 0) == 0:
            return code

    raise ValueError("Failed to generate unique tracking code after retries")
