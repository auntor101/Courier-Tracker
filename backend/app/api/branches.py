from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_admin
from app.db import get_db
from app.models.branch import Branch
from app.models.user import User
from app.schemas.branch import BranchCreate, BranchOut, BranchUpdate

router = APIRouter(prefix="/api/branches", tags=["branches"])


@router.get("", response_model=list[BranchOut])
async def list_branches(
    _user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    branches_result = await db.execute(select(Branch).order_by(Branch.name))
    return branches_result.scalars().all()


@router.post("", response_model=BranchOut, status_code=201)
async def create_branch(
    body: BranchCreate,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    branch = Branch(**body.model_dump())
    db.add(branch)
    await db.commit()
    await db.refresh(branch)
    return branch


@router.patch("/{branch_id}", response_model=BranchOut)
async def update_branch(
    branch_id: int,
    body: BranchUpdate,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    branch_row = await db.execute(select(Branch).where(Branch.id == branch_id))
    branch = branch_row.scalar_one_or_none()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(branch, field, value)

    await db.commit()
    await db.refresh(branch)
    return branch
