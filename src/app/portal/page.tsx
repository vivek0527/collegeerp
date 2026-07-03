'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/components/PortalLayout.module.css';

export default function GenericPortalPage() {
  const router = useRouter();

  useEffect(() => {
    async function redirectRole() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          const role = data.user.role;
          
          const ROLE_PORTALS: Record<string, string> = {
            STUDENT: '/portal/student',
            PARENT: '/portal/parent',
            TEACHER: '/portal/teacher',
            PRINCIPAL: '/portal/principal',
            VICE_PRINCIPAL: '/portal/vp',
            ACCOUNTS_HEAD: '/portal/accounts-head',
            ACCOUNTS_OFFICER: '/portal/accounts-officer',
            ADMIN: '/portal/admin',
            CHAIRPERSON: '/portal/chairperson',
            HR: '/portal/hr',
            LIBRARIAN: '/portal/librarian',
            EXAM_DEPT: '/portal/exam-dept',
            RECEPTION: '/portal/reception',
          };
          
          const target = ROLE_PORTALS[role] || '/login';
          router.push(target);
        } else {
          router.push('/login');
        }
      } catch (e) {
        router.push('/login');
      }
    }
    redirectRole();
  }, [router]);

  return (
    <div className={styles.loaderContainer}>
      <div className={styles.spinner}></div>
      <p>Routing to your designated portal...</p>
    </div>
  );
}
