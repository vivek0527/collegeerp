import { PrismaClient, UserRole, AttendanceStatus, DocType, ComplaintStatus, FeeStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 1. Create a College Tenant
  const college = await prisma.college.upsert({
    where: { code: 'KMC' },
    update: {},
    create: {
      name: 'Kathmandu Model College',
      code: 'KMC',
      address: 'Bagbazar, Kathmandu, Nepal',
      phone: '+977-1-4242121',
      datePreference: 'BS',
      timezone: 'Asia/Kathmandu',
    },
  });
  console.log(`College tenant created: ${college.name} (Code: ${college.code})`);

  // Hash password for all mock users
  const passwordHash = await bcrypt.hash('Password123', 10);

  // 2. Create Users for all 12 roles
  const usersData = [
    { email: 'admin@kmc.edu.np', name: 'Admin Administrator', role: UserRole.ADMIN },
    { email: 'chairperson@kmc.edu.np', name: 'Dr. Hari Prasad Sharma', role: UserRole.CHAIRPERSON },
    { email: 'principal@kmc.edu.np', name: 'Prof. Ramesh Bhattarai', role: UserRole.PRINCIPAL },
    { email: 'vp@kmc.edu.np', name: 'Mrs. Geeta Adhikari', role: UserRole.VICE_PRINCIPAL },
    { email: 'acchead@kmc.edu.np', name: 'Mr. Shiva Raj Joshi', role: UserRole.ACCOUNTS_HEAD },
    { email: 'accofficer@kmc.edu.np', name: 'Miss Laxmi Thapa', role: UserRole.ACCOUNTS_OFFICER },
    { email: 'hr@kmc.edu.np', name: 'Mr. Binod Kafle', role: UserRole.HR },
    { email: 'librarian@kmc.edu.np', name: 'Mrs. Sita Devkota', role: UserRole.LIBRARIAN },
    { email: 'examdept@kmc.edu.np', name: 'Mr. Arjun Poudel', role: UserRole.EXAM_DEPT },
    { email: 'teacher@kmc.edu.np', name: 'Mr. Santosh Dahal', role: UserRole.TEACHER },
    { email: 'student@kmc.edu.np', name: 'Niranjan Thapa', role: UserRole.STUDENT },
    { email: 'parent@kmc.edu.np', name: 'Ram Bahadur Thapa', role: UserRole.PARENT },
  ];

  const users: Record<string, any> = {};

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, passwordHash },
      create: {
        email: u.email,
        passwordHash,
        name: u.name,
        role: u.role,
        collegeId: college.id,
      },
    });
    users[u.role] = user;
    console.log(`User created: ${user.name} - Role: ${user.role}`);
  }

  // 3. Create Specific Profiles
  // 3.1 Teacher Profile
  const teacherProfile = await prisma.teacher.upsert({
    where: { employeeId: 'EMP-TCH-01' },
    update: {},
    create: {
      userId: users[UserRole.TEACHER].id,
      employeeId: 'EMP-TCH-01',
      qualification: 'M.Sc. in Mathematics, Tribhuvan University',
      salary: 55000.0,
    },
  });

  // 3.2 Staff Profiles
  const staffProfiles = [
    { userId: users[UserRole.HR].id, employeeId: 'EMP-HR-01', roleType: 'HR', salary: 45000.0 },
    { userId: users[UserRole.LIBRARIAN].id, employeeId: 'EMP-LIB-01', roleType: 'LIBRARIAN', salary: 35000.0 },
    { userId: users[UserRole.ACCOUNTS_OFFICER].id, employeeId: 'EMP-ACC-01', roleType: 'ACCOUNTS_OFFICER', salary: 40000.0 },
  ];

  for (const s of staffProfiles) {
    await prisma.staff.upsert({
      where: { employeeId: s.employeeId },
      update: {},
      create: {
        userId: s.userId,
        employeeId: s.employeeId,
        roleType: s.roleType,
        salary: s.salary,
      },
    });
  }

  // 3.3 Parent Profile
  const parentProfile = await prisma.parent.upsert({
    where: { userId: users[UserRole.PARENT].id },
    update: {},
    create: {
      userId: users[UserRole.PARENT].id,
      phone: '+977-9841234567',
      occupation: 'Government Service Officer',
    },
  });

  // 4. Academics Setup (Class and Subject)
  const mathClass = await prisma.class.create({
    data: {
      collegeId: college.id,
      name: 'Grade 11',
      section: 'Science-A',
      roomNumber: 'Building B, Room 102',
      classTeacherId: teacherProfile.id,
    },
  });
  console.log(`Class created: ${mathClass.name} - Section: ${mathClass.section}`);

  const mathSubject = await prisma.subject.create({
    data: {
      collegeId: college.id,
      name: 'Mathematics',
      code: 'MTH-111',
      classId: mathClass.id,
      teacherId: teacherProfile.id,
    },
  });

  const physicsSubject = await prisma.subject.create({
    data: {
      collegeId: college.id,
      name: 'Physics',
      code: 'PHY-111',
      classId: mathClass.id,
    },
  });

  console.log(`Subjects created: Math (${mathSubject.code}), Physics (${physicsSubject.code})`);

  // 3.4 Student Profile (belongs to Grade 11 Science-A, linked to Parent)
  const studentProfile = await prisma.student.upsert({
    where: { userId: users[UserRole.STUDENT].id },
    update: { classId: mathClass.id, parentId: parentProfile.id },
    create: {
      userId: users[UserRole.STUDENT].id,
      rollNumber: '12',
      admissionNumber: 'ADM-2026-0012',
      dateOfBirthAD: new Date('2009-05-15'),
      dateOfBirthBS: '2066-02-01',
      classId: mathClass.id,
      parentId: parentProfile.id,
    },
  });
  console.log(`Student profile created for: ${users[UserRole.STUDENT].name}`);

  // 5. Class Routine
  await prisma.classRoutine.createMany({
    data: [
      { classId: mathClass.id, subjectName: 'Mathematics', dayOfWeek: 1, startTime: '09:00', endTime: '09:45', teacherName: users[UserRole.TEACHER].name },
      { classId: mathClass.id, subjectName: 'Physics', dayOfWeek: 1, startTime: '09:45', endTime: '10:30', teacherName: 'Physics Teacher' },
      { classId: mathClass.id, subjectName: 'Break', dayOfWeek: 1, startTime: '10:30', endTime: '11:00', teacherName: '' },
      { classId: mathClass.id, subjectName: 'Chemistry', dayOfWeek: 1, startTime: '11:00', endTime: '11:45', teacherName: 'Chemistry Teacher' },
    ],
  });

  // 6. Attendance Seeding
  const attendanceDates = [
    { ad: new Date('2026-06-25'), bs: '2083-03-11', status: AttendanceStatus.PRESENT },
    { ad: new Date('2026-06-26'), bs: '2083-03-12', status: AttendanceStatus.PRESENT },
    { ad: new Date('2026-06-27'), bs: '2083-03-13', status: AttendanceStatus.ABSENT, remarks: 'Sick leave request filed' },
    { ad: new Date('2026-06-28'), bs: '2083-03-14', status: AttendanceStatus.PRESENT },
    { ad: new Date('2026-06-29'), bs: '2083-03-15', status: AttendanceStatus.PRESENT },
  ];

  for (const att of attendanceDates) {
    await prisma.attendance.create({
      data: {
        collegeId: college.id,
        studentId: studentProfile.id,
        subjectId: mathSubject.id,
        dateAD: att.ad,
        dateBS: att.bs,
        status: att.status,
        remarks: att.remarks,
        markedById: users[UserRole.TEACHER].id,
      },
    });
  }

  // 7. Exam Seeding
  const exam = await prisma.exam.create({
    data: {
      collegeId: college.id,
      name: 'First Term Examination 2083',
      type: 'TERMINAL',
      startDateAD: new Date('2026-07-15'),
      startDateBS: '2083-04-01',
      endDateAD: new Date('2026-07-22'),
      endDateBS: '2083-04-08',
    },
  });

  // 7.1 Exam Seat Planning
  await prisma.examSeat.create({
    data: {
      examId: exam.id,
      studentId: studentProfile.id,
      roomNumber: 'Main Hall A',
      benchNumber: 'B-12',
      rollNumberInExam: 'EX-11012',
    },
  });

  // 7.2 Result Seeding
  await prisma.result.create({
    data: {
      collegeId: college.id,
      studentId: studentProfile.id,
      examId: exam.id,
      subjectId: mathSubject.id,
      marksObtained: 84.5,
      totalMarks: 100.0,
      passMarks: 40.0,
      grade: 'A',
      remarks: 'Excellent mathematical analytical skills.',
    },
  });

  // 8. Fee management Setup
  const tuitionFee = await prisma.feeStructure.create({
    data: {
      collegeId: college.id,
      title: 'Tuition Fee - Shrawan 2083',
      amount: 8500.0,
      dueDateAD: new Date('2026-08-01'),
      dueDateBS: '2083-04-18',
      classId: mathClass.id,
    },
  });

  // Allocate Fee
  const feeAllocation = await prisma.feeAllocation.create({
    data: {
      collegeId: college.id,
      studentId: studentProfile.id,
      feeStructureId: tuitionFee.id,
      dueAmount: 8500.0,
      amountPaid: 0.0,
      status: FeeStatus.UNPAID,
    },
  });

  // 8.1 Create payment (partial payment)
  const payment = await prisma.payment.create({
    data: {
      collegeId: college.id,
      feeAllocationId: feeAllocation.id,
      amount: 5000.0,
      paymentDateAD: new Date('2026-07-01'),
      paymentDateBS: '2083-03-17',
      paymentMethod: 'ONLINE',
      transactionId: 'TXN-98230248240',
      receiptNumber: 'REC-2083-0001',
      verifiedById: users[UserRole.ACCOUNTS_OFFICER].id,
    },
  });

  // Update allocation to reflects partial payment
  await prisma.feeAllocation.update({
    where: { id: feeAllocation.id },
    data: {
      amountPaid: 5000.0,
      dueAmount: 3500.0,
      status: FeeStatus.PARTIAL,
    },
  });

  // 9. Notices Seeding
  await prisma.notice.create({
    data: {
      collegeId: college.id,
      title: 'Welcome to the Digital Campus SaaS Platform!',
      content: 'We are thrilled to launch the new college management ERP. Students, teachers, and parents can now access assignments, routines, fees, and marks in real-time.',
      targetAudience: 'ALL',
      createdById: users[UserRole.ADMIN].id,
    },
  });

  await prisma.notice.create({
    data: {
      collegeId: college.id,
      title: 'First Term Examination Scheduling Notice',
      content: 'The First Term Exam begins from Shrawan 1, 2083. Please collect your admit cards and verify your seat planning from the exam department portal.',
      targetAudience: 'STUDENTS',
      createdById: users[UserRole.EXAM_DEPT].id,
    },
  });

  // 10. Complaint Seeding
  await prisma.complaint.create({
    data: {
      collegeId: college.id,
      title: 'Deficient computer hardware in Lab 3',
      description: 'Multiple monitors in computer lab 3 have severe screen flickering issues, making it difficult to write code during practical periods.',
      isAnonymous: false,
      studentId: studentProfile.id,
      status: ComplaintStatus.OPEN,
    },
  });

  // 11. Salary slips Seeding
  await prisma.salarySlip.create({
    data: {
      collegeId: college.id,
      userId: users[UserRole.TEACHER].id,
      basicSalary: 55000.0,
      allowances: 3500.0,
      deductions: 1200.0,
      netSalary: 57300.0,
      payPeriod: 'Asar 2083',
      status: 'PAID',
      paymentDateAD: new Date('2026-06-30'),
      paymentDateBS: '2083-03-16',
    },
  });

  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
