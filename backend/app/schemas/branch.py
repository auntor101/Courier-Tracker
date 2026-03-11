from pydantic import BaseModel


class BranchOut(BaseModel):
    id: int
    name: str
    district: str
    address: str
    phone: str

    model_config = {"from_attributes": True}


class BranchCreate(BaseModel):
    name: str
    district: str
    address: str
    phone: str


class BranchUpdate(BaseModel):
    name: str | None = None
    district: str | None = None
    address: str | None = None
    phone: str | None = None
