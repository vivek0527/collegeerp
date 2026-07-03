'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  CheckCircle,
} from 'lucide-react';

const DEMO_ACCOUNTS = [
  { label: 'System Admin', email: 'admin@kmc.edu.np', password: 'Password123', role: 'ADMIN' },
  { label: 'College Chairperson', email: 'chairperson@kmc.edu.np', password: 'Password123', role: 'CHAIRPERSON' },
  { label: 'Campus Principal', email: 'principal@kmc.edu.np', password: 'Password123', role: 'PRINCIPAL' },
  { label: 'Vice Principal', email: 'vp@kmc.edu.np', password: 'Password123', role: 'VICE_PRINCIPAL' },
  { label: 'Academic Teacher', email: 'teacher@kmc.edu.np', password: 'Password123', role: 'TEACHER' },
  { label: 'College Student', email: 'student@kmc.edu.np', password: 'Password123', role: 'STUDENT' },
  { label: 'Student Parent', email: 'parent@kmc.edu.np', password: 'Password123', role: 'PARENT' },
  { label: 'Accounts Manager', email: 'acchead@kmc.edu.np', password: 'Password123', role: 'ACCOUNTS_HEAD' },
  { label: 'Accounts Officer', email: 'accofficer@kmc.edu.np', password: 'Password123', role: 'ACCOUNTS_OFFICER' },
  { label: 'HR Manager', email: 'hr@kmc.edu.np', password: 'Password123', role: 'HR' },
  { label: 'College Librarian', email: 'librarian@kmc.edu.np', password: 'Password123', role: 'LIBRARIAN' },
  { label: 'Exam Administrator', email: 'examdept@kmc.edu.np', password: 'Password123', role: 'EXAM_DEPT' },
  { label: 'Reception Desk', email: 'reception@kmc.edu.np', password: 'Password123', role: 'RECEPTION' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const handleDemoSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = parseInt(e.target.value, 10);
    if (!isNaN(selectedIndex)) {
      const selected = DEMO_ACCOUNTS[selectedIndex];
      setEmail(selected.email);
      setPassword(selected.password);
      setError('');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/portal');
        router.refresh();
      } else {
        setError(data.error || 'Invalid credentials or inactive account.');
      }
    } catch (err) {
      console.error(err);
      setError('A connection error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.splitWrapper}>
      {/* LEFT SIDE (55%): Modern University Visuals & Branding */}
      <div className={styles.visualPane}>
        <div className={styles.visualOverlay}>
          <div className={styles.overlayContent}>
            {/* Branding Logo */}
            <div className={styles.leftBrandBadge}>
              ORBYA TECH
            </div>
            
            {/* Title & Subtitle */}
            <div className={styles.visualTextContainer}>
              <h1 className={styles.headline}>
                Empowering the Future<br />of Digital Education
              </h1>
              <p className={styles.subtitle}>
                One intelligent platform connecting students, teachers and institutions.
              </p>
            </div>

            {/* Feature bullets */}
            <div className={styles.bulletList}>
              <div className={styles.bulletItem}>
                <CheckCircle size={18} className={styles.bulletCheck} />
                <span>Smart Attendance</span>
              </div>
              <div className={styles.bulletItem}>
                <CheckCircle size={18} className={styles.bulletCheck} />
                <span>Digital Exams</span>
              </div>
              <div className={styles.bulletItem}>
                <CheckCircle size={18} className={styles.bulletCheck} />
                <span>Secure Communication</span>
              </div>
              <div className={styles.bulletItem}>
                <CheckCircle size={18} className={styles.bulletCheck} />
                <span>Complete Campus Management</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE (45%): Clean Authentication Sidebar Panel */}
      <div className={styles.formPane}>
        <div className={styles.formContentBox}>
          {/* Logo brand & tagging */}
          <div className={styles.rightLogoBlock}>
            <div className={styles.rightBrandBadge}>
              OB
            </div>
            <h2 className={styles.rightWelcomeTitle}>Welcome Back</h2>
            <p className={styles.rightWelcomeSubtitle}>Sign in to your Digital Campus</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            {/* Quick Demo Pre-fill selector */}
            <div className={styles.inputGroup}>
              <select
                id="demo-selector"
                onChange={handleDemoSelect}
                className={styles.selectInput}
                defaultValue=""
              >
                <option value="">-- Role-Based Quick Prefill --</option>
                {DEMO_ACCOUNTS.map((account, idx) => (
                  <option key={account.email} value={idx}>
                    {account.label} ({account.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Username field */}
            <div className={styles.inputWrapper}>
              <div className={styles.inputIcon}>
                <User size={18} />
              </div>
              <input
                id="email-input"
                type="email"
                placeholder="Username / Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.textInput}
                disabled={loading}
                required
              />
            </div>

            {/* Password field */}
            <div className={styles.inputWrapper}>
              <div className={styles.inputIcon}>
                <Lock size={18} />
              </div>
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.textInput}
                disabled={loading}
                required
              />
              <div
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>

            {/* Remember Me and Forgot Password Action Bar */}
            <div className={styles.actionBar}>
              <label className={styles.rememberMeLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Please contact reception staff to manage or reset your campus credentials.');
                }}
                className={styles.forgotLink}
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit Action */}
            <button type="submit" className={styles.royalBlueBtn} disabled={loading}>
              <LogIn size={18} />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Footer powered branding */}
          <footer className={styles.poweredFooter}>
            Powered by ORBYA TECH
          </footer>
        </div>
      </div>
    </div>
  );
}
