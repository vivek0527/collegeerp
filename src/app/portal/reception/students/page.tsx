import PortalLayout from '@/components/PortalLayout';
import ReceptionDashboard from '@/components/portals/ReceptionDashboard';

export default function ReceptionStudentsPage() {
  return (
    <PortalLayout>
      <ReceptionDashboard subPage="students" />
    </PortalLayout>
  );
}
