# ORBYA TECH DIGITAL CAMPUS ERP — MASTER SYSTEM DOCUMENTATION & PORTAL MANUAL

---

## 📌 1. EXECUTIVE SYSTEM OVERVIEW

**ORBYA TECH Digital Campus ERP** is a Next.js enterprise-grade SaaS platform engineered for multi-tenant educational institutions in Nepal. It acts as a unified digital ecosystem connecting Students, Parents, Teachers, Administrators, and Executives while enforcing strict financial auditability and real-time operational transparency.

---

## ⚙️ 2. CORE SYSTEM ENGINES & INNOVATIONS

### A. 🛡️ Enterprise Financial Audit Workflow & Single Source of Truth
- Every financial transaction (Fee Payments, Scholarships, Staff Payroll, Refunds) emits an immutable event to the **Central Audit Engine**.
- Features a **Maker-Checker Verification Architecture**: Accounts Officers create transactions ("Makers"), which must be reviewed, verified, or rejected with remarks by the Accounts Head ("Checker").
- **Suspicious Activity Risk Engine**: Automatically monitors and flags duplicate payments, abnormal discounts, backdated entries, and unverified overrides with risk severity badges (**LOW**, **MEDIUM**, **HIGH**, **CRITICAL**).

### B. 📅 Dual Calendar Conversion Engine (AD / BS)
- Real-time bidirectional conversion between Gregorian (AD) and Bikram Sambat (BS) calendars (e.g., `2083 Asar 19 BS` ⇄ `July 4, 2026 AD`).
- Supports adjustable defaults for attendance marking, fee due dates, payroll generation, and exam schedules.

### C. 🔒 Admission Portal Lock & Academic Year Management
- **Principal Control Toggle**: Principal can toggle the Reception Admission Portal **ON** or **OFF** per Academic Year. When locked (`OFF`), Reception forms are automatically disabled and API submissions are rejected.
- **Academic Session Archiving**: Organize student batches by Academic Year (e.g. `2026/2027`, `2027/2028`).

### D. ⚡ Automated Entrance Rank Section Division & Custom Roll Number Generator
- **Rank-Based Balancing**: Principal inputs the department, shift, and number of sections (e.g., `2` for Section A & B). The system automatically sorts applicants by **Entrance Mark** (descending) and balances them into sections.
- **Custom Roll Number Format**: `{YY}{DeptCode}{ShiftCode}{4DigitSeq}` (e.g., `26SD0001` for 2026 Science Day, `26MM0002` for Management Morning).
- **Global Unique Sequence**: The 4-digit sequential integer (e.g., `0023`) is globally unique across the entire college and academic year. If `26SD0023` is assigned, `0023` is used up, preventing roll collision across departments.
- **Unassigned Late-Joiners Queue**: Dedicated workflow for late applicants who register after bulk allocation. Principal can manually assign sections and auto-generate the next global roll number.

### E. 🏢 Dynamic Department Management
- Principal can dynamically add new departments (e.g. Name: `Law`, Code: `L`) or delete existing ones.
- Reception portal automatically fetches authorized departments via `/api/departments` to populate registration dropdowns.

### F. 🎓 Authorized Scholarship Scheme Management
- Predefine authorized scholarship schemes (e.g., *District Topper - 50% Off*). Reception staff are restricted to selecting from authorized schemes; custom manual discounts are blocked. Every grant emits a `SCHOLARSHIP_GRANTED` audit event.

---

## 🏛️ 3. ALL 12 ROLE-BASED PORTALS & PERMISSION MATRIX

---

### 1. 🏫 PRINCIPAL PORTAL
* **Route URLs:** `/portal/principal` or `/portal/principal/[subPage]`
* **Navbar & Sidebar Links:** `Overview`, `Admissions Approval`, `Admission Portal & Years`, `Auto Section Allocator`, `Late Joiners Queue`, `Staff Management`, `Payroll Overview`, `Scholarship Schemes`, `Academic Audit`, `Attendance Monitor`, `Complaints`, `Notices`

