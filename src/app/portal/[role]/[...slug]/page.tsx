import PortalLayout from '@/components/PortalLayout';
import StudentDashboard from '@/components/portals/StudentDashboard';
import TeacherDashboard from '@/components/portals/TeacherDashboard';
import ParentDashboard from '@/components/portals/ParentDashboard';
import PrincipalDashboard from '@/components/portals/PrincipalDashboard';
import AccountsDashboard from '@/components/portals/AccountsDashboard';
import AdminDashboard from '@/components/portals/AdminDashboard';
import ChairpersonDashboard from '@/components/portals/ChairpersonDashboard';
import StaffDashboard from '@/components/portals/StaffDashboard';
import ReceptionDashboard from '@/components/portals/ReceptionDashboard';

interface PageProps {
  params: Promise<{
    role: string;
    slug: string[];
  }>;
}

export default async function PortalSubRoutePage({ params }: PageProps) {
  const resolvedParams = await params;
  const { role } = resolvedParams;
  const subPage = resolvedParams.slug[0];

  const getDashboard = () => {
    switch (role.toLowerCase()) {
      case 'student':
        return <StudentDashboard subPage={subPage} />;
      case 'teacher':
        return <TeacherDashboard subPage={subPage} />;
      case 'parent':
        return <ParentDashboard subPage={subPage} />;
      case 'principal':
      case 'vp':
        return <PrincipalDashboard subPage={subPage} />;
      case 'accounts-head':
      case 'accounts-officer':
      case 'accounts':
        return <AccountsDashboard subPage={subPage} />;
      case 'admin':
        return <AdminDashboard subPage={subPage} />;
      case 'chairperson':
        return <ChairpersonDashboard subPage={subPage} />;
      case 'hr':
      case 'librarian':
      case 'exam-dept':
      case 'staff':
        return <StaffDashboard subPage={subPage} />;
      case 'reception':
        return <ReceptionDashboard subPage={subPage} />;
      default:
        return (
          <div style={{ padding: '20px', color: 'var(--danger)' }}>
            <h3>Administrative Error</h3>
            <p>Portal path matching role "{role}" is not configured.</p>
          </div>
        );
    }
  };

  return (
    <PortalLayout>
      {getDashboard()}
    </PortalLayout>
  );
}
