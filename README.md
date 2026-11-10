# CareAtHome - Healthcare That Comes To You

> Modern, professional, full-stack home blood sample collection and diagnostic testing platform tailored for India.

[![Stack](https://img.shields.io/badge/Stack-Next.js%2014%20%7C%20FastAPI%20%7C%20PostgreSQL-teal)](https://github.com)
[![Currency](https://img.shields.io/badge/Currency-INR%20(%E2%82%B9)-emerald)](https://github.com)
[![Accreditation](https://img.shields.io/badge/Partners-NABL%20Accredited-blue)](https://github.com)

---

## 1. Project Concept & Architecture

**CareAtHome** enables patients to book diagnostic blood tests and full-body health packages from the comfort of their home. A qualified, certified phlebotomist visits the customer's residence at their chosen time slot, draws samples using sterile single-use vacuum collection tubes and painless butterfly needles, verifies cold-chain temperature (2-8°C), and transports specimens directly to accredited partner reference laboratories.

Once automated laboratory assays and pathologist verification are complete, customers securely view and download official digital PDF test reports online.

### Core Ecosystem
- **Customer Portal**: Search 50+ blood tests, health packages, live PIN code serviceability check, 6-step booking wizard with Razorpay integration, live 8-stage diagnostic status tracker, and secure PDF report downloads.
- **Collection Professional Portal**: Phlebotomist dashboard with assigned visits, Google Maps routing, patient preparation instructions checklist, barcoded sample intake, and cold-chain temperature verification.
- **Admin & Pathology Console**: Live analytics with interactive charts (revenue, status breakdown, monthly trends), staff dispatching, manual status updates, test catalogue management, serviceable PIN codes manager, and 1-click clinical NABL PDF report generation.

---

## 2. Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (clean white aesthetic, teal `#0d9488` and emerald `#059669` medical accents, rounded cards)
- **Icons**: Lucide React
- **Analytics Charts**: Recharts
- **Celebration Effects**: Canvas Confetti

### Backend
- **Framework**: Python FastAPI (REST APIs, asynchronous request handling)
- **Database ORM**: SQLAlchemy 2.0 (PostgreSQL ready, defaults to SQLite for instant out-of-the-box local running)
- **Data Validation**: Pydantic v2
- **Authentication**: JWT with HS256 & bcrypt password hashing
- **Report Generation**: ReportLab (clinical NABL-standard diagnostic PDF generation)

### Third-Party & Payment Integrations
- **Payment Gateway**: Razorpay (UPI, Debit/Credit Cards, Net Banking) with automated signature verification and offline sandbox test fallback
- **Location & Geolocation**: Google Maps direction routes and coordinates
- **Notifications**: Automated in-app alerts and SMS/Email log dispatching

---

## 3. Pre-Seeded Demo Credentials

The platform comes pre-seeded with diagnostic tests (CBC, Lipid, HbA1c, Thyroid, Vitamin D & B12, LFT, KFT), health packages, serviceable PIN codes, and 3 distinct user roles.

Use the built-in **Quick Role Switcher** in the navigation bar or log in with the credentials below:

| Role | Email | Password | Persona & Territory |
|------|-------|----------|---------------------|
| **Patient / Customer** | `ananya.sharma@example.com` | `Customer@123` | Ananya Sharma (Koramangala, Bengaluru). Has pre-generated verified PDF report ready to download. |
| **Phlebotomist / Staff** | `rahul.phlebo@careathome.in` | `Staff@123` | Rahul Verma (DMLT / Certified Phlebotomist, 4.98 rating). View assigned route & scan barcodes. |
| **Administrator / MD** | `admin@careathome.in` | `Admin@123` | Dr. Vikramaditya (Central Medical Operations). Revenue charts, staff assigner, instant PDF generator. |

---

## 4. Local Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### A. Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. (Optional) Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Initialize database and seed initial medical catalogue
python -m backend.app.seed

# 5. Start the FastAPI backend server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

The REST API will be live at:
- **API Root**: `http://127.0.0.1:8000/api`
- **Swagger Documentation**: `http://127.0.0.1:8000/docs`
- **Health Check**: `http://127.0.0.1:8000/api/health`

---

### B. Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 5. End-to-End User Workflows

### Workflow 1: Customer Booking & Payment
1. Open `http://localhost:3000/tests`.
2. Browse blood tests or comprehensive health checkup packages.
3. Click **Add to Cart** or **Book Test**.
4. Open the slide-out cart drawer, review selection, apply coupon `CAREFIRST` (15% off) or `HEALTH500` (₹500 off packages).
5. Click **Proceed to Home Booking** (`/book`):
   - **Step 1**: Review tests.
   - **Step 2**: Enter patient information (name, age, phone, fasting notes).
   - **Step 3**: Enter collection address & PIN code (live serviceability verified).
   - **Step 4**: Select morning appointment date and 1-hour time slot.
   - **Step 5**: View transparent financial breakdown in INR (₹).
   - **Step 6**: Complete Razorpay test checkout (UPI/Card/Netbanking).
6. Receive unique booking reference code (`CAH-2026-XXXX`).

### Workflow 2: Collection Staff (Phlebotomist) Visit
1. Switch to Phlebotomist role (`rahul.phlebo@careathome.in` or via Quick Switcher).
2. Visit `/staff` to view assigned home collections for today.
3. Click **Google Maps** to launch navigation route to patient's address.
4. Click **Start Journey (En Route)** &mdash; updates booking status to `COLLECTION_IN_PROGRESS`.
5. Arrive at patient home, click **Record Sample Collection**:
   - Scans or inputs unique sample barcode (`SMPL-YYYYMMDD-XXXX`).
   - Verifies 2-8°C cold box temperature.
   - Submits clinical draw notes.
6. Click **Transfer Sample to Lab** once specimen reaches partner reference laboratory.

### Workflow 3: Medical Operations & Report Delivery
1. Switch to Administrator console (`/admin`).
2. View real-time revenue analytics, monthly trend lines, and status breakdown.
3. Under the **Bookings** tab:
   - Assign available phlebotomists to new appointments.
   - Click **⚡ Generate PDF Report** for completed bookings.
   - An authentic, clinical NABL diagnostic test report is compiled in ReportLab with laboratory benchmarks, reference intervals, and digital pathologist signature.
4. Patient immediately receives in-app alert and can download their official PDF report from `/dashboard`.

---

## 6. Database Schema Design

The application implements a robust relational schema with 14 tables:
- `users`: Core authentication, hashed credentials, roles (`customer`, `staff`, `admin`).
- `customer_profiles`: Blood group, emergency contact, date of birth.
- `staff_profiles`: Qualification (DMLT/BMLT), license number, service territory, rating.
- `tests`: Diagnostic tests, parameters, fasting requirements, tube type, pricing.
- `test_packages`: Preventive packages, parameter counts, included tests.
- `package_tests`: Many-to-many association mapping tests to packages.
- `addresses`: Structured Indian addresses with PIN codes and GPS coordinates.
- `bookings`: Master booking record, patient demographics, slot, status, coupon.
- `booking_items`: Selected tests and packages per booking.
- `staff_assignments`: Phlebotomist assignments, barcode, vial count, temperature check.
- `payments`: Razorpay orders, payment signatures, status (`SUCCESS`, `REFUNDED`).
- `reports`: NABL laboratory reports, file metadata, pathologist registration number.
- `serviceable_pincodes`: Serviceable Indian postal codes and transit hours.
- `coupons`: Promotional discount coupons with order caps and validation.
- `notifications`: In-app alerts for booking status and report ready events.
- `audit_logs`: Detailed operational logging for security and compliance.

---

## 7. Deployment Instructions

### Deploy Frontend to Vercel
1. Push this repository to GitHub/GitLab.
2. In the Vercel dashboard, click **Import Project** and set root directory to `frontend`.
3. Add environment variable:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
   ```
4. Deploy.

### Deploy Backend to Railway / Render / AWS
1. Set root directory to `backend`.
2. Configure environment variables in `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   SECRET_KEY=your_production_secret_key_here
   RAZORPAY_KEY_ID=your_live_or_test_key_id
   RAZORPAY_KEY_SECRET=your_live_or_test_secret
   ```
3. Start command:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

### Docker Deployment
Run both frontend, backend, and PostgreSQL in one command:
```bash
docker-compose up --build
```

---

## 8. Clinical Compliance & Partner Lab Disclosure

- **Partner Laboratory Model**: Diagnostic assays are conducted exclusively in facilities holding ISO 15189:2012 accreditation and certified by the National Accreditation Board for Testing and Calibration Laboratories (NABL).
- **Cold-Chain Transport**: Blood samples are carried in validated thermal insulation boxes between 2°C to 8°C with frozen gel packs to preserve analyte stability.
- **Biomedical Waste**: Phlebotomists use single-use needle-locking vacutainer holders and puncture-resistant sharps disposal boxes.
- **Digital Signatures**: Reports are digitally signed and verifiable under the Information Technology Act, 2000.

#
#   C a r e A t H o m e  
 