#### Core Capabilities:
- **Admission Portal Control**: Toggle Reception Admission Portal `ON` or `OFF`. Create new Academic Years.
- **Dynamic Department Manager**: Add/delete academic departments and assign department codes.
- **Automated Section Allocator**: Divide applicants into `N` sections by Entrance Mark rank and generate custom global roll numbers (`26SD0001`).
- **Unassigned Late-Joiners Queue**: Assign sections and auto-next roll numbers for late applicants.
- **Admissions Approval Queue**: Review student registrations from Reception (including scholarship requests) and click **Approve** or **Reject**.
- **Staff Account Provisioning**: Create employee accounts (Teachers, Reception, Accounts, HR) with assigned Employee IDs and Base Salaries.
- **Payroll & Salary Overview**: Read-only tracking of campus payroll and payment confirmation status.
- **Scholarship Schemes**: Manage authorized discount programs.
- **Complaints & Notices**: Resolve student/staff complaints and broadcast notices with attachments.

---

### 2. 🏛️ VICE PRINCIPAL PORTAL
* **Route URLs:** `/portal/vp` or `/portal/vp/[subPage]`
* **Navbar & Sidebar Links:** Mirrors Principal Portal capabilities for secondary administrative command.

#### Core Capabilities:
- Monitor Academic Audits, Attendance Ratios, Admissions Approvals, Staff lists, Payroll summaries, and Campus Notices.

---

### 3. 🛋️ RECEPTION & FRONT DESK PORTAL
* **Route URLs:** `/portal/reception` or `/portal/reception/[subPage]`
* **Navbar & Sidebar Links:** `Register Student`, `All Students`, `Attendance Monitor`, `Absent Today`

#### Core Capabilities:
- **Student Registration**: Register incoming students with **Department**, **Shift**, **SEE GPA**, and **Entrance Mark**. (Blocked if Principal locks portal).
- **Authorized Scholarship Selection**: Select pre-approved scholarship schemes during registration.
- **Visitor Logs**: Record guest visits, host staff, visit purpose, and manage check-outs.
- **Enquiries & Gate Passes**: Log prospective student leads and issue student/staff gate passes.
- **Attendance Roster**: View daily present/absent counts across class sections.

---

### 4. 💳 ACCOUNTS HEAD PORTAL
* **Route URLs:** `/portal/accounts-head`
* **Navbar & Sidebar Links:** `Financials Overview`, `Payment Desk`, `Fee Structure`, `Salary Management`, `Notices`

#### Core Capabilities:
- **Maker-Checker Verification Center**: Review pending payments created by Accounts Officers; **Approve**, **Reject**, or request clarifications with audit notes.
- **13 Sub-Tab Financial Audit Center**: Audit Dashboard, Transaction Audit, Approval Center, Audit Trail Logs, Financial Reports (PDF/Excel exports), Cash Reconciliation, Bank Reconciliation, Scholarship Audit, Refund Audit, Financial Analytics, Compliance Alerts, Document Vault, and Suspicious Activities Risk Engine.
- **Fee Structure Manager**: Create class-wise or program-wide fee structures (Tuition, Exam, Transport).
- **Automated Monthly Payroll**: Auto-generate monthly staff salary slips on the 1st of every month.

---

### 5. 💰 ACCOUNTS OFFICER PORTAL
* **Route URLs:** `/portal/accounts-officer`
* **Navbar & Sidebar Links:** `Financials Overview`, `Payment Desk`, `Fee Structure`, `Salary Management`, `Notices`

#### Core Capabilities:
- **Payment Collection Counter**: Select student fee allocations, record collected amount, payment method (`CASH`, `ONLINE`, `BANK_TRANSFER`), transaction ID, and BS date (`2083-03-17`).
- **Student Fee Ledgers**: View itemized student billing history and generate printable receipts.
- **Staff Payroll Entry**: Input basic pay, allowances, and deductions to create individual salary slips.

---

### 6. 🎓 STUDENT PORTAL
* **Route URLs:** `/portal/student` or `/portal/student/[subPage]`
* **Navbar & Sidebar Links:** `Dashboard`, `My Attendance`, `Exams & Routine`, `Study Materials`, `Fee Payments`, `Notice Board`, `My Complaints`

