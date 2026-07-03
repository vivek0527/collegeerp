import PortalLayout from '@/components/PortalLayout';
import ReceptionDashboard from '@/components/portals/ReceptionDashboard';

export default function ReceptionPortalPage() {
  return (
    <PortalLayout>
      <ReceptionDashboard subPage="register" />
    </PortalLayout>
  );
}
