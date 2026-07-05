import PortalLayout from '@/components/PortalLayout';
import PrincipalDashboard from '@/components/portals/PrincipalDashboard';

interface PageProps {
  params: Promise<{
    subPage: string;
  }>;
}

export default async function PrincipalSubPage({ params }: PageProps) {
  const { subPage } = await params;
  return (
    <PortalLayout>
      <PrincipalDashboard subPage={subPage} />
    </PortalLayout>
  );
}