#### Core Capabilities:
- **Personal Dashboard**: View roll number, class section, term info, attendance %, and fee balance.
- **Official Printable Invoice & Bill**: View itemized fee breakdowns and generate official college invoice bills with QR code verification.
- **Official Transcript & Grade Card**: View terminal exam marks, letter grades (`A+`, `A`, `B`), and GPA (`3.92`).
- **Exam Seat Assignments**: View exam room number, bench number, and routine.
- **Study Materials Downloader**: Access and download course PDFs/notes uploaded by teachers.
- **Complaints & Notices**: Submit grievances to Principal and view campus announcements.

---

### 7. 👨‍👩‍👧 PARENT PORTAL
* **Route URLs:** `/portal/parent` or `/portal/parent/[subPage]`
* **Navbar & Sidebar Links:** `Student Info`, `Attendance Monitor`, `Exam Schedules`, `Fee Statements`, `Notices`

#### Core Capabilities:
- **Ward Academic Monitor**: Track child's attendance percentage, exam grades, and terminal GPA.
- **Ward Fee Statements & Bills**: Download official college invoice bills and view payment receipt history.
- **Exam Schedules & Seats**: Check child's exam dates and seating arrangements.

---

### 8. 👨‍🏫 TEACHER PORTAL
* **Route URLs:** `/portal/teacher` or `/portal/teacher/[subPage]`
* **Navbar & Sidebar Links:** `My Classes`, `Upload Materials`, `Salary Slips`, `Notices`, `My Profile`

#### Core Capabilities:
- **Classroom Attendance Sheet**: Select class section and mark students `PRESENT`, `ABSENT`, or `LATE`.
- **Grade & Mark Entry**: Select student and subject to input terminal examination marks.
- **Study Material Uploader**: Upload course syllabus notes and assignment PDFs (up to 5MB) for students.
- **Salary Slip Inspector**: View personal monthly salary breakdown and net pay.

---

### 9. 👔 HR PORTAL
* **Route URLs:** `/portal/hr` or `/portal/hr/[subPage]`
* **Navbar & Sidebar Links:** `HR Dashboard`, `Employee Records`, `Staff Attendance`, `Notice Board`

#### Core Capabilities:
- **Employee Registry**: Manage staff records, employee IDs, departments, and active employment status.
- **Staff Attendance**: Monitor daily check-in and check-out logs for teachers and administrative staff.

---

### 10. 📚 LIBRARIAN PORTAL
* **Route URLs:** `/portal/librarian` or `/portal/librarian/[subPage]`
* **Navbar & Sidebar Links:** `Librarian Portal`, `Book Management`, `Notice Board`

#### Core Capabilities:
- **Book Inventory**: Add, search, and update library catalog by ISBN or title.
- **Issue & Return Desk**: Process book checkouts for students/teachers and log returned books.
- **Overdue Fines**: Monitor late returns and record overdue fine payments.

---

### 11. 📝 EXAM DEPARTMENT PORTAL
* **Route URLs:** `/portal/exam-dept` or `/portal/exam-dept/[subPage]`
* **Navbar & Sidebar Links:** `Exam Dashboard`, `Exams Scheduling`, `Seat Allocations`, `Notice Board`

#### Core Capabilities:
- **Exam Scheduling**: Create terminal examination timetables, subject dates, and durations.
- **Seat Allocation Matrix**: Assign exam halls, bench capacities, and auto-generate student seating plans.

---

### 12. ⚙️ SYSTEM ADMIN PORTAL
* **Route URLs:** `/portal/admin` or `/portal/admin/[subPage]`
* **Navbar & Sidebar Links:** `Admin Dashboard`, `User Management`, `College Config`, `Security Logs`, `Notice Board`

#### Core Capabilities:
- **User Management**: Create, edit, deactivate, or reset passwords for users across all 12 roles.
- **System Settings & Audit Logs**: Configure college details, date preferences, and inspect security access logs.

---

