import PortalLayout from '@/components/PortalLayout';
import ReceptionDashboard from '@/components/portals/ReceptionDashboard';

export default function ReceptionAbsentPage() {
  return (
    <PortalLayout>
      <ReceptionDashboard subPage="absent" />
    </PortalLayout>
  );
}
