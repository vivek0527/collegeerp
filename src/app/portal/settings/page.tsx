'use client';

import React, { useState } from 'react';
import PortalLayout from '@/components/PortalLayout';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ShieldCheck, Camera } from 'lucide-react';

function PasswordStrengthBar({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Contains uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Contains number', ok: /\d/.test(password) },
    { label: 'Contains special character', ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981', '#10B981'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 4,
            backgroundColor: i <= score ? colors[score] : '#E2E8F0',
            transition: 'background-color 0.3s ease',
          }} />
        ))}
      </div>
      {password && (
        <p style={{ fontSize: '0.72rem', fontWeight: 600, color: colors[score], margin: 0 }}>
          {labels[score]}
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
        {checks.map(c => (
          <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {c.ok
              ? <CheckCircle size={12} color="#10B981" />
              : <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1.5px solid #CBD5E1' }} />
            }
            <span style={{ fontSize: '0.72rem', color: c.ok ? '#10B981' : '#94A3B8', fontWeight: 500 }}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FieldInput({
  id, label, value, onChange, show, onToggle, placeholder,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; show: boolean;
  onToggle: () => void; placeholder?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', letterSpacing: '0.2px' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || '••••••••'}
          style={{
            width: '100%',
            padding: '11px 44px 11px 14px',
            border: '1.5px solid #E2E8F0',
            borderRadius: 10,
            fontSize: '0.9rem',
            color: '#0F172A',
            outline: 'none',
            boxSizing: 'border-box',
            background: '#FAFBFC',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => (e.target.style.borderColor = '#2563EB')}
          onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
        />
        <button
          type="button"
          onClick={onToggle}
          style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0,
          }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

function AccountSettingsPage() {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw]         = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent]   = useState(false);
  const [showNew, setShowNew]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Avatar upload states
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [avatarCacheBuster, setAvatarCacheBuster] = useState(Date.now());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 400 * 1024) {
      setUploadResult({ type: 'error', msg: 'File size must be less than 400KB.' });
      return;
    }

    setAvatarFile(file);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    if (!avatarPreview) return;
    setUploadLoading(true);
    setUploadResult(null);

    try {
      const res = await fetch('/api/auth/upload-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: avatarPreview }),
      });
      const data = await res.json();
      if (res.ok) {
        setUploadResult({ type: 'success', msg: data.message || 'Profile picture updated successfully!' });
        setAvatarFile(null);
        setAvatarCacheBuster(Date.now());
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setUploadResult({ type: 'error', msg: data.error || 'Failed to update profile picture.' });
      }
    } catch {
      setUploadResult({ type: 'error', msg: 'Network error. Please try again.' });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    if (newPw !== confirmPw) {
      setResult({ type: 'error', msg: 'New passwords do not match.' });
      return;
    }
    if (newPw.length < 8) {
      setResult({ type: 'error', msg: 'New password must be at least 8 characters.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw, confirmPassword: confirmPw }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ type: 'success', msg: data.message || 'Password changed successfully!' });
        setCurrentPw(''); setNewPw(''); setConfirmPw('');
      } else {
        setResult({ type: 'error', msg: data.error || 'Failed to change password.' });
      }
    } catch {
      setResult({ type: 'error', msg: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '8px 0' }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #0B1F3A 0%, #2563EB 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShieldCheck size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.4px' }}>
              Account Settings
            </h1>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B', fontWeight: 500 }}>
              Change your login password
            </p>
          </div>
        </div>
      </div>

      {/* Profile Picture Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #E2E8F0',
        borderRadius: 20,
        padding: '32px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <Camera size={16} color="#2563EB" />
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>Profile Picture</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* Avatar Preview */}
          <div style={{
            position: 'relative',
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0B1F3A 0%, #2563EB 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '2rem',
            fontWeight: 800,
            overflow: 'hidden',
            flexShrink: 0
          }}>
            <img 
              src={avatarPreview || `/avatar.png?v=${avatarCacheBuster}`}
              alt="Profile"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%'
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              {/* Choose File Button wrapper */}
              <label style={{
                padding: '9px 16px',
                borderRadius: 8,
                background: '#F1F5F9',
                color: '#334155',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid #E2E8F0',
                textAlign: 'center',
                transition: 'background 0.2s'
              }}>
                Choose Photo
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }}
                />
              </label>

              {avatarFile && (
                <button
                  onClick={handleAvatarUpload}
                  disabled={uploadLoading}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #0B1F3A 0%, #2563EB 100%)',
                    color: '#fff',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: uploadLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(37,99,235,0.1)'
                  }}
                >
                  {uploadLoading ? 'Saving...' : 'Save Picture'}
                </button>
              )}
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>
              Supported formats: JPG, PNG. Max size: 400KB.
            </p>
          </div>
        </div>

        {uploadResult && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            borderRadius: 10,
            background: uploadResult.type === 'success' ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${uploadResult.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
            marginTop: '20px'
          }}>
            {uploadResult.type === 'success' ? (
              <CheckCircle size={16} color="#10B981" />
            ) : (
              <AlertCircle size={16} color="#EF4444" />
            )}
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: uploadResult.type === 'success' ? '#065F46' : '#991B1B' }}>
              {uploadResult.msg}
            </span>
          </div>
        )}
      </div>

      {/* Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #E2E8F0',
        borderRadius: 20,
        padding: '32px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <Lock size={16} color="#2563EB" />
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>Change Password</span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <FieldInput
            id="current-password"
            label="Current Password"
            value={currentPw}
            onChange={setCurrentPw}
            show={showCurrent}
            onToggle={() => setShowCurrent(v => !v)}
            placeholder="Enter your current password"
          />

          <div style={{ height: 1, background: '#F1F5F9' }} />

          <FieldInput
            id="new-password"
            label="New Password"
            value={newPw}
            onChange={setNewPw}
            show={showNew}
            onToggle={() => setShowNew(v => !v)}
            placeholder="Enter new password"
          />

          {/* Live strength meter */}
          {newPw && <PasswordStrengthBar password={newPw} />}

          <FieldInput
            id="confirm-password"
            label="Confirm New Password"
            value={confirmPw}
            onChange={setConfirmPw}
            show={showConfirm}
            onToggle={() => setShowConfirm(v => !v)}
            placeholder="Re-enter new password"
          />

          {/* Match indicator */}
          {confirmPw && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {newPw === confirmPw
                ? <><CheckCircle size={14} color="#10B981" /><span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>Passwords match</span></>
                : <><AlertCircle size={14} color="#EF4444" /><span style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 600 }}>Passwords do not match</span></>
              }
            </div>
          )}

          {/* Result banner */}
          {result && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', borderRadius: 10,
              background: result.type === 'success' ? '#F0FDF4' : '#FEF2F2',
              border: `1px solid ${result.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
            }}>
              {result.type === 'success'
                ? <CheckCircle size={16} color="#10B981" />
                : <AlertCircle size={16} color="#EF4444" />
              }
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: result.type === 'success' ? '#065F46' : '#991B1B' }}>
                {result.msg}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !currentPw || !newPw || !confirmPw}
            style={{
              marginTop: 4,
              padding: '13px',
              borderRadius: 10,
              background: loading || !currentPw || !newPw || !confirmPw
                ? '#CBD5E1'
                : 'linear-gradient(135deg, #0B1F3A 0%, #2563EB 100%)',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: loading || !currentPw || !newPw || !confirmPw ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s',
              letterSpacing: '0.3px',
            }}
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Security tip */}
      <div style={{
        marginTop: 16, padding: '12px 16px', borderRadius: 10,
        background: '#F8FAFC', border: '1px solid #E2E8F0',
        display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        <ShieldCheck size={15} color="#64748B" style={{ marginTop: 1, flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', lineHeight: 1.5 }}>
          <strong>Security tip:</strong> Use a unique password with a mix of uppercase letters, numbers,
          and special characters. Never share your password with anyone.
        </p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <PortalLayout>
      <AccountSettingsPage />
    </PortalLayout>
  );
}
