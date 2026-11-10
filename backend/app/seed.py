from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os
from .database import engine, Base, SessionLocal
from .models.user import User, CustomerProfile, StaffProfile
from .models.test import Test, TestPackage
from .models.booking import Booking, BookingItem, Address, StaffAssignment
from .models.payment import Payment
from .models.report import Report
from .models.other import ServiceablePincode, Coupon, Notification, AuditLog
from .utils.security import get_password_hash
from .services.pdf_generator import generate_blood_test_report_pdf
from .config import settings

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if data already exists
    if db.query(User).count() > 0:
        print("Database already seeded. Skipping initial seeding.")
        db.close()
        return

    print("Seeding CareAtHome database...")

    # 1. Users & Profiles
    admin_user = User(
        email="admin@careathome.in",
        hashed_password=get_password_hash("Admin@123"),
        full_name="Dr. Vikramaditya (Admin)",
        phone="+91 98450 11223",
        role="admin",
        is_active=True
    )
    db.add(admin_user)

    staff1 = User(
        email="rahul.phlebo@careathome.in",
        hashed_password=get_password_hash("Staff@123"),
        full_name="Rahul Verma (Phlebotomist)",
        phone="+91 98765 43210",
        role="staff",
        is_active=True
    )
    db.add(staff1)

    staff2 = User(
        email="priya.phlebo@careathome.in",
        hashed_password=get_password_hash("Staff@123"),
        full_name="Priya Nair (Senior Phlebotomist)",
        phone="+91 98111 22334",
        role="staff",
        is_active=True
    )
    db.add(staff2)

    cust1 = User(
        email="ananya.sharma@example.com",
        hashed_password=get_password_hash("Customer@123"),
        full_name="Ananya Sharma",
        phone="+91 99887 76655",
        role="customer",
        is_active=True
    )
    db.add(cust1)

    cust2 = User(
        email="vikram.mehta@example.com",
        hashed_password=get_password_hash("Customer@123"),
        full_name="Vikram Mehta",
        phone="+91 98220 33445",
        role="customer",
        is_active=True
    )
    db.add(cust2)
    db.commit()

    # Staff Profiles
    sp1 = StaffProfile(
        user_id=staff1.id,
        qualification="B.Sc Medical Laboratory Technology (BMLT)",
        license_number="KMC-PHL-2022-814",
        service_area="Koramangala, HSR Layout, Indiranagar",
        is_available=True,
        total_collections=248,
        rating=4.95
    )
    db.add(sp1)

    sp2 = StaffProfile(
        user_id=staff2.id,
        qualification="Diploma in Medical Lab Technology (DMLT)",
        license_number="KMC-PHL-2021-409",
        service_area="Whitefield, Marathahalli, Bellandur",
        is_available=True,
        total_collections=380,
        rating=4.98
    )
    db.add(sp2)

    # Customer Profiles
    cp1 = CustomerProfile(
        user_id=cust1.id,
        date_of_birth="1992-05-14",
        gender="Female",
        blood_group="B+",
        emergency_contact="+91 99887 76600"
    )
    db.add(cp1)

    cp2 = CustomerProfile(
        user_id=cust2.id,
        date_of_birth="1984-11-20",
        gender="Male",
        blood_group="O+",
        emergency_contact="+91 98220 33400"
    )
    db.add(cp2)
    db.commit()

    # 2. Diagnostic Tests
    tests_data = [
        {
            "code": "CBC01",
            "name": "Complete Blood Count (CBC)",
            "category": "Full Body",
            "short_description": "Comprehensive check of red cells, white cells, platelets & hemoglobin.",
            "description": "The Complete Blood Count (CBC) evaluates overall health and detects a wide range of disorders, including anemia, infection and leukemia. Covers 24 parameters including Hemoglobin, TLC, DLC, Platelets, MCV, MCH, MCHC, and RDW.",
            "price": 350.0,
            "market_price": 550.0,
            "sample_type": "Whole Blood (EDTA)",
            "tube_color": "Purple Top",
            "fasting_required": False,
            "fasting_hours": 0,
            "preparation_instructions": "No special preparation or fasting is required. Drink plenty of water before collection.",
            "turnaround_time_hours": 8,
            "parameters_count": 24,
            "is_popular": True
        },
        {
            "code": "GLUC01",
            "name": "Blood Glucose (Fasting)",
            "category": "Diabetes",
            "short_description": "Measures glucose concentration in blood after an overnight fast.",
            "description": "Essential diagnostic screening test for diabetes mellitus, impaired fasting glucose, and metabolic syndrome.",
            "price": 120.0,
            "market_price": 200.0,
            "sample_type": "Fluoride Plasma",
            "tube_color": "Grey Top",
            "fasting_required": True,
            "fasting_hours": 10,
            "preparation_instructions": "Requires 8 to 10 hours of strict overnight fasting. Only plain water is permitted. Morning medications should be taken after blood draw.",
            "turnaround_time_hours": 6,
            "parameters_count": 1,
            "is_popular": True
        },
        {
            "code": "HBA1C",
            "name": "HbA1c (Glycated Hemoglobin)",
            "category": "Diabetes",
            "short_description": "Measures 3-month average blood sugar levels.",
            "description": "Gold standard diagnostic test for long-term glycemic control and diabetes monitoring. Provides estimated average glucose (eAG).",
            "price": 499.0,
            "market_price": 750.0,
            "sample_type": "Whole Blood (EDTA)",
            "tube_color": "Purple Top",
            "fasting_required": False,
            "fasting_hours": 0,
            "preparation_instructions": "No fasting required. Can be taken any time of the day.",
            "turnaround_time_hours": 8,
            "parameters_count": 2,
            "is_popular": True
        },
        {
            "code": "LIPID01",
            "name": "Lipid Profile (Complete Cholesterol)",
            "category": "Heart",
            "short_description": "Total Cholesterol, HDL, LDL, VLDL & Triglycerides.",
            "description": "Assesses cardiovascular health, coronary artery disease risk, and lipid metabolism. Essential for adults over 25.",
            "price": 650.0,
            "market_price": 1050.0,
            "sample_type": "Serum (SST)",
            "tube_color": "Yellow Gel Top",
            "fasting_required": True,
            "fasting_hours": 12,
            "preparation_instructions": "Strict 10-12 hours overnight fasting required. Avoid high-fat meals and alcohol 24 hours prior.",
            "turnaround_time_hours": 10,
            "parameters_count": 8,
            "is_popular": True
        },
        {
            "code": "THYR01",
            "name": "Thyroid Profile (Total T3, T4, TSH)",
            "category": "Thyroid",
            "short_description": "Screening for hypothyroidism and hyperthyroidism.",
            "description": "Evaluates thyroid gland function, metabolism rate, and hormonal balance. Includes Total Triiodothyronine (T3), Total Thyroxine (T4), and TSH.",
            "price": 550.0,
            "market_price": 850.0,
            "sample_type": "Serum (SST)",
            "tube_color": "Yellow Gel Top",
            "fasting_required": False,
            "fasting_hours": 0,
            "preparation_instructions": "Fasting preferred but not mandatory. If taking thyroid medication (e.g., Thyronorm), take it strictly after the sample is collected.",
            "turnaround_time_hours": 10,
            "parameters_count": 3,
            "is_popular": True
        },
        {
            "code": "LFT01",
            "name": "Liver Function Test (LFT)",
            "category": "Liver & Kidney",
            "short_description": "11 parameters checking enzymes, proteins & bilirubin.",
            "description": "Measures SGOT, SGPT, Alkaline Phosphatase, Bilirubin Total/Direct/Indirect, Albumin, Globulin and A/G ratio. Screens for fatty liver, hepatitis and liver health.",
            "price": 699.0,
            "market_price": 1100.0,
            "sample_type": "Serum (SST)",
            "tube_color": "Yellow Gel Top",
            "fasting_required": True,
            "fasting_hours": 8,
            "preparation_instructions": "8-10 hours fasting recommended. Avoid alcohol for 48 hours prior to test.",
            "turnaround_time_hours": 12,
            "parameters_count": 11,
            "is_popular": True
        },
        {
            "code": "KFT01",
            "name": "Kidney Function Test (KFT / RFT)",
            "category": "Liver & Kidney",
            "short_description": "Urea, Creatinine, Uric Acid, BUN & eGFR.",
            "description": "Assesses renal filtration capacity, electrolyte balance, and early kidney stress markers.",
            "price": 699.0,
            "market_price": 1100.0,
            "sample_type": "Serum (SST)",
            "tube_color": "Yellow Gel Top",
            "fasting_required": False,
            "fasting_hours": 0,
            "preparation_instructions": "Stay well hydrated. Avoid strenuous heavy weightlifting 24 hours prior as it can transiently elevate serum creatinine.",
            "turnaround_time_hours": 10,
            "parameters_count": 6,
            "is_popular": True
        },
        {
            "code": "VITD01",
            "name": "Vitamin D (25-Hydroxy)",
            "category": "Vitamins",
            "short_description": "Measures active Vitamin D level for bone and immune health.",
            "description": "Detects Vitamin D deficiency prevalent in over 70% of urban Indians. Key for calcium absorption, bone strength, and immunity.",
            "price": 999.0,
            "market_price": 1600.0,
            "sample_type": "Serum (SST)",
            "tube_color": "Yellow Gel Top",
            "fasting_required": False,
            "fasting_hours": 0,
            "preparation_instructions": "No fasting required. Can be drawn any time of the day.",
            "turnaround_time_hours": 12,
            "parameters_count": 1,
            "is_popular": True
        },
        {
            "code": "VITB12",
            "name": "Vitamin B12 (Cobalamin)",
            "category": "Vitamins",
            "short_description": "Vital for nerve function, brain clarity & red blood cell formation.",
            "description": "Critical for vegetarians and individuals experiencing unexplained fatigue, tingling, or memory fog.",
            "price": 899.0,
            "market_price": 1450.0,
            "sample_type": "Serum (SST)",
            "tube_color": "Yellow Gel Top",
            "fasting_required": False,
            "fasting_hours": 0,
            "preparation_instructions": "No special preparation needed. Avoid taking high-dose B-complex vitamins on the morning of test.",
            "turnaround_time_hours": 12,
            "parameters_count": 1,
            "is_popular": False
        },
        {
            "code": "IRON01",
            "name": "Iron Studies & Serum Ferritin",
            "category": "Full Body",
            "short_description": "Serum Iron, Ferritin, TIBC & Transferrin saturation.",
            "description": "Differentiates iron-deficiency anemia from chronic anemia and evaluates iron storage reserves.",
            "price": 850.0,
            "market_price": 1350.0,
            "sample_type": "Serum (SST)",
            "tube_color": "Yellow Gel Top",
            "fasting_required": True,
            "fasting_hours": 10,
            "preparation_instructions": "Overnight fasting required (morning sample preferred as iron levels fluctuate during the day).",
            "turnaround_time_hours": 12,
            "parameters_count": 5,
            "is_popular": False
        }
    ]

    created_tests = []
    for td in tests_data:
        t = Test(**td)
        db.add(t)
        created_tests.append(t)
    db.commit()

    # 3. Health Packages
    pkg1 = TestPackage(
        code="PKG-FULLBODY",
        name="CareAtHome Comprehensive Health Checkup",
        category="Full Body",
        tagline="Our most popular full-body health audit (65+ parameters)",
        description="A thorough screening covering vital organs: Complete Blood Count, Liver Function, Kidney Function, Complete Lipid Profile, Fasting Blood Sugar, Thyroid TSH, and Urine Analysis. Ideal for annual wellness.",
        price=1499.0,
        market_price=3500.0,
        fasting_required=True,
        fasting_hours=10,
        preparation_instructions="10-12 hours overnight fasting required. Water is encouraged. Do not consume alcohol or heavy oily dinner the night before.",
        turnaround_time_hours=18,
        parameters_count=65,
        sample_types="Blood (EDTA, Serum, Fluoride)",
        target_demographic="Men & Women (21 - 65 yrs)",
        is_popular=True,
        is_active=True
    )
    # Attach tests
    pkg1.tests.extend(created_tests[:6])
    db.add(pkg1)

    pkg2 = TestPackage(
        code="PKG-SENIOR",
        name="Senior Citizen Complete Wellness Profile",
        category="Senior Care",
        tagline="Tailored for elderly parents & adults 50+ (78 parameters)",
        description="Specialized preventive package including Vitamin D, Vitamin B12, Cardiac Risk, Renal Function, Liver Function, Diabetic screening, and bone health markers.",
        price=2499.0,
        market_price=5500.0,
        fasting_required=True,
        fasting_hours=10,
        preparation_instructions="10-12 hours fasting. Phlebotomists use specialized ultra-fine butterfly needles for fragile veins of elderly patients.",
        turnaround_time_hours=24,
        parameters_count=78,
        sample_types="Blood (EDTA, Serum, Fluoride)",
        target_demographic="Adults 50+ years",
        is_popular=True,
        is_active=True
    )
    pkg2.tests.extend(created_tests[:9])
    db.add(pkg2)

    pkg3 = TestPackage(
        code="PKG-DIABETES",
        name="Advanced Diabetes Care & Vital Organs",
        category="Diabetes",
        tagline="Targeted monitoring for pre-diabetic & diabetic individuals",
        description="Comprehensive diabetic monitoring: HbA1c, Fasting Blood Glucose, Lipid Profile, Serum Creatinine, and Microalbuminuria risk assessment.",
        price=1199.0,
        market_price=2400.0,
        fasting_required=True,
        fasting_hours=10,
        preparation_instructions="10-12 hours fasting. Take morning insulin or diabetic tablets strictly after the phlebotomist draws blood.",
        turnaround_time_hours=12,
        parameters_count=32,
        sample_types="Blood (Fluoride, EDTA, Serum)",
        target_demographic="Individuals with Diabetes or family history",
        is_popular=True,
        is_active=True
    )
    pkg3.tests.extend([created_tests[1], created_tests[2], created_tests[3], created_tests[6]])
    db.add(pkg3)
    db.commit()

    # 4. Serviceable PIN codes
    pincodes_data = [
        {"pincode": "560001", "area_name": "MG Road / Ashok Nagar", "city": "Bengaluru", "state": "Karnataka", "estimated_transit_hours": 1.5},
        {"pincode": "560034", "area_name": "Koramangala", "city": "Bengaluru", "state": "Karnataka", "estimated_transit_hours": 1.5},
        {"pincode": "560038", "area_name": "Indiranagar", "city": "Bengaluru", "state": "Karnataka", "estimated_transit_hours": 2.0},
        {"pincode": "560102", "area_name": "HSR Layout", "city": "Bengaluru", "state": "Karnataka", "estimated_transit_hours": 2.0},
        {"pincode": "560100", "area_name": "Electronic City Phase 1", "city": "Bengaluru", "state": "Karnataka", "estimated_transit_hours": 2.5},
        {"pincode": "560066", "area_name": "Whitefield", "city": "Bengaluru", "state": "Karnataka", "estimated_transit_hours": 2.5},
        {"pincode": "560076", "area_name": "BTM Layout / Bannerghatta", "city": "Bengaluru", "state": "Karnataka", "estimated_transit_hours": 2.0},
        {"pincode": "110001", "area_name": "Connaught Place", "city": "New Delhi", "state": "Delhi", "estimated_transit_hours": 2.0},
        {"pincode": "400001", "area_name": "Fort / South Mumbai", "city": "Mumbai", "state": "Maharashtra", "estimated_transit_hours": 2.0},
        {"pincode": "500001", "area_name": "Abids / Koti", "city": "Hyderabad", "state": "Telangana", "estimated_transit_hours": 2.0},
        {"pincode": "411001", "area_name": "Camp / Pune Station", "city": "Pune", "state": "Maharashtra", "estimated_transit_hours": 2.0},
    ]
    for p in pincodes_data:
        sp_obj = ServiceablePincode(**p, is_active=True)
        db.add(sp_obj)
    db.commit()

    # 5. Coupons
    c1 = Coupon(
        code="CAREFIRST",
        description="15% discount on your first home collection booking",
        discount_percent=15.0,
        flat_discount=0.0,
        min_order_amount=500.0,
        max_discount_cap=300.0,
        is_active=True
    )
    c2 = Coupon(
        code="HEALTH500",
        description="Flat ₹500 off on any Comprehensive Health Package",
        discount_percent=0.0,
        flat_discount=500.0,
        min_order_amount=1999.0,
        max_discount_cap=500.0,
        is_active=True
    )
    c3 = Coupon(
        code="FREEDRAW",
        description="Free home collection charges",
        discount_percent=0.0,
        flat_discount=150.0,
        min_order_amount=300.0,
        max_discount_cap=150.0,
        is_active=True
    )
    db.add_all([c1, c2, c3])
    db.commit()

    # 6. Sample Customer Addresses
    addr1 = Address(
        user_id=cust1.id,
        address_type="Home",
        house_flat="Flat 402, Green Glen Palm Meadows",
        street="12th Main Road, 4th Block",
        area="Koramangala",
        city="Bengaluru",
        pincode="560034",
        landmark="Near Sony World Signal",
        latitude=12.9352,
        longitude=77.6245
    )
    db.add(addr1)
    db.commit()
    db.refresh(addr1)

    addr2 = Address(
        user_id=cust2.id,
        address_type="Home",
        house_flat="Villa 18, Prestige Oasis",
        street="Silver County Road",
        area="HSR Layout Sector 2",
        city="Bengaluru",
        pincode="560102",
        landmark="Opposite 24th Main BDA Complex",
        latitude=12.9116,
        longitude=77.6389
    )
    db.add(addr2)
    db.commit()
    db.refresh(addr2)

    # 7. Sample Bookings in Different Workflow Stages

    # A. COMPLETED Booking with Report Ready & PDF attached!
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    yesterday_str = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
    tomorrow_str = (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d")

    b1 = Booking(
        booking_code="CAH-2026-A8912",
        user_id=cust1.id,
        address_id=addr1.id,
        patient_name="Ananya Sharma",
        patient_age=32,
        patient_gender="Female",
        patient_phone="+91 99887 76655",
        patient_email="ananya.sharma@example.com",
        patient_notes="Prefer collection around 7:15 AM before leaving for office.",
        appointment_date=yesterday_str,
        appointment_time_slot="07:00 AM - 08:00 AM",
        status="REPORT_READY",
        subtotal=1499.0,
        collection_fee=0.0,
        discount_amount=224.85,
        total_amount=1274.15,
        coupon_code="CAREFIRST"
    )
    db.add(b1)
    db.commit()
    db.refresh(b1)

    bi1 = BookingItem(
        booking_id=b1.id,
        item_type="package",
        package_id=pkg1.id,
        item_name="CareAtHome Comprehensive Health Checkup",
        price=1499.0
    )
    db.add(bi1)

    p1 = Payment(
        booking_id=b1.id,
        user_id=cust1.id,
        razorpay_order_id="order_cah_a8912_mock",
        razorpay_payment_id="pay_cah_rzp_894129",
        razorpay_signature="simulated_test_sig_verified",
        amount=1274.15,
        status="SUCCESS",
        payment_method="UPI"
    )
    db.add(p1)

    sa1 = StaffAssignment(
        booking_id=b1.id,
        staff_id=sp1.id,
        assigned_at=datetime.utcnow() - timedelta(days=1, hours=4),
        accepted_at=datetime.utcnow() - timedelta(days=1, hours=3),
        completed_at=datetime.utcnow() - timedelta(days=1, hours=1),
        status="DELIVERED_TO_LAB",
        sample_barcode="SMPL-20261108-9842",
        vials_collected=3,
        tube_types="1x EDTA (Purple), 1x SST Gel (Yellow), 1x Fluoride (Grey)",
        temperature_maintained=True,
        phlebotomist_notes="Smooth venipuncture on left antecubital fossa. Cold pack temp verified at 4°C."
    )
    db.add(sa1)
    db.commit()

    # Generate real PDF report for b1!
    try:
        report_pdf_path, report_file_name, report_size = generate_blood_test_report_pdf(
            booking=b1,
            items=[bi1],
            output_dir=settings.REPORT_STORAGE_DIR,
            patient_info={
                "name": b1.patient_name,
                "age": b1.patient_age,
                "gender": b1.patient_gender,
                "phone": b1.patient_phone,
                "barcode": "SMPL-20261108-9842"
            }
        )
        rep1 = Report(
            booking_id=b1.id,
            user_id=cust1.id,
            file_path=report_pdf_path,
            file_name=report_file_name,
            file_size_bytes=report_size,
            lab_name=settings.PARTNER_LAB_NAME,
            verified_by_doctor="Dr. Ananya Roy, MD (Pathology)",
            doctor_registration="KMC-PATH-84291",
            is_verified=True,
            verification_notes="All parameters assayed on automated high-throughput chemiluminescence platforms. Results verified."
        )
        db.add(rep1)
        db.commit()
        print(f"Sample PDF report created at: {report_pdf_path}")
    except Exception as e:
        print(f"Warning: could not generate sample PDF report: {e}")

    # B. Active Booking: COLLECTION_IN_PROGRESS (Phlebotomist En Route today)
    b2 = Booking(
        booking_code="CAH-2026-C4410",
        user_id=cust2.id,
        address_id=addr2.id,
        patient_name="Vikram Mehta",
        patient_age=41,
        patient_gender="Male",
        patient_phone="+91 98220 33445",
        patient_email="vikram.mehta@example.com",
        patient_notes="Ringing bell twice, flat on second floor.",
        appointment_date=today_str,
        appointment_time_slot="08:00 AM - 09:00 AM",
        status="COLLECTION_IN_PROGRESS",
        subtotal=1149.0,
        collection_fee=0.0,
        discount_amount=0.0,
        total_amount=1149.0
    )
    db.add(b2)
    db.commit()
    db.refresh(b2)

    db.add(BookingItem(
        booking_id=b2.id,
        item_type="test",
        test_id=created_tests[0].id,
        item_name="Complete Blood Count (CBC)",
        price=350.0
    ))
    db.add(BookingItem(
        booking_id=b2.id,
        item_type="test",
        test_id=created_tests[3].id,
        item_name="Lipid Profile (Complete Cholesterol)",
        price=650.0
    ))
    db.add(BookingItem(
        booking_id=b2.id,
        item_type="test",
        test_id=created_tests[1].id,
        item_name="Blood Glucose (Fasting)",
        price=149.0
    ))

    db.add(Payment(
        booking_id=b2.id,
        user_id=cust2.id,
        razorpay_order_id="order_cah_c4410_mock",
        razorpay_payment_id="pay_cah_rzp_348912",
        razorpay_signature="simulated_test_sig_verified",
        amount=1149.0,
        status="SUCCESS",
        payment_method="NETBANKING"
    ))

    sa2 = StaffAssignment(
        booking_id=b2.id,
        staff_id=sp1.id,
        assigned_at=datetime.utcnow() - timedelta(hours=2),
        status="EN_ROUTE",
        phlebotomist_notes="En route on motorcycle with cold chain insulated ice box."
    )
    db.add(sa2)
    db.commit()

    # C. Tomorrow Booking: STAFF_ASSIGNED
    b3 = Booking(
        booking_code="CAH-2026-F9011",
        user_id=cust1.id,
        address_id=addr1.id,
        patient_name="Mrs. Sunita Sharma (Mother)",
        patient_age=64,
        patient_gender="Female",
        patient_phone="+91 99887 76655",
        patient_email="ananya.sharma@example.com",
        patient_notes="Senior citizen, please carry butterfly needle.",
        appointment_date=tomorrow_str,
        appointment_time_slot="06:30 AM - 07:30 AM",
        status="STAFF_ASSIGNED",
        subtotal=2499.0,
        collection_fee=0.0,
        discount_amount=500.0,
        total_amount=1999.0,
        coupon_code="HEALTH500"
    )
    db.add(b3)
    db.commit()
    db.refresh(b3)

    db.add(BookingItem(
        booking_id=b3.id,
        item_type="package",
        package_id=pkg2.id,
        item_name="Senior Citizen Complete Wellness Profile",
        price=2499.0
    ))

    db.add(Payment(
        booking_id=b3.id,
        user_id=cust1.id,
        razorpay_order_id="order_cah_f9011_mock",
        razorpay_payment_id="pay_cah_rzp_990141",
        razorpay_signature="simulated_test_sig_verified",
        amount=1999.0,
        status="SUCCESS",
        payment_method="CARD"
    ))

    db.add(StaffAssignment(
        booking_id=b3.id,
        staff_id=sp2.id,
        assigned_at=datetime.utcnow() - timedelta(hours=1),
        status="ASSIGNED"
    ))
    db.commit()

    # 8. Initial Notifications
    db.add(Notification(
        user_id=cust1.id,
        title="Diagnostic Report Ready",
        message="Your test report for CAH-2026-A8912 is verified and ready for download.",
        notification_type="REPORT",
        action_link="/dashboard"
    ))
    db.add(Notification(
        user_id=cust2.id,
        title="Phlebotomist is En Route",
        message="Rahul Verma is on the way for your blood collection scheduled today.",
        notification_type="BOOKING",
        action_link="/dashboard"
    ))
    db.commit()

    print("Database seeding completed successfully!")
    db.close()

if __name__ == "__main__":
    seed_database()

