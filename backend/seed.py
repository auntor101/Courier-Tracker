import asyncio
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import select

from app.core.config import settings
from app.core.security import hash_password
from app.db import async_session, engine
from app.models.base import Base
from app.models.branch import Branch
from app.models.parcel import Parcel, ParcelStatus, ParcelTimeline, PaymentType
from app.models.user import Role, User


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        existing = await db.execute(select(User).limit(1))
        if existing.scalar_one_or_none():
            print("Database already seeded.")
            return

        hashed_password = hash_password(settings.seed_password)

        branches = [
            Branch(name="Dhaka Hub", district="Dhaka", address="45 Motijheel C/A, Dhaka 1000", phone="01711000001"),
            Branch(name="Chittagong Branch", district="Chittagong", address="12 Agrabad, Chittagong 4100", phone="01711000002"),
            Branch(name="Sylhet Branch", district="Sylhet", address="8 Zindabazar, Sylhet 3100", phone="01711000003"),
        ]
        db.add_all(branches)
        await db.flush()

        users = [
            User(email="ct.admin@gmail.com", password_hash=hashed_password, full_name="Karim Ahmed", role=Role.ADMIN),
            User(email="ct.staff.dhaka@gmail.com", password_hash=hashed_password, full_name="Rahim Uddin", role=Role.STAFF, branch_id=branches[0].id),
            User(email="ct.staff.ctg@gmail.com", password_hash=hashed_password, full_name="Salma Begum", role=Role.STAFF, branch_id=branches[1].id),
            User(email="ct.rider1@gmail.com", password_hash=hashed_password, full_name="Jamal Hossain", role=Role.RIDER, branch_id=branches[0].id),
            User(email="ct.rider2@gmail.com", password_hash=hashed_password, full_name="Arif Khan", role=Role.RIDER, branch_id=branches[1].id),
            User(email="ct.customer1@gmail.com", password_hash=hashed_password, full_name="Nusrat Jahan", role=Role.CUSTOMER),
            User(email="ct.customer2@gmail.com", password_hash=hashed_password, full_name="Tanvir Rahman", role=Role.CUSTOMER),
        ]
        db.add_all(users)
        await db.flush()

        now = datetime.now(timezone.utc)
        admin, staff_dhk, staff_ctg, rider1, rider2, customer1, customer2 = users
        dhk, ctg, syl = branches

        parcels_data = [
            dict(tracking_code="CT-260310-0001", sender_id=customer1.id, recipient_name="Fahim Islam", recipient_phone="01812345001", recipient_address="22 GEC Circle, Chittagong", recipient_district="Chittagong", origin_branch_id=dhk.id, current_branch_id=dhk.id, destination_branch_id=ctg.id, status=ParcelStatus.BOOKED, payment_type=PaymentType.PREPAID, weight_kg=Decimal("1.2"), price=Decimal("120"), cod_amount=Decimal("0")),
            dict(tracking_code="CT-260310-0002", sender_id=customer1.id, recipient_name="Taslima Akter", recipient_phone="01812345002", recipient_address="5 Ambarkhana, Sylhet", recipient_district="Sylhet", origin_branch_id=dhk.id, current_branch_id=dhk.id, destination_branch_id=syl.id, status=ParcelStatus.RECEIVED_AT_BRANCH, payment_type=PaymentType.COD, weight_kg=Decimal("0.8"), price=Decimal("150"), cod_amount=Decimal("2500")),
            dict(tracking_code="CT-260310-0003", sender_id=customer2.id, recipient_name="Rezaul Karim", recipient_phone="01812345003", recipient_address="10 Banani, Dhaka", recipient_district="Dhaka", origin_branch_id=ctg.id, current_branch_id=dhk.id, destination_branch_id=dhk.id, status=ParcelStatus.AT_DESTINATION_BRANCH, payment_type=PaymentType.PREPAID, weight_kg=Decimal("2.0"), price=Decimal("200"), cod_amount=Decimal("0"), assigned_rider_id=rider1.id),
            dict(tracking_code="CT-260310-0004", sender_id=customer2.id, recipient_name="Mithila Das", recipient_phone="01812345004", recipient_address="3 Halishahar, Chittagong", recipient_district="Chittagong", origin_branch_id=dhk.id, current_branch_id=ctg.id, destination_branch_id=ctg.id, status=ParcelStatus.OUT_FOR_DELIVERY, payment_type=PaymentType.COD, weight_kg=Decimal("0.5"), price=Decimal("100"), cod_amount=Decimal("1800"), assigned_rider_id=rider2.id),
            dict(tracking_code="CT-260309-0001", sender_id=customer1.id, recipient_name="Shahed Alam", recipient_phone="01812345005", recipient_address="7 Dhanmondi, Dhaka", recipient_district="Dhaka", origin_branch_id=ctg.id, current_branch_id=dhk.id, destination_branch_id=dhk.id, status=ParcelStatus.DELIVERED, payment_type=PaymentType.PREPAID, weight_kg=Decimal("3.0"), price=Decimal("250"), cod_amount=Decimal("0"), assigned_rider_id=rider1.id),
            dict(tracking_code="CT-260309-0002", sender_id=customer2.id, recipient_name="Sumaiya Khatun", recipient_phone="01812345006", recipient_address="15 Laldighirpar, Sylhet", recipient_district="Sylhet", origin_branch_id=dhk.id, current_branch_id=syl.id, destination_branch_id=syl.id, status=ParcelStatus.DELIVERED, payment_type=PaymentType.COD, weight_kg=Decimal("1.0"), price=Decimal("130"), cod_amount=Decimal("3200"), cod_collected=True, assigned_rider_id=rider2.id),
            dict(tracking_code="CT-260309-0003", sender_id=customer1.id, recipient_name="Habib Chowdhury", recipient_phone="01812345007", recipient_address="9 Nasirabad, Chittagong", recipient_district="Chittagong", origin_branch_id=syl.id, current_branch_id=ctg.id, destination_branch_id=ctg.id, status=ParcelStatus.RETURNED, payment_type=PaymentType.PREPAID, weight_kg=Decimal("0.3"), price=Decimal("80"), cod_amount=Decimal("0")),
            dict(tracking_code="CT-260310-0005", sender_id=customer2.id, recipient_name="Anika Tasnim", recipient_phone="01812345008", recipient_address="11 Mohakhali, Dhaka", recipient_district="Dhaka", origin_branch_id=syl.id, current_branch_id=syl.id, destination_branch_id=dhk.id, status=ParcelStatus.IN_TRANSIT, payment_type=PaymentType.PREPAID, weight_kg=Decimal("1.5"), price=Decimal("160"), cod_amount=Decimal("0")),
            dict(tracking_code="CT-260310-0006", sender_id=customer1.id, recipient_name="Imran Hasan", recipient_phone="01812345009", recipient_address="6 Agrabad, Chittagong", recipient_district="Chittagong", origin_branch_id=dhk.id, current_branch_id=dhk.id, destination_branch_id=ctg.id, status=ParcelStatus.BOOKED, payment_type=PaymentType.COD, weight_kg=Decimal("0.7"), price=Decimal("110"), cod_amount=Decimal("1500")),
            dict(tracking_code="CT-260310-0007", sender_id=customer2.id, recipient_name="Farzana Akter", recipient_phone="01812345010", recipient_address="20 Zindabazar, Sylhet", recipient_district="Sylhet", origin_branch_id=ctg.id, current_branch_id=ctg.id, destination_branch_id=syl.id, status=ParcelStatus.RECEIVED_AT_BRANCH, payment_type=PaymentType.PREPAID, weight_kg=Decimal("2.5"), price=Decimal("180"), cod_amount=Decimal("0")),
        ]

        for parcel_dict in parcels_data:
            parcel = Parcel(**parcel_dict)
            db.add(parcel)
        await db.flush()

        all_parcels = (await db.execute(select(Parcel))).scalars().all()
        for p in all_parcels:
            db.add(ParcelTimeline(parcel_id=p.id, status=ParcelStatus.BOOKED, updated_by=p.sender_id, note="Parcel booked", timestamp=now - timedelta(hours=12)))
            if p.status != ParcelStatus.BOOKED:
                db.add(ParcelTimeline(parcel_id=p.id, status=ParcelStatus.RECEIVED_AT_BRANCH, updated_by=staff_dhk.id, note="Received at origin branch", timestamp=now - timedelta(hours=10)))
            if p.status in (ParcelStatus.IN_TRANSIT, ParcelStatus.AT_DESTINATION_BRANCH, ParcelStatus.OUT_FOR_DELIVERY, ParcelStatus.DELIVERED, ParcelStatus.RETURNED):
                db.add(ParcelTimeline(parcel_id=p.id, status=ParcelStatus.IN_TRANSIT, updated_by=staff_dhk.id, note="Dispatched to destination", timestamp=now - timedelta(hours=8)))
            if p.status in (ParcelStatus.AT_DESTINATION_BRANCH, ParcelStatus.OUT_FOR_DELIVERY, ParcelStatus.DELIVERED):
                db.add(ParcelTimeline(parcel_id=p.id, status=ParcelStatus.AT_DESTINATION_BRANCH, updated_by=staff_ctg.id, note="Arrived at destination branch", timestamp=now - timedelta(hours=6)))
            if p.status in (ParcelStatus.OUT_FOR_DELIVERY, ParcelStatus.DELIVERED):
                db.add(ParcelTimeline(parcel_id=p.id, status=ParcelStatus.OUT_FOR_DELIVERY, updated_by=staff_ctg.id, note="Out for delivery", timestamp=now - timedelta(hours=4)))
            if p.status == ParcelStatus.DELIVERED:
                db.add(ParcelTimeline(parcel_id=p.id, status=ParcelStatus.DELIVERED, updated_by=rider1.id, note="Delivered to recipient", timestamp=now - timedelta(hours=2)))
            if p.status == ParcelStatus.RETURNED:
                db.add(ParcelTimeline(parcel_id=p.id, status=ParcelStatus.RETURNED, updated_by=staff_ctg.id, note="Returned - recipient unavailable", timestamp=now - timedelta(hours=3)))

        await db.commit()
        print("Seeded: 3 branches, 7 users, 10 parcels with timeline entries.")


if __name__ == "__main__":
    asyncio.run(seed())
