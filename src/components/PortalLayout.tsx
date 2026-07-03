'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import styles from './PortalLayout.module.css';
import { useSidebar } from './SidebarContext';

interface PortalLayoutProps {
  children: React.ReactNode;
}

function PortalInner({ user, children }: { user: any; children: React.ReactNode }) {
  const { sidebarOpen } = useSidebar();

  return (
    <div className={styles.container}>
      {/* Sidebar manages its own transform via isOpen prop */}
      <Sidebar user={user} isOpen={sidebarOpen} />

      {/* Main wrapper smoothly shifts with sidebar */}
      <div
        className={styles.mainWrapper}
        style={{ marginLeft: sidebarOpen ? 260 : 0 }}
      >
        <Navbar />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.spinner}></div>
        <p>Verifying active session...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <PortalInner user={user}>{children}</PortalInner>
  );
}