## 🌐 4. COMPLETE API ROUTE MATRIX

| Endpoint | Method(s) | Description / Target Action |
| :--- | :--- | :--- |
| `/api/auth/login` | `POST` | User authentication & JWT cookie issuance (with offline mock fallback). |
| `/api/auth/me` | `GET` | Retrieve logged-in user profile & role capabilities. |
| `/api/auth/logout` | `POST` | Clear session cookie. |
| `/api/principal/academic-year` | `GET`, `POST`, `PATCH` | Manage Academic Years & toggle Reception Admission Portal (ON/OFF). |
| `/api/principal/sections/allocate` | `POST` | Rank applicants by Entrance Mark, divide into sections, and generate custom roll numbers. |
| `/api/principal/sections/unassigned`| `GET`, `PATCH` | Fetch unassigned late joiners & assign section + next global roll. |
| `/api/principal/admissions` | `GET`, `PATCH` | Fetch pending student registrations & approve/reject admissions. |
| `/api/principal/staff` | `GET`, `POST` | Manage staff accounts and provision credentials with base salary. |
| `/api/departments` | `GET`, `POST`, `DELETE` | Dynamic department management (Name & Code). |
| `/api/reception/register` | `GET`, `POST` | Front-desk student registration with SEE GPA, Entrance Mark, Dept, & Shift. |
| `/api/reception/attendance` | `GET` | Fetch daily attendance logs & summary metrics. |
| `/api/reception` | `GET`, `POST` | Visitor logs, enquiries, and gate pass management. |
| `/api/fees` | `GET`, `POST` | Fee allocations, payment collection counter, structures, and student ledgers. |
| `/api/salaries` | `GET`, `POST` | Manage staff salary slips & payroll distribution. |
| `/api/salaries/generate-monthly` | `POST` | Auto-generate monthly payroll for all registered staff. |
| `/api/scholarship-schemes` | `GET`, `POST`, `DELETE` | Predefine authorized financial scholarship programs. |
| `/api/financial-audit` | `GET`, `POST` | Maker-checker transaction verification, audit trails, and risk engine. |
| `/api/attendance` | `GET`, `POST` | Classroom student attendance marking. |
| `/api/exams` | `GET`, `POST` | Exam schedules, grade entry, and room seating plan generation. |
| `/api/study-materials` | `GET`, `POST`, `DELETE` | Upload & download course study notes and assignment PDFs. |
| `/api/notices` | `GET`, `POST`, `DELETE` | Broadcast campus announcements with PDF attachments. |
| `/api/complaints` | `GET`, `POST`, `PATCH` | Student & staff grievance filing and Principal resolution tracking. |

---

## 💾 5. DATABASE SCHEMAS & MOCK FALLBACK FILE MATRIX

### Prisma Database Models:
- `User`, `College`, `Student`, `Parent`, `Teacher`, `Staff`, `Class`, `Subject`
- `FeeStructure`, `FeeAllocation`, `Payment`, `SalarySlip`, `SalaryAutoConfig`
- `Attendance`, `Exam`, `Result`, `ExamSeat`, `StudyMaterial`, `Notice`, `Complaint`
- `AuditLog`, `ScholarshipScheme`, `AcademicYear`, `Department`, `VisitorLog`, `Enquiry`

### Offline Mock Fallback Files (`src/lib/`):
- `mockStudentRegistrations.json`: Stores reception registrations, SEE GPA, entrance mark, department, section, and roll number.
- `mockAcademicYears.json`: Stores academic sessions and admission portal toggle status (`isAdmissionOpen`).
- `mockDepartments.json`: Stores dynamic department names and codes.
- `mockScholarshipSchemes.json`: Stores authorized financial schemes.
- `mockFeeAllocations.json` & `mockPayments.json`: Stores billing ledger and payment receipts.
- `mockFinancialAudit.json`: Stores audit trail events and risk engine logs.
- `mockSalarySlips.json` & `mockSalaryAutoConfigs.json`: Stores payroll slips.
- `mockNotices.json` & `mockStudyMaterials.json`: Stores announcements and course documents.
