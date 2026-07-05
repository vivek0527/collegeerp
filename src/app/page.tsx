'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Play,
  Calendar,
  Layers,
  Database,
  Shield,
  Users,
  Building,
  GraduationCap,
  BookOpen,
  CreditCard,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Lock,
  FileText,
  Briefcase,
  UserCheck,
  Clock,
  Settings,
  Activity,
  BarChart2,
  MessageCircle,
  Globe,
} from 'lucide-react';

export default function Home() {
  const WHATSAPP_URL = 'https://wa.me/9779823627373?text=Hello%20Orbya%20Tech%2C%20I%20would%20like%20to%20book%20a%20free%20demo%20for%20our%20college.';
  const WEBSITE_URL = 'https://orbya4.tech';
  const EMAIL = 'orbyatech@gmail.com';

  const handleBookDemo = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(WHATSAPP_URL, '_blank', 'noopener,noreferrer');
  };

  const PORTAL_LIST = [
    {
      id: 'principal',
      name: 'Principal Portal',
      role: 'PRINCIPAL',
      desc: 'Central command center for campus administration. Features Reception Admission Portal lock, entrance rank section allocation, staff account creation with base salary, payroll overview, scholarship scheme manager, and complaint resolution.',
      link: '/login',
      tag: 'Command Center',
    },
    {
      id: 'vp',
      name: 'Vice Principal Portal',
      role: 'VICE_PRINCIPAL',
      desc: 'Secondary executive dashboard for academic compliance monitoring, attendance ratio audits, staff overview, and campus notice broadcasting.',
      link: '/login',
      tag: 'Academic Command',
    },
    {
      id: 'reception',
      name: 'Reception & Front Desk Portal',
      role: 'RECEPTION',
      desc: 'Front desk student admission registration with SEE GPA and Entrance Marks, dynamic department selection, visitor check-in/out, enquiries, and gate passes.',
      link: '/login',
      tag: 'Front Desk',
    },
    {
      id: 'accounts-head',
      name: 'Accounts Head Portal',
      role: 'ACCOUNTS_HEAD',
      desc: 'Maker-Checker transaction verification center and 13-subtab Financial Audit Center (Audit Trail, Cash/Bank Reconciliation, Refund Audit, and Suspicious Risk Engine).',
      link: '/login',
      tag: 'Financial Audit',
    },
    {
      id: 'accounts-officer',
      name: 'Accounts Officer Portal',
      role: 'ACCOUNTS_OFFICER',
      desc: 'Payment collection counter, student fee allocation ledgers, itemized receipt generation, cashier counter balances, and salary slip entry.',
      link: '/login',
      tag: 'Cash Counter',
    },
    {
      id: 'student',
      name: 'Student Portal',
      role: 'STUDENT',
      desc: 'Personal student workspace with term info, attendance %, official printable invoice bills with QR code, official grade card transcripts, exam seat assignments, and study materials download.',
      link: '/login',
      tag: 'Student Desk',
    },
    {
      id: 'parent',
      name: 'Parent Portal',
      role: 'PARENT',
      desc: 'Ward academic monitoring dashboard showing child daily attendance logs, terminal exam GPA reports, fee balance statements, and official printable bill receipts.',
      link: '/login',
      tag: 'Parent Access',
    },
    {
      id: 'teacher',
      name: 'Teacher Portal',
      role: 'TEACHER',
      desc: 'Classroom attendance sheet marking (Present/Absent/Late in BS format), terminal examination grade entry, study materials PDF uploader, and monthly salary slip inspector.',
      link: '/login',
      tag: 'Faculty Desk',
    },
    {
      id: 'hr',
      name: 'HR Portal',
      role: 'HR',
      desc: 'Employee registry workspace, staff account provisioning, employee base salary configuration, and daily staff check-in/out attendance logs.',
      link: '/login',
      tag: 'Human Resources',
    },
    {
      id: 'librarian',
      name: 'Librarian Portal',
      role: 'LIBRARIAN',
      desc: 'Library catalog inventory management, ISBN search, book issue and return checkout desk, and overdue fine collection ledgers.',
      link: '/login',
      tag: 'Library System',
    },
    {
      id: 'exam-dept',
      name: 'Exam Department Portal',
      role: 'EXAM_DEPT',
      desc: 'Terminal examination timetable scheduling, room seating allocation matrix generator, and terminal grade processing.',
      link: '/login',
      tag: 'Examinations',
    },
    {
      id: 'admin',
      name: 'System Admin & Chairperson Portal',
      role: 'ADMIN / CHAIRPERSON',
      desc: 'Executive institutional revenue analytics, multi-tenant college settings, global system user provisioning across all 12 roles, and security audit logs.',
      link: '/login',
      tag: 'System Control',
    },
  ];

  return (
    <div style={{
      backgroundColor: '#F9FBF2',
      color: '#130E30',
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
      minHeight: '100vh',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* Load Fonts & Mobile Overrides */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Hedvig+Letters+Serif:opsz@12..24&family=Inter:wght@400;500;600;700;800&display=swap');

        .font-serif {
          font-family: 'Hedvig Letters Serif', Georgia, serif !important;
        }
        .font-sans {
          font-family: 'Inter', system-ui, sans-serif !important;
        }
        ::selection {
          background-color: #FFE228;
          color: #130E30;
        }

        /* 📱 RESPONSIVE OVERRIDES 📱 */
        @media (max-width: 992px) {
          /* Grid stacker */
          .mobile-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 40px !important;
          }
          div[style*="grid-column"] {
            grid-column: span 1 / span 1 !important;
            width: 100% !important;
          }
          
          /* Navbar shrinking */
          .desktop-nav-links {
            display: none !important;
          }

          /* Hero shrinking */
          h1, .hero-title {
            font-size: 3rem !important;
            line-height: 1.1 !important;
            text-align: center;
          }
          .hero-subtitle {
            text-align: center;
          }
          .hero-btn-group {
            justify-content: center !important;
            flex-wrap: wrap;
          }

          /* General flex stacking */
          .mobile-stack {
            flex-direction: column !important;
            text-align: center !important;
          }

          .section-title {
            font-size: 2.2rem !important;
          }
          
          /* Footer */
          .footer-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 40px !important;
          }
        }

        @media (max-width: 600px) {
          h1, .hero-title {
            font-size: 2.4rem !important;
          }
          .section-title {
            font-size: 1.8rem !important;
          }
          /* Convert grids into horizontal swipable carousels */
          .auto-grid {
            display: flex !important;
            overflow-x: auto !important;
            scroll-snap-type: x mandatory !important;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 24px !important;
            gap: 16px !important;
            margin: 0 -20px !important; /* Bleed to screen edge */
            padding: 4px 20px 24px 20px !important; /* Internal padding */
          }
          .auto-grid > * {
            flex: 0 0 85% !important; /* Show 85% of card so next one peeks out */
            scroll-snap-align: center !important;
            height: auto !important;
          }
          /* Hide scrollbar for a cleaner app-like look */
          .auto-grid::-webkit-scrollbar {
            display: none;
          }
          .auto-grid {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          nav {
            padding: 10px 16px !important;
          }
        }
      `}</style>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ FLOATING NAVIGATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div style={{
        position: 'sticky',
        top: '20px',
        zIndex: 100,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
      }}>
        <nav style={{
          backgroundColor: '#EFF2E5',
          borderRadius: '1440px',
          padding: '12px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid rgba(19, 14, 48, 0.06)',
        }}>
          {/* Brand Logo Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              backgroundColor: '#130E30',
              borderRadius: '1440px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '0.9rem',
              color: '#FFE228',
            }}>
              OB
            </div>
            <span className="font-serif" style={{ fontWeight: '800', fontSize: '1.25rem', color: '#130E30', letterSpacing: '-0.02em' }}>
              ORBYA TECH
            </span>
          </div>

          {/* Center Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="font-sans desktop-nav-links">
            {['Portals', 'Features', 'Modules', 'Solutions', 'Pricing', 'About'].map(link => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                style={{
                  textDecoration: 'none',
                  color: '#130E30',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'opacity 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.7'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                {link}
              </a>
            ))}
          </div>

          {/* Right Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleBookDemo}
              style={{
                textDecoration: 'none',
                backgroundColor: '#FFE228',
                color: '#130E30',
                borderRadius: '1440px',
                padding: '10px 22px',
                fontSize: '0.88rem',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'transform 0.15s',
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <MessageCircle size={15} />
              <span>Book Demo</span>
            </a>

            <Link
              href="/login"
              style={{
                textDecoration: 'none',
                backgroundColor: '#130E30',
                color: '#FFFFFF',
                borderRadius: '1440px',
                padding: '10px 22px',
                fontSize: '0.88rem',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'transform 0.15s',
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span>Access Console</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </nav>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ HERO SECTION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '70px 24px 90px 24px',
        position: 'relative',
      }}>
        {/* Organic Decorative Background Blobs */}
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '520px',
          height: '520px',
          backgroundColor: '#FFE228',
          borderRadius: '60% 40% 70% 30% / 40% 50% 60% 50%',
          opacity: 0.45,
          zIndex: 0,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          top: '30%',
          right: '25%',
          width: '320px',
          height: '320px',
          backgroundColor: '#E261E5',
          borderRadius: '50% 50% 30% 70% / 50% 30% 70% 50%',
          opacity: 0.25,
          zIndex: 0,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '12%',
          width: '380px',
          height: '380px',
          backgroundColor: '#59E25D',
          borderRadius: '40% 60% 50% 50% / 60% 30% 70% 40%',
          opacity: 0.35,
          zIndex: 0,
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '48px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* HERO LEFT COLUMN */}
          <div style={{ gridColumn: 'span 12', '@media (min-width: 992px)': { gridColumn: 'span 6' } } as any}>
            {/* Country Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#EFF2E5',
              padding: '8px 18px',
              borderRadius: '1440px',
              fontSize: '0.85rem',
              fontWeight: '700',
              color: '#130E30',
              marginBottom: '28px',
              border: '1px solid rgba(19, 14, 48, 0.08)',
            }}>
              <span>🇳🇵 Built for Modern Educational Institutions</span>
            </div>

            {/* Editorial Serif Headline */}
            <h1 className="font-serif" style={{
              fontSize: 'clamp(2.8rem, 5vw, 4.2rem)',
              fontWeight: '400',
              lineHeight: '1.1',
              color: '#130E30',
              margin: '0 0 24px 0',
              letterSpacing: '-0.02em',
            }}>
              Digitize Every Corner of Your Campus.
              <span style={{ display: 'block', fontWeight: '800', marginTop: '6px' }}>
                The Future of College Management Starts Here.
              </span>
            </h1>

            {/* Body Paragraph */}
            <p className="font-sans" style={{
              fontSize: '1.15rem',
              lineHeight: '1.65',
              color: 'rgba(19, 14, 48, 0.8)',
              margin: '0 0 36px 0',
              maxWidth: '540px',
            }}>
              Orbya Tech combines admissions, attendance, academics, examinations, finance, HR, communication and AI-powered analytics into one beautifully connected digital campus platform.
            </p>

            {/* Hero Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '40px' }}>
              <Link
                href="/login"
                style={{
                  textDecoration: 'none',
                  backgroundColor: '#130E30',
                  color: '#FFFFFF',
                  borderRadius: '1440px',
                  padding: '16px 36px',
                  fontSize: '1.05rem',
                  fontWeight: '800',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'transform 0.15s',
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span>Access Campus Console</span>
                <ArrowRight size={18} />
              </Link>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleBookDemo}
                style={{
                  textDecoration: 'none',
                  backgroundColor: '#FFE228',
                  color: '#130E30',
                  borderRadius: '1440px',
                  padding: '16px 32px',
                  fontSize: '1.05rem',
                  fontWeight: '800',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'transform 0.15s',
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <MessageCircle size={18} />
                <span>Book a Free Demo</span>
              </a>
            </div>

            {/* Trust Indicators */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap',
              fontSize: '0.88rem',
              fontWeight: '700',
              color: '#130E30',
              paddingTop: '24px',
              borderTop: '1px solid rgba(19, 14, 48, 0.1)',
            }}>
              {['Cloud Native', 'Multi Tenant', 'Secure', 'AI Powered', 'Built for Nepal'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '1440px',
                    backgroundColor: '#59E25D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#130E30',
                    fontSize: '0.75rem',
                    fontWeight: '900',
                  }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* HERO RIGHT COLUMN */}
          <div style={{
            gridColumn: 'span 12',
            '@media (min-width: 992px)': { gridColumn: 'span 6' },
            position: 'relative',
          } as any}>
            <div style={{
              backgroundColor: '#EFF2E5',
              borderRadius: '24px',
              padding: '36px 28px',
              position: 'relative',
              zIndex: 1,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <span className="font-serif" style={{ fontSize: '1.1rem', fontWeight: '800', color: '#130E30' }}>
                  Digital Campus Ecosystem
                </span>
                <span style={{
                  backgroundColor: '#FFE228',
                  padding: '4px 12px',
                  borderRadius: '1440px',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                }}>
                  12 Active Portals
                </span>
              </div>

              {/* ERP Previews Roster */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ backgroundColor: '#F9FBF2', borderRadius: '24px', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '1440px', backgroundColor: '#FFE228', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={20} color="#130E30" />
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '1rem', color: '#130E30' }}>Front Desk Admissions</div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(19,14,48,0.65)' }}>Entrance Score Rank &amp; Custom Roll Generator</div>
                    </div>
                  </div>
                  <Link href="/login" style={{ textDecoration: 'none', fontSize: '0.8rem', fontWeight: '800', backgroundColor: '#130E30', color: '#FFFFFF', padding: '6px 14px', borderRadius: '1440px' }}>Enter</Link>
                </div>

                <div style={{ backgroundColor: '#F9FBF2', borderRadius: '24px', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '1440px', backgroundColor: '#59E25D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar size={20} color="#130E30" />
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '1rem', color: '#130E30' }}>Double Calendar Engine</div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(19,14,48,0.65)' }}>2083 Asar 19 BS ⇄ July 4, 2026 AD</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', backgroundColor: '#EFF2E5', padding: '6px 14px', borderRadius: '1440px' }}>Syncing</span>
                </div>

                <div style={{ backgroundColor: '#F9FBF2', borderRadius: '24px', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '1440px', backgroundColor: '#E261E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CreditCard size={20} color="#FFFFFF" />
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '1rem', color: '#130E30' }}>Financial Audit Center</div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(19,14,48,0.65)' }}>Maker-Checker Verification &amp; Risk Engine</div>
                    </div>
                  </div>
                  <Link href="/login" style={{ textDecoration: 'none', fontSize: '0.8rem', fontWeight: '800', backgroundColor: '#130E30', color: '#FFFFFF', padding: '6px 14px', borderRadius: '1440px' }}>Enter</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ DEDICATED SECTION: ALL 12 ROLE-BASED PORTALS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="portals" style={{ backgroundColor: '#EFF2E5', padding: '90px 24px', borderTop: '1px solid rgba(19, 14, 48, 0.08)', borderBottom: '1px solid rgba(19, 14, 48, 0.08)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#FFE228', padding: '6px 16px', borderRadius: '1440px', fontSize: '0.8rem', fontWeight: '800', marginBottom: '16px' }}>
              <span>ROLE-BASED PORTAL SYSTEM</span>
            </div>
            <h2 className="font-serif" style={{ fontSize: '3rem', fontWeight: '800', color: '#130E30', margin: '0 0 16px 0' }}>
              12 Dedicated Portals Built for Every Role
            </h2>
            <p style={{ fontSize: '1.15rem', color: 'rgba(19,14,48,0.75)', maxWidth: '680px', margin: '0 auto', lineHeight: '1.6' }}>
              Unlike generic single-dashboard systems, Orbya Tech provisions 12 specialized portals so each stakeholder—from the Principal to Parents—has a focused, clutter-free workspace.
            </p>
          </div>

          <div className="auto-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
          }}>
            {PORTAL_LIST.map((portal) => (
              <div
                key={portal.id}
                style={{
                  backgroundColor: '#F9FBF2',
                  borderRadius: '24px',
                  padding: '32px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ backgroundColor: '#EFF2E5', color: '#130E30', fontSize: '0.78rem', fontWeight: '800', padding: '4px 12px', borderRadius: '1440px' }}>
                      {portal.tag}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'rgba(19,14,48,0.5)', fontFamily: 'monospace' }}>
                      {portal.role}
                    </span>
                  </div>
                  <h3 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: '800', color: '#130E30', margin: '0 0 12px 0' }}>
                    {portal.name}
                  </h3>
                  <p style={{ fontSize: '0.92rem', lineHeight: '1.6', color: 'rgba(19,14,48,0.75)', margin: 0 }}>
                    {portal.desc}
                  </p>
                </div>

                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(19,14,48,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#130E30' }}>Role-Restricted Security</span>
                  <Link
                    href={portal.link}
                    style={{
                      textDecoration: 'none',
                      backgroundColor: '#130E30',
                      color: '#FFFFFF',
                      fontSize: '0.82rem',
                      fontWeight: '800',
                      padding: '8px 18px',
                      borderRadius: '1440px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>Log In</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ SECTION 2: TRUSTED & COUNTERS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{
        backgroundColor: '#EFF2E5',
        padding: '60px 24px',
        borderBottom: '1px solid rgba(19, 14, 48, 0.06)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="font-serif" style={{ fontSize: '1.25rem', fontStyle: 'italic', color: '#130E30' }}>
              Trusted by Leading Nepal Colleges &amp; Educational Institutions
            </span>
          </div>

          <div className="auto-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px',
            textAlign: 'center',
          }}>
            <div style={{ backgroundColor: '#F9FBF2', borderRadius: '24px', padding: '32px 20px' }}>
              <div className="font-serif" style={{ fontSize: '3rem', fontWeight: '800', color: '#130E30' }}>5000+</div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'rgba(19,14,48,0.7)', marginTop: '6px' }}>Students Managed</div>
            </div>
            <div style={{ backgroundColor: '#F9FBF2', borderRadius: '24px', padding: '32px 20px' }}>
              <div className="font-serif" style={{ fontSize: '3rem', fontWeight: '800', color: '#130E30' }}>120+</div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'rgba(19,14,48,0.7)', marginTop: '6px' }}>Departments</div>
            </div>
            <div style={{ backgroundColor: '#F9FBF2', borderRadius: '24px', padding: '32px 20px' }}>
              <div className="font-serif" style={{ fontSize: '3rem', fontWeight: '800', color: '#130E30' }}>99.9%</div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'rgba(19,14,48,0.7)', marginTop: '6px' }}>Uptime</div>
            </div>
            <div style={{ backgroundColor: '#F9FBF2', borderRadius: '24px', padding: '32px 20px' }}>
              <div className="font-serif" style={{ fontSize: '3rem', fontWeight: '800', color: '#130E30' }}>24/7</div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'rgba(19,14,48,0.7)', marginTop: '6px' }}>Local Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ SECTION 3: EDITORIAL FEATURE SHOWCASE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="features" style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 className="font-serif" style={{ fontSize: '3rem', fontWeight: '800', color: '#130E30', margin: '0 0 16px 0' }}>
            Everything Your Campus Needs
          </h2>
          <p style={{ fontSize: '1.2rem', color: 'rgba(19,14,48,0.7)', maxWidth: '640px', margin: '0 auto' }}>
            Full-width modular systems engineered specifically to streamline administrative control and student success.
          </p>
        </div>

        {/* Alternating Row 1: Admissions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '48px',
          alignItems: 'center',
          marginBottom: '90px',
        }}>
          <div style={{ gridColumn: 'span 12', '@media (min-width: 768px)': { gridColumn: 'span 6' } } as any}>
            <div style={{
              backgroundColor: '#EFF2E5',
              borderRadius: '24px',
              padding: '48px 36px',
            }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '1440px', backgroundColor: '#FFE228', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Users size={24} color="#130E30" />
              </div>
              <h3 className="font-serif" style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 16px 0' }}>
                Automated Admissions &amp; Section Allocation
              </h3>
              <p style={{ fontSize: '1.05rem', lineHeight: '1.65', color: 'rgba(19,14,48,0.75)', margin: 0 }}>
                Reception collects applicants with SEE GPA and Entrance Marks. Principal toggles the Admission Portal lock, ranks candidates by score, divides them into balanced sections, and auto-generates custom roll numbers (e.g. 26SD0001).
              </p>
            </div>
          </div>
          <div style={{ gridColumn: 'span 12', '@media (min-width: 768px)': { gridColumn: 'span 6' } } as any}>
            <div style={{ backgroundColor: '#EFF2E5', borderRadius: '24px', padding: '36px' }}>
              <div style={{ backgroundColor: '#F9FBF2', borderRadius: '24px', padding: '24px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#130E30', marginBottom: '12px' }}>RANK-BASED SECTION BALANCER</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(19,14,48,0.08)', fontSize: '0.9rem', fontWeight: '700' }}>
                  <span>Rank #1 (Score: 92)</span>
                  <span style={{ color: '#130E30' }}>Section A — Roll: 26SD0001</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(19,14,48,0.08)', fontSize: '0.9rem', fontWeight: '700' }}>
                  <span>Rank #2 (Score: 88)</span>
                  <span style={{ color: '#130E30' }}>Section B — Roll: 26SD0002</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '0.9rem', fontWeight: '700' }}>
                  <span>Rank #3 (Score: 85)</span>
                  <span style={{ color: '#130E30' }}>Section A — Roll: 26SD0003</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alternating Row 2: Double Calendar & Financial Audit */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '48px',
          alignItems: 'center',
          marginBottom: '90px',
        }}>
          <div style={{ gridColumn: 'span 12', '@media (min-width: 768px)': { gridColumn: 'span 6' }, order: 2, '@media (min-width: 768px) order': 1 } as any}>
            <div style={{ backgroundColor: '#EFF2E5', borderRadius: '24px', padding: '36px' }}>
              <div style={{ backgroundColor: '#F9FBF2', borderRadius: '24px', padding: '24px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#130E30', marginBottom: '12px' }}>MAKER-CHECKER FINANCIAL AUDIT</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '6px' }}>Receipt #RCP-2083-049</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(19,14,48,0.7)', marginBottom: '14px' }}>Cashier: Accounts Officer • Amount: NPR 45,000</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#59E25D', color: '#130E30', padding: '4px 12px', borderRadius: '1440px', fontSize: '0.78rem', fontWeight: '900' }}>
                  Verified by Accounts Head
                </div>
              </div>
            </div>
          </div>
          <div style={{ gridColumn: 'span 12', '@media (min-width: 768px)': { gridColumn: 'span 6' }, order: 1, '@media (min-width: 768px) order': 2 } as any}>
            <div style={{
              backgroundColor: '#EFF2E5',
              borderRadius: '24px',
              padding: '48px 36px',
            }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '1440px', backgroundColor: '#59E25D', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <CreditCard size={24} color="#130E30" />
              </div>
              <h3 className="font-serif" style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 16px 0' }}>
                Financial Audit &amp; Risk Control
              </h3>
              <p style={{ fontSize: '1.05rem', lineHeight: '1.65', color: 'rgba(19,14,48,0.75)', margin: 0 }}>
                Full audit trail logging with a 13-subtab Financial Audit Center. Enforces Maker-Checker approvals for counter transactions, automated monthly payroll generation, and risk monitoring for payment discrepancies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ SECTION 4: CAMPUS JOURNEY TIMELINE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ backgroundColor: '#EFF2E5', padding: '100px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="font-serif" style={{ fontSize: '2.75rem', fontWeight: '800', color: '#130E30', margin: 0 }}>
              The Complete Campus Journey
            </h2>
          </div>

          <div className="auto-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px',
            alignItems: 'center',
            textAlign: 'center',
          }}>
            {[
              { title: 'Admission', desc: 'Front Desk Application' },
              { title: 'Enrollment', desc: 'Auto Roll & Section' },
              { title: 'Attendance', desc: 'Daily AD/BS Roster' },
              { title: 'Exams', desc: 'Seat & Grade Cards' },
              { title: 'Results', desc: 'GPA & Transcripts' },
              { title: 'Graduation', desc: 'Alumni Record' },
            ].map((step, idx) => (
              <div key={step.title} style={{ backgroundColor: '#F9FBF2', borderRadius: '24px', padding: '28px 16px', position: 'relative' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '900', color: '#130E30', opacity: 0.4, marginBottom: '6px' }}>
                  STEP 0{idx + 1}
                </div>
                <div className="font-serif" style={{ fontSize: '1.25rem', fontWeight: '800', color: '#130E30' }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(19,14,48,0.65)', marginTop: '4px' }}>
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ SECTION 6: WHY ORBYA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 className="font-serif" style={{ fontSize: '3rem', fontWeight: '800', color: '#130E30', margin: 0 }}>
            Why Leading Colleges Choose Orbya
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          {[
            { title: 'Cloud Native', text: 'Deployable on high-availability cloud infrastructure with instant scaling during peak registration.' },
            { title: 'Fast & Lightweight', text: 'Optimized next-generation architecture delivering sub-second portal load speeds on low bandwidth.' },
            { title: 'Ironclad Security', text: 'JWT encrypted cookies, role-based access control (RBAC), and multi-tenant database isolation.' },
            { title: '12 Role-Based Portals', text: 'Tailored interfaces for Student, Parent, Teacher, Principal, VP, HR, Librarian, Exam, Accounts, Admin, and Board.' },
            { title: 'Scalable Multitenancy', text: 'Effortlessly manage multiple campus branches and departments under a single master console.' },
            { title: 'AI-Powered Analytics', text: 'Automated attendance risk forecasting, fee collection predictions, and academic performance tracking.' },
          ].map(b => (
            <div key={b.title} style={{
              backgroundColor: '#EFF2E5',
              borderRadius: '24px',
              padding: '36px',
            }}>
              <h3 className="font-serif" style={{ fontSize: '1.6rem', fontWeight: '800', color: '#130E30', marginBottom: '12px' }}>
                {b.title}
              </h3>
              <p style={{ fontSize: '1rem', lineHeight: '1.6', color: 'rgba(19,14,48,0.75)', margin: 0 }}>
                {b.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ SECTION 8: FINAL CTA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{
        position: 'relative',
        maxWidth: '1200px',
        margin: '0 auto 100px auto',
        padding: '0 24px',
      }}>
        <div style={{
          position: 'relative',
          zIndex: 1,
          backgroundColor: '#130E30',
          borderRadius: '24px',
          padding: '80px 40px',
          textAlign: 'center',
          color: '#FFFFFF',
        }}>
          <h2 className="font-serif" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.75rem)', fontWeight: '400', margin: '0 0 16px 0' }}>
            Ready to Build
            <span style={{ display: 'block', fontWeight: '800' }}>Your Digital Campus?</span>
          </h2>
          <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.75)', maxWidth: '540px', margin: '0 auto 40px auto' }}>
            Join forward-thinking colleges across Nepal digitizing admissions, attendance, exams, and financial audits.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link
              href="/login"
              style={{
                textDecoration: 'none',
                backgroundColor: '#FFE228',
                color: '#130E30',
                borderRadius: '1440px',
                padding: '16px 36px',
                fontSize: '1.05rem',
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.15s',
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span>Access Campus Console</span>
              <ArrowRight size={18} />
            </Link>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleBookDemo}
              style={{
                textDecoration: 'none',
                backgroundColor: '#EFF2E5',
                color: '#130E30',
                borderRadius: '1440px',
                padding: '16px 36px',
                fontSize: '1.05rem',
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.15s',
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <MessageCircle size={18} />
              <span>Book Free Demo via WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ EDITORIAL FOOTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer style={{
        backgroundColor: '#EFF2E5',
        borderTop: '1px solid rgba(19, 14, 48, 0.08)',
        padding: '80px 24px 40px 24px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="footer-grid mobile-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '40px',
            marginBottom: '60px',
          }}>
            {/* Logo Column */}
            <div style={{ gridColumn: 'span 12', '@media (min-width: 768px)': { gridColumn: 'span 4' } } as any}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '36px', height: '36px', backgroundColor: '#130E30', borderRadius: '1440px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#FFE228' }}>
                  OB
                </div>
                <span className="font-serif" style={{ fontWeight: '800', fontSize: '1.3rem', color: '#130E30' }}>
                  ORBYA TECH
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'rgba(19,14,48,0.7)', lineHeight: '1.6', maxWidth: '300px', marginBottom: '12px' }}>
                Next-Generation Digital Campus SaaS ERP Platform optimized for educational institutions in Nepal.
              </p>
              <a
                href={WEBSITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.88rem',
                  fontWeight: '800',
                  color: '#130E30',
                  textDecoration: 'underline',
                }}
              >
                <Globe size={16} />
                <span>orbya4.tech</span>
              </a>
            </div>

            {/* Portals Links */}
            <div style={{ gridColumn: 'span 6', '@media (min-width: 768px)': { gridColumn: 'span 3' } } as any}>
              <div style={{ fontWeight: '800', fontSize: '0.95rem', marginBottom: '16px', color: '#130E30' }}>Portals</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
                <Link href="/login" style={{ color: 'rgba(19,14,48,0.7)', textDecoration: 'none' }}>Principal Command Center</Link>
                <Link href="/login" style={{ color: 'rgba(19,14,48,0.7)', textDecoration: 'none' }}>Reception Desk</Link>
                <Link href="/login" style={{ color: 'rgba(19,14,48,0.7)', textDecoration: 'none' }}>Accounts Maker-Checker</Link>
                <Link href="/login" style={{ color: 'rgba(19,14,48,0.7)', textDecoration: 'none' }}>Student &amp; Parent Portal</Link>
              </div>
            </div>

            {/* Engine Overview */}
            <div style={{ gridColumn: 'span 6', '@media (min-width: 768px)': { gridColumn: 'span 2' } } as any}>
              <div style={{ fontWeight: '800', fontSize: '0.95rem', marginBottom: '16px', color: '#130E30' }}>Engine</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'rgba(19,14,48,0.7)' }}>
                <span>Double Calendar (AD/BS)</span>
                <span>Financial Audit Center</span>
                <span>Automated Roll Generator</span>
                <span>Multi-Tenant DB</span>
              </div>
            </div>

            {/* Contact Info */}
            <div style={{ gridColumn: 'span 12', '@media (min-width: 768px)': { gridColumn: 'span 3' } } as any}>
              <div style={{ fontWeight: '800', fontSize: '0.95rem', marginBottom: '16px', color: '#130E30' }}>Contact &amp; Offices</div>
              <div style={{ fontSize: '0.88rem', color: 'rgba(19,14,48,0.75)', lineHeight: '1.7' }}>
                <div>📍 Kathmandu, Nepal &amp; Janakpur, Nepal</div>
                <div>✉️ <a href={`mailto:${EMAIL}`} style={{ color: '#130E30', fontWeight: '700', textDecoration: 'underline' }}>{EMAIL}</a></div>
                <div>📱 <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#130E30', fontWeight: '700', textDecoration: 'underline' }}>+977 9823627373</a></div>
                <div>🌐 <a href={WEBSITE_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#130E30', fontWeight: '700', textDecoration: 'underline' }}>orbya4.tech</a></div>
              </div>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(19,14,48,0.08)',
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.85rem',
            color: 'rgba(19,14,48,0.6)',
          }}>
            <span>© 2026 ORBYA TECH. All rights reserved.</span>
            <span>Official Website: <a href={WEBSITE_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#130E30', fontWeight: '700', textDecoration: 'underline' }}>orbya4.tech</a></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
