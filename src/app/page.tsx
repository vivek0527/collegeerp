'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Calendar,
  Shield,
  Layers,
  Database,
  CheckCircle,
  Users,
  Compass,
} from 'lucide-react';

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 50%, #0d1527 0%, #060a12 100%)',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      {/* Decorative Blur Spheres */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '20%',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'rgba(79, 70, 229, 0.15)',
        filter: 'blur(80px)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '20%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'rgba(14, 165, 233, 0.15)',
        filter: 'blur(70px)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      <main style={{
        maxWidth: '1200px',
        width: '100%',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '48px',
      }}>
        {/* Brand header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            fontWeight: '800',
            boxShadow: '0 12px 24px rgba(79, 70, 229, 0.4)',
          }}>
            OB
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-1px', margin: 0 }}>
            ORBYA TECH
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#94a3b8',
            maxWidth: '650px',
            margin: '0 auto',
            fontWeight: '400',
            lineHeight: '1.6',
          }}>
            Next-Generation Digital Campus SaaS ERP Platform. Built for scalability, secure multitenancy, and optimized for colleges in Nepal.
          </p>
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/login" style={{
            textDecoration: 'none',
            background: 'linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)',
            color: '#ffffff',
            padding: '16px 36px',
            fontSize: '1.05rem',
            fontWeight: '600',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(79, 70, 229, 0.25)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 15px 30px rgba(79, 70, 229, 0.35)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(79, 70, 229, 0.25)';
            }}
          >
            Access Campus Console
          </Link>
        </div>

        {/* Features grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          width: '100%',
          marginTop: '20px',
        }}>
          {/* Card 1 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '30px',
            textAlign: 'left',
            backdropFilter: 'blur(10px)',
          }}>
            <Calendar style={{ color: '#0ea5e9', marginBottom: '16px' }} size={28} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', fontWeight: '600' }}>Double Calendar Engine</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Seamless bidirectional conversion between Gregorian (AD) and Bikram Sambat (BS) calendars. Adjustable defaults for attendance, fees, and scheduling.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '30px',
            textAlign: 'left',
            backdropFilter: 'blur(10px)',
          }}>
            <Layers style={{ color: '#4f46e5', marginBottom: '16px' }} size={28} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', fontWeight: '600' }}>12 Role-Based Portals</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Dedicated layouts for Student, Parent, Teacher, Principal, VP, HR, Librarian, Exam Dept, Accounts Head/Officers, and Chairperson.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '30px',
            textAlign: 'left',
            backdropFilter: 'blur(10px)',
          }}>
            <Database style={{ color: '#10b981', marginBottom: '16px' }} size={28} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', fontWeight: '600' }}>Relational Data Design</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
              PostgreSQL multi-tenant database using Prisma. Complete indexes, foreign keys, transaction rollbacks for payments, and automated audit logs.
            </p>
          </div>

          {/* Card 4 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '30px',
            textAlign: 'left',
            backdropFilter: 'blur(10px)',
          }}>
            <Shield style={{ color: '#ef4444', marginBottom: '16px' }} size={28} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', fontWeight: '600' }}>Production Dockerization</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Standardized Multi-stage Dockerfile and Docker Compose configurations, packaging PostgreSQL and Next.js standalones securely.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer style={{
          marginTop: '60px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '24px',
          width: '100%',
          fontSize: '0.8rem',
          color: '#64748b',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <span>© 2026 ORBYA TECH. All rights reserved.</span>
          <span>Designed & Powered by Advanced AI Coding Agent</span>
        </footer>
      </main>
    </div>
  );
}
