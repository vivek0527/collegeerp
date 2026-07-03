import PortalLayout from '@/components/PortalLayout';
import ReceptionDashboard from '@/components/portals/ReceptionDashboard';

export default function ReceptionAttendancePage() {
  return (
    <PortalLayout>
      <ReceptionDashboard subPage="attendance" />
    </PortalLayout>
  );
}
