# ORBYA TECH DIGITAL CAMPUS ERP - DEFINITIVE PORTAL WORKFLOW, API & DATABASE MATRIX

> 📖 **Master System Documentation**: For the complete system manual covering all 12 portals, dynamic roll generation algorithms, admission portal toggles, and financial audit engines, see [COLLEGE_ERP_SYSTEM_DOCUMENTATION.md](file:///Users/vivek/Desktop/collegeerp/COLLEGE_ERP_SYSTEM_DOCUMENTATION.md).

This document is the **definitive, end-to-end reference guide** for every single section and sub-tab across all **12 Role-Based Portals** in the Digital Campus ERP system. It details:
1. **How every section works (Workflow & Business Logic)**
2. **API Route Endpoints & HTTP Methods (`GET`, `POST`, `PUT`, `DELETE`)**
3. **Database Tables (Prisma Models)**
4. **Offline Mock Fallback JSON Storage Files**

---

## 🏛️ SECTION-BY-SECTION WORKFLOW, API & DATABASE MATRIX

---

### 1. 💳 ACCOUNTS HEAD & OFFICER PORTAL
* **Component File:** `src/components/portals/AccountsDashboard.tsx`
* **Route URLs:** `/portal/accounts-head` or `/portal/accounts-officer`

#### A. Cashier Dashboard Section
* **How it Works:** Renders top stats cards (Monthly Collections, Pending Bills Dues, Average Salary Payroll) and displays a full-width **Student Fee Allocations & Bills Ledger** table. Officers can view outstanding bill balances per student and filter allocations by class program.
* **API Route:** `GET /api/fees?mode=allocations`
* **Database Models:** `FeeAllocation`, `Student`, `Class`, `FeeStructure`
* **Mock Fallback Storage:** `src/lib/mockFeeAllocations.json`

#### B. Receive Payment Counter Section
* **How it Works:** Cashier payment collection desk. Officer selects a student allocation bill, enters the collected amount, selects payment method (`CASH`, `ONLINE`, `BANK_TRANSFER`), inputs optional reference transaction IDs, and enters the Nepali BS payment date (`2083-03-17`). Clicking **Process Payment** creates a payment receipt record, updates the allocation status (`PAID` or `PARTIAL`), and updates the **Recent 10 Bills / Receipts Created** table right below the form.
* **API Route:** `POST /api/fees` (with body `{ allocationId, amount, paymentMethod, transactionId, paymentDateBS }`)
* **Database Models:** `Payment`, `FeeAllocation`, `User`
* **Mock Fallback Storage:** `src/lib/mockPayments.json`, `src/lib/mockFeeAllocations.json`

#### C. Billing Registry & Ledgers Section
* **How it Works:** Full historical financial ledger. Features advanced search (student name, receipt number) and filters (payment method, confirmation status, class section). Displays **All Receipts & Transaction Log** and **Class-wise Student Fee Ledgers**. Clicking **Collect** opens an overlay modal popup pre-filled with the student's bill for instant payment processing.
* **API Route:** `GET /api/fees?mode=history`, `GET /api/fees?mode=allocations`
* **Database Models:** `Payment`, `FeeAllocation`, `Student`, `Class`
* **Mock Fallback Storage:** `src/lib/mockPayments.json`, `src/lib/mockFeeAllocations.json`

#### D. Fee Structures Manager Section
* **How it Works:** Allows the Accounts Head to generate new class-wise or program-wide fee structures (e.g. *Tuition Fee - Shrawan 2083*, *Exam Fee Term 1*). Specifying title, amount in NPR, due date in BS format, and target class section automatically allocates the fee bills to all enrolled students in that class.
* **API Route:** `GET /api/fees?mode=structures`, `POST /api/fees` (with body `{ action: 'CREATE_STRUCTURE', title, amount, dueDateBS, classId }`)
* **Database Models:** `FeeStructure`, `FeeAllocation`, `Class`
* **Mock Fallback Storage:** `src/lib/mockFeeStructures.json`, `src/lib/mockFeeAllocations.json`

#### E. Salaries & Payroll Desk Section
* **How it Works:** Monthly staff payroll workspace. Accounts Officers can enter employee IDs, basic pay, allowances, and deductions to generate employee salary slips. Features an automatic background job (`POST /api/salaries/generate-monthly`) that auto-generates monthly payroll for all registered teachers and staff on the 1st of every month.
* **API Route:** `GET /api/salaries`, `POST /api/salaries`, `POST /api/salaries/generate-monthly`
* **Database Models:** `SalarySlip`, `User`, `Teacher`, `Staff`
* **Mock Fallback Storage:** `src/lib/mockSalarySlips.json`, `src/lib/mockSalaryAutoConfigs.json`

#### F. Financial Audit & Maker-Checker Verification Center (13 Sub-Tabs)
* **How it Works:** Internal financial control and auditing module for the Accounts Head containing 13 sub-tabbed views:
  1. **Audit Dashboard:** Daily/monthly gross revenue, collection achievement % progress bar, cash vs. digital payment distributions.
  2. **Transaction Audit:** Full audit table with receipt search and multi-field filters (Date, Dept, Program, Method, Status).
  3. **Approval Center (Maker-Checker):** Verification workspace for Accounts Head to **Approve**, **Reject**, or **Request Clarification** with auditor remarks for transactions initiated by Accounts Officers.
  4. **Audit Trail Logs:** Immutable audit log timeline recording User, Role, Action, Old/New Values, Timestamp, IP Address, OS, Reason.
  5. **Financial Reports:** Financial report generator for Daily, Weekly, Monthly, Quarterly, Yearly, Refund, and Scholarship reports with **PDF**, **Excel**, **CSV**, **Print** export capability.
  6. **Cash Reconciliation:** Daily counter cash tracking (Cash Collected vs. Cash Deposited vs. Difference with `BALANCED` / `DISCREPANCY` status).
  7. **Bank Reconciliation:** Bank statement ledger matching matrix highlighting matched and unmatched items.
  8. **Scholarship Audit:** Audit table for student scholarships, discount percentages, approvers, and reasons.
  9. **Refund Audit:** Audit table for refund approvals, payment references, and dates.
  10. **Financial Analytics:** Visual analytics for YoY revenue growth (+14.2%) and fee recovery rate (91.8%).
  11. **Compliance & Alerts:** Monitor unverified transactions, overdue approvals, missing receipts, and financial alerts.
  12. **Document Vault:** Repository for Invoices, Receipts, Bank Slips, Audit Reports, Vendor Bills, and Payment Proofs.
  13. **Suspicious Activities:** Automated Risk Engine monitor flagging duplicate payments, unusual discounts, backdated entries, and Risk Level Badges (**LOW**, **MEDIUM**, **HIGH**, **CRITICAL**).
* **API Route:** `GET /api/financial-audit?mode=[submode]`, `POST /api/financial-audit` (body `{ action: 'VERIFY_TRANSACTION', transactionId, status, remarks }`)
* **Database Models:** `AuditLog`, `Payment`, `FeeAllocation`, `User`, `College`
* **Mock Fallback Storage:** `src/lib/mockFinancialAudit.json`

---

### 2. 🎓 STUDENT PORTAL
* **Component File:** `src/components/portals/StudentDashboard.tsx`
* **Route URLs:** `/portal/student` or `/portal/student/[subpage]`

#### A. Dashboard Home Section
* **How it Works:** Displays the student's profile (Roll number, Class section, Term), daily attendance percentage badge, fee balance summary, and quick access buttons to download syllabi or view notices.
* **API Route:** `GET /api/auth/me`, `GET /api/fees?mode=allocations`
* **Database Models:** `Student`, `User`, `Class`
* **Mock Fallback Storage:** `src/lib/mockFeeAllocations.json`

#### B. Student Fee Portal Section (2 Sub-Tabs)
* **How it Works:**
  * **Sub-tab 1: Fee Ledger Status:** Displays itemized billing details (tuition, exam, transport), paid amount, due balance, and an **Official Printable Invoice Bill** button. Clicking triggers a popup modal rendering an official college invoice complete with bill itemization, payment status, and QR code verification.
  * **Sub-tab 2: Payment Receipts Log:** Displays receipt numbers, payment dates, amounts, payment methods (e.g. eSewa, Bank, Cash), and confirmation status (`CONFIRMED`).
* **API Route:** `GET /api/fees?studentId=[id]&mode=allocations`, `GET /api/fees?mode=history`
* **Database Models:** `FeeAllocation`, `Payment`, `Student`
* **Mock Fallback Storage:** `src/lib/mockFeeAllocations.json`, `src/lib/mockPayments.json`

#### C. Examinations Desk Section (2 Sub-Tabs)
* **How it Works:**
  * **Sub-tab 1: Academic Results:** Exam term selector (*First Term 2083*). Displays subject marks, total marks, percentage, letter grades (`A+`, `A`, `B`), and calculated GPA (`4.0`, `3.6`).
  * **Sub-tab 2: Seat Assignment:** Displays room seat allocations for upcoming terminal exams, showing room number, bench number, roll number, and exam date.
* **API Route:** `GET /api/exams?studentId=[id]&mode=results`
* **Database Models:** `Result`, `ExamSeat`, `Exam`, `Subject`
* **Mock Fallback Storage:** Direct API fallback response

#### D. Study Materials Desk Section
* **How it Works:** Lists subject-wise study notes, homework assignments, and reference PDFs uploaded by course teachers. Students click **Download PDF** to access the documents.
* **API Route:** `GET /api/study-materials`
* **Database Models:** `StudyMaterial`, `Subject`, `User`
* **Mock Fallback Storage:** `src/lib/mockStudyMaterials.json`

#### E. Campus Notice Board Section
* **How it Works:** Lists announcements broadcasted by the Principal or administration. Displays notice title, publish date, target audience, content body, and downloadable file attachments.
* **API Route:** `GET /api/notices`
* **Database Models:** `Notice`, `User`
* **Mock Fallback Storage:** `src/lib/mockNotices.json`

#### F. Grievances & Complaints Section
* **How it Works:** Form allowing students to submit grievances or complaints directly to the Principal. Displays complaint title, description, category, submission date, and resolution status (`OPEN`, `UNDER_INVESTIGATION`, `RESOLVED`).
* **API Route:** `GET /api/complaints`, `POST /api/complaints` (body `{ title, description, category }`)
* **Database Models:** `Complaint`, `Student`, `User`
* **Mock Fallback Storage:** Direct API fallback response

---

### 3. 👨‍👩‍👧 PARENT PORTAL
* **Component File:** `src/components/portals/ParentDashboard.tsx`
* **Route URLs:** `/portal/parent` or `/portal/parent/[subpage]`

#### A. Parent Dashboard Home Section
* **How it Works:** Overview card showing the child's academic profile, current attendance percentage, outstanding fee summary, and recent exam grade badges.
* **API Route:** `GET /api/auth/me`
* **Database Models:** `Parent`, `Student`, `User`
* **Mock Fallback Storage:** Direct API fallback response

#### B. Ward Fee Detail Desk Section
* **How it Works:** Shows fee breakdown for tuition, exam, and transport fees, paid receipt history, and provides the **Printable Ward Invoice Bill Modal** for downloading official payment receipts.
* **API Route:** `GET /api/fees?studentId=[childId]`
* **Database Models:** `FeeAllocation`, `Payment`, `Student`
* **Mock Fallback Storage:** `src/lib/mockFeeAllocations.json`, `src/lib/mockPayments.json`

#### C. Ward Examinations Desk Section (2 Sub-Tabs)
* **How it Works:**
  * **Sub-tab 1: Academic Results:** View child's subject-wise marks, letter grades, and GPA per terminal exam.
  * **Sub-tab 2: Seat Assignment:** View room number, bench location, and exam dates for child's upcoming exams.
* **API Route:** `GET /api/exams?studentId=[childId]`
* **Database Models:** `Result`, `ExamSeat`, `Subject`
* **Mock Fallback Storage:** Direct API fallback response

#### D. Ward Attendance Logs Section
* **How it Works:** View daily presence/absence logs for the child updated by class teachers.
* **API Route:** `GET /api/attendance?studentId=[childId]`
* **Database Models:** `Attendance`, `Student`
* **Mock Fallback Storage:** Direct API fallback response

---

### 4. 👨‍🏫 TEACHER PORTAL
* **Component File:** `src/components/portals/TeacherDashboard.tsx`
* **Route URLs:** `/portal/teacher` or `/portal/teacher/[subpage]`

#### A. Dashboard Home Section (4 Inner Sub-Tabs)
* **How it Works:** Displays assigned subjects and class stats, with a 4-tab switcher:
  * **Tab 1: Attendance Sheet:** Select class section and attendance date in BS format. Displays student roster with toggle buttons to mark status as `PRESENT`, `ABSENT`, or `LATE`.
  * **Tab 2: Enter Marks:** Select student name and subject. Enter marks, remarks, and submit terminal grades.
  * **Tab 3: Notices:** View campus announcements broadcasted by the Principal.
  * **Tab 4: Salary Slip:** View teacher's monthly basic pay, allowances, deductions, and net salary.
* **API Route:** `GET /api/attendance`, `POST /api/attendance`, `POST /api/exams`, `GET /api/salaries`
* **Database Models:** `Teacher`, `Attendance`, `Result`, `SalarySlip`, `Subject`
* **Mock Fallback Storage:** `src/lib/mockSalarySlips.json`, `src/lib/mockNotices.json`

#### B. Upload Study Materials Section
* **How it Works:** Teacher selects target class section and subject, enters document title and description, attaches a file (PDF/DOCX up to 5MB), and clicks **Publish Study Material**. The file becomes immediately available on the Student Portal.
* **API Route:** `GET /api/study-materials`, `POST /api/study-materials` (body `{ title, description, subjectId, fileData, fileName }`)
* **Database Models:** `StudyMaterial`, `Subject`, `User`
* **Mock Fallback Storage:** `src/lib/mockStudyMaterials.json`

---

### 5. 🏫 PRINCIPAL PORTAL
* **Component File:** `src/components/portals/PrincipalDashboard.tsx`
* **Route URLs:** `/portal/principal` or `/portal/principal/[subpage]`

#### A. Campus Command Center Section (2 Inner Sub-Tabs)
* **How it Works:** Displays active student body metrics, daily attendance average %, and total fee receipts, with 2 sub-tabs:
  * **Tab 1: Complaints & Resolutions:** List of student and staff complaints. Principal can view details, update status (`IN_PROGRESS`, `RESOLVED`), and enter official resolution notes.
  * **Tab 2: Publish Notice:** Form to broadcast announcements to target audiences (`ALL`, `STUDENTS`, `TEACHERS`, `PARENTS`). Supports text content and PDF file attachments.
* **API Route:** `GET /api/complaints`, `POST /api/complaints`, `GET /api/notices`, `POST /api/notices`
* **Database Models:** `Notice`, `Complaint`, `User`
* **Mock Fallback Storage:** `src/lib/mockNotices.json`

---

### 6. 🛋️ RECEPTION & FRONT DESK PORTAL
* **Component File:** `src/components/portals/ReceptionDashboard.tsx`
* **Route URLs:** `/portal/reception` or `/portal/reception/[subpage]`

#### A. Front Desk Dashboard Section
* **How it Works:** Displays today's total visitors, enquiries received, and active gate passes.
* **API Route:** `GET /api/reception`
* **Database Models:** `VisitorLog`, `Enquiry`
* **Mock Fallback Storage:** Direct API fallback response

#### B. Visitor Logs Desk Section
* **How it Works:** Form to register incoming visitors (Name, Phone, Host Staff Member, Visit Purpose). Displays an **Active Visitors In-Campus** table with a one-click **Mark Checked-Out** action button.
* **API Route:** `GET /api/reception?mode=visitors`, `POST /api/reception` (body `{ action: 'ADD_VISITOR', name, phone, hostStaff, purpose }`)
* **Database Models:** `VisitorLog`, `User`
* **Mock Fallback Storage:** Direct API fallback response

#### C. Student Enquiries & Gate Passes Sections
* **How it Works:**
  * **Enquiries Desk:** Form to record prospective student admission leads, contact numbers, and follow-up notes.
  * **Gate Passes Desk:** Form to issue authorized gate movement passes for students or staff leaving campus during class hours.
* **API Route:** `GET /api/reception?mode=enquiries`, `POST /api/reception`
* **Database Models:** `Enquiry`
* **Mock Fallback Storage:** Direct API fallback response

---

### 7. 🛠️ STAFF PORTAL (HR / LIBRARIAN / EXAM DEPT)
* **Component File:** `src/components/portals/StaffDashboard.tsx`
* **Route URLs:** `/portal/staff` or `/portal/staff/[subpage]`

#### A. HR Staff Subpages (2 Sub-Tabs)
* **How it Works:**
  * **Sub-tab 1: Employee Registry:** Table of college employees, employee IDs, department, and employment status.
  * **Sub-tab 2: Attendance Logs:** Track daily staff attendance logs.
* **API Route:** `GET /api/auth`, `GET /api/attendance`
* **Database Models:** `User`, `Staff`, `Teacher`, `Attendance`
* **Mock Fallback Storage:** Direct API fallback response

#### B. Librarian Staff Subpage
* **How it Works:** Library inventory desk. Search books by ISBN or title, register new books, process book checkout to students, log returned books, and record overdue fine payments.
* **API Route:** `GET /api/college`
* **Database Models:** `Book`, `BookLoan`, `Student`
* **Mock Fallback Storage:** Direct API fallback response

#### C. Exam Dept Staff Subpages (2 Sub-Tabs)
* **How it Works:**
  * **Sub-tab 1: Exam Sessions:** Form to schedule terminal/final examination sessions, exam dates, and duration.
  * **Sub-tab 2: Seat Plan Management:** Form to assign examination halls, bench capacities, and generate room-by-room student seating arrangements.
* **API Route:** `GET /api/exams`, `POST /api/exams` (body `{ action: 'CREATE_SESSION' | 'CREATE_SEAT_PLAN' }`)
* **Database Models:** `Exam`, `ExamSeat`, `Class`, `Student`
* **Mock Fallback Storage:** Direct API fallback response

---

### 8. ⚙️ SYSTEM ADMIN PORTAL
* **Component File:** `src/components/portals/AdminDashboard.tsx`
* **Route URLs:** `/portal/admin` or `/portal/admin/[subpage]`

#### A. User Management Section
* **How it Works:** Form to provision new user accounts across all 9 roles. User table allows updating email, full name, role permissions, resetting passwords, and deactivating accounts.
* **API Route:** `GET /api/auth`, `POST /api/auth`
* **Database Models:** `User`, `College`
* **Mock Fallback Storage:** Direct API fallback response

---

### 9. 📊 CHAIRPERSON & BOARD PORTAL
* **Component File:** `src/components/portals/ChairpersonDashboard.tsx`
* **Route URLs:** `/portal/chairperson` or `/portal/chairperson/[subpage]`

#### A. Executive Overview Section
* **How it Works:** High-level strategic metrics for board members: Institutional gross revenue, fee recovery velocity %, department revenue breakdown, and multi-year enrollment growth trends.
* **API Route:** `GET /api/fees`, `GET /api/financial-audit`
* **Database Models:** `College`, `Payment`, `FeeAllocation`
* **Mock Fallback Storage:** `src/lib/mockPayments.json`, `src/lib/mockFinancialAudit.json`
