from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_parcels: int
    booked: int
    in_transit: int
    out_for_delivery: int
    delivered: int
    returned: int
    cod_pending: int
    today_bookings: int
