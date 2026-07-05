'use client';

import React, { useEffect, useState } from 'react';
import PortalLayout from '@/components/PortalLayout';
import { 
  User, Mail, Shield, Building, Award, Calendar, 
  MapPin, Hash, UserCheck, Briefcase, Phone, BookOpen, 
  Camera, CheckCircle, GraduationCap, DollarSign
} from 'lucide-react';

function ProfileCard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avatarSrc, setAvatarSrc] = useState('/avatar.png');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div style={{
          width: '40px', height: '40px',
          border: '3px solid rgba(37, 99, 235, 0.1)',
          borderTopColor: '#2563EB',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#EF4444', fontWeight: 600 }}>
        Failed to load profile. Please sign in again.
      </div>
    );
  }

  const initials = profile.name ? profile.name.split(' ').map((w: any) => w[0]).join('').slice(0, 2).toUpperCase() : '?';
  const roleName = profile.role.replace(/_/g, ' ');

  // Dynamic role-specific fields
  const renderRoleFields = () => {
    switch (profile.role) {
      case 'STUDENT':
        const student = profile.studentProfile;
        return (
          <>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginTop: '24px', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
              Academic Profile
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <InfoItem icon={<Hash size={16} />} label="Roll Number" value={student?.rollNumber || 'N/A'} />
              <InfoItem icon={<Award size={16} />} label="Admission Number" value={student?.admissionNumber || 'N/A'} />
              <InfoItem icon={<GraduationCap size={16} />} label="Class" value={student?.class?.name || 'N/A'} />
              <InfoItem icon={<Briefcase size={16} />} label="Section" value={student?.class?.section || 'N/A'} />
              <InfoItem icon={<MapPin size={16} />} label="Room Number" value={student?.class?.roomNumber || 'N/A'} />
              <InfoItem icon={<Calendar size={16} />} label="Date of Birth (BS)" value={student?.dateOfBirthBS || 'N/A'} />
            </div>
          </>
        );

      case 'PARENT':
        const parent = profile.parentProfile;
        return (
          <>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginTop: '24px', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
              Parental Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <InfoItem icon={<Phone size={16} />} label="Contact Number" value={parent?.phone || 'N/A'} />
              <InfoItem icon={<Briefcase size={16} />} label="Occupation" value={parent?.occupation || 'N/A'} />
            </div>

            {parent?.students && parent.students.length > 0 && (
              <>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#475569', marginBottom: '12px' }}>Associated Students</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {parent.students.map((s: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {s.user?.name ? s.user.name.charAt(0) : 'S'}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>{s.user?.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                          Roll No: {s.rollNumber} | {s.class?.name || 'N/A'} - {s.class?.section || 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        );

      case 'TEACHER':
        const teacher = profile.teacherProfile;
        return (
          <>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginTop: '24px', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
              Academic & Professional Info
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <InfoItem icon={<Hash size={16} />} label="Employee ID" value={teacher?.employeeId || 'N/A'} />
              <InfoItem icon={<Award size={16} />} label="Qualification" value={teacher?.qualification || 'N/A'} />
              <InfoItem icon={<DollarSign size={16} />} label="Monthly Salary" value={teacher?.salary ? `NPR ${teacher.salary.toLocaleString()}` : 'N/A'} />
            </div>

            {teacher?.subjects && teacher.subjects.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Assigned Subjects</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {teacher.subjects.map((sub: any, idx: number) => (
                    <span key={idx} style={{ display: 'inline-flex', padding: '6px 12px', background: '#EFF6FF', color: '#2563EB', fontSize: '0.8rem', fontWeight: 600, borderRadius: '20px', border: '1px solid rgba(37,99,235,0.1)' }}>
                      {sub.name} ({sub.code})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {teacher?.headOfClasses && teacher.headOfClasses.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Class Teacher Assignment</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {teacher.headOfClasses.map((cls: any, idx: number) => (
                    <span key={idx} style={{ display: 'inline-flex', padding: '6px 12px', background: '#F0FDF4', color: '#16A34A', fontSize: '0.8rem', fontWeight: 600, borderRadius: '20px', border: '1px solid rgba(22,163,74,0.1)' }}>
                      {cls.name} - {cls.section}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        );

      default:
        // Staff Profile (HR, Accounts, Librarian, Exam Dept, admin)
        const staff = profile.staffProfile;
        if (!staff && profile.role === 'ADMIN') return null;
        return (
          <>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginTop: '24px', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
              Staff Employment Info
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <InfoItem icon={<Hash size={16} />} label="Employee ID" value={staff?.employeeId || 'N/A'} />
              <InfoItem icon={<Briefcase size={16} />} label="Staff Role Desk" value={staff?.roleType || roleName} />
              <InfoItem icon={<DollarSign size={16} />} label="Monthly Salary" value={staff?.salary ? `NPR ${staff.salary.toLocaleString()}` : 'N/A'} />
            </div>
          </>
        );
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '10px 0' }}>
      {/* Header section */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: 'linear-gradient(135deg, #0B1F3A 0%, #2563EB 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <User size={22} color="#fff" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
            My Profile
          </h1>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B', fontWeight: 500 }}>
            Manage your personal academic identity details
          </p>
        </div>
      </div>

      <div className="profile-container" style={{ gap: '24px' }}>
        {/* Left Side: Avatar Card */}
        <div style={{
          flex: '1 1 300px',
          background: '#ffffff',
          border: '1px solid #E2E8F0',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          {/* Avatar Container */}
          <div style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0B1F3A 0%, #2563EB 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '2.5rem',
            fontWeight: 800,
            boxShadow: '0 8px 24px rgba(37,99,235,0.12)',
            overflow: 'hidden',
            marginBottom: '16px'
          }}>
            <img 
              src={avatarSrc} 
              alt="Avatar" 
              onError={() => setAvatarSrc('')}
              style={{
                display: avatarSrc ? 'block' : 'none',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            {!avatarSrc && initials}
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {profile.name}
          </h2>
          <span style={{
            padding: '4px 12px',
            background: 'rgba(37,99,235,0.08)',
            color: '#2563EB',
            fontSize: '0.72rem',
            fontWeight: 700,
            borderRadius: '20px',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: '20px'
          }}>
            {roleName}
          </span>

          <div style={{ width: '100%', borderTop: '1px solid #F1F5F9', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748B', fontWeight: 500 }}>System ID</span>
              <span style={{ color: '#0F172A', fontWeight: 600, fontFamily: 'monospace' }}>{profile.id.slice(0, 8)}...</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748B', fontWeight: 500 }}>Status</span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: profile.status === 'ACTIVE' ? '#16A34A' : '#EF4444',
                fontWeight: 700
              }}>
                <CheckCircle size={14} />
                {profile.status}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Information details */}
        <div style={{
          flex: '2 1 500px',
          background: '#ffffff',
          border: '1px solid #E2E8F0',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* General Section */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 16px 0', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
              General Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <InfoItem icon={<Mail size={16} />} label="Email Address" value={profile.email} />
              <InfoItem icon={<Building size={16} />} label="Campus Institute" value={profile.college?.name || 'Everest College'} />
              <InfoItem icon={<Shield size={16} />} label="Access Role Level" value={roleName} />
              <InfoItem icon={<Calendar size={16} />} label="System Timezone" value={profile.college?.timezone || 'Asia/Kathmandu'} />
            </div>
          </div>

          {/* Role specific Section */}
          {renderRoleFields()}
        </div>
      </div>

      <style jsx>{`
        .profile-container {
          display: flex;
          flex-direction: row;
        }
        @media (max-width: 768px) {
          .profile-container {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: '12px', padding: '10px', background: '#FAFBFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
      <div style={{ color: '#2563EB', padding: '6px', background: '#EFF6FF', borderRadius: '8px', display: 'flex', alignItems: 'center', alignSelf: 'flex-start' }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '0.86rem', color: '#0F172A', fontWeight: 700 }}>{value}</div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <PortalLayout>
      <ProfileCard />
    </PortalLayout>
  );
}
