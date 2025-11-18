"use client";

import React, { useState } from 'react';
import { 
  Bell, 
  Lock, 
  Palette, 
  Globe, 
  Database, 
  Trash2,
  Moon,
  Sun,
  Monitor,
  Check,
  Download,
  Archive,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true,
  });
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');
  const [autoDelete, setAutoDelete] = useState(false);
  
  const getUserPlan = () => {
    if (!user || !user.labels) return 'free';
    if (user.labels.includes('admin')) return 'admin';
    if (user.labels.includes('enterprise')) return 'enterprise';
    if (user.labels.includes('pro')) return 'pro';
    return 'free';
  };
  
  const plan = getUserPlan();
  const planDisplayNames = {
    free: 'FREE TIER',
    pro: 'PRO',
    enterprise: 'ENTERPRISE',
    admin: 'ADMIN'
  };
  const planLimits = {
    free: { storage: '5 GB', documents: '10 documents' },
    pro: { storage: '15 GB', documents: '500 documents' },
    enterprise: { storage: 'Unlimited', documents: 'Unlimited' },
    admin: { storage: 'Unlimited', documents: 'Unlimited' }
  };
  const [customCursor, setCustomCursor] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('customCursor') !== 'false';
    }
    return true;
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCursorToggle = () => {
    const newValue = !customCursor;
    setCustomCursor(newValue);
    localStorage.setItem('customCursor', String(newValue));
    window.dispatchEvent(new CustomEvent('cursorPreferenceChange', { detail: { enabled: newValue } }));
  };

  return (
    <div className="h-full overflow-y-auto dashboard-scroll-area">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 
            className="text-white text-[28px] leading-[1.1] tracking-tight mb-2"
            style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
          >
            Settings
          </h2>
          <p 
            className="text-[rgb(130,130,130)] text-[14.75px] leading-[1.6]"
            style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
          >
            Configure your preferences and application settings
          </p>
        </div>

        <div className="bg-gradient-to-br from-[rgb(25,25,25)] to-[rgb(20,20,20)] border border-[rgb(50,50,50)] rounded-[16px] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 
                className="text-white text-[18px] leading-[1.1] mb-1"
                style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
              >
                Current Plan
              </h3>
              <p 
                className="text-[rgb(130,130,130)] text-[13px]"
                style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
              >
                Your subscription status
              </p>
            </div>
            <div className="px-4 py-2 bg-white rounded-lg">
              <span 
                className="text-[rgb(15,15,15)] text-[14px] font-semibold"
                style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
              >
                {planDisplayNames[plan]}
              </span>
            </div>
          </div>
          <div className="bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] rounded-[10px] p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span 
                  className="text-[rgb(160,160,160)] text-[13px]"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                >
                  Storage
                </span>
                <span 
                  className="text-white text-[13px]"
                  style={{ fontFamily: "'Geist Mono', ui-monospace" }}
                >
                  {planLimits[plan].storage}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span 
                  className="text-[rgb(160,160,160)] text-[13px]"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                >
                  Documents
                </span>
                <span 
                  className="text-white text-[13px]"
                  style={{ fontFamily: "'Geist Mono', ui-monospace" }}
                >
                  {planLimits[plan].documents}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span 
                  className="text-[rgb(160,160,160)] text-[13px]"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                >
                  AI Queries
                </span>
                <span 
                  className="text-white text-[13px]"
                  style={{ fontFamily: "'Geist Mono', ui-monospace" }}
                >
                  Unlimited
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span 
                  className="text-[rgb(160,160,160)] text-[13px]"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                >
                  Multimodal Support
                </span>
                <span 
                  className="text-[rgb(163,254,196)] text-[13px]"
                  style={{ fontFamily: "'Geist Mono', ui-monospace" }}
                >
                  ✓ Enabled
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] rounded-[16px] p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-[10px] bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] flex items-center justify-center">
              <Bell className="w-5 h-5 text-[rgb(160,160,160)]" />
            </div>
            <div>
              <h3 
                className="text-white text-[18px] leading-[1.1]"
                style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
              >
                Notifications
              </h3>
              <p 
                className="text-[rgb(130,130,130)] text-[13px] mt-1"
                style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
              >
                Manage how you receive notifications
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[rgb(25,25,25)] border border-[rgb(40,40,40)] rounded-[10px]">
              <div>
                <p 
                  className="text-white text-[14.75px] mb-1"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                >
                  Email Notifications
                </p>
                <p 
                  className="text-[rgb(130,130,130)] text-[12px]"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                >
                  Receive updates via email
                </p>
              </div>
              <button
                onClick={() => toggleNotification('email')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications.email ? 'bg-white' : 'bg-[rgb(50,50,50)]'
                }`}
              >
                <div 
                  className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${
                    notifications.email 
                      ? 'right-0.5 bg-[rgb(15,15,15)]' 
                      : 'left-0.5 bg-[rgb(80,80,80)]'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-[rgb(25,25,25)] border border-[rgb(40,40,40)] rounded-[10px]">
              <div>
                <p 
                  className="text-white text-[14.75px] mb-1"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                >
                  Push Notifications
                </p>
                <p 
                  className="text-[rgb(130,130,130)] text-[12px]"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                >
                  Receive browser notifications
                </p>
              </div>
              <button
                onClick={() => toggleNotification('push')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications.push ? 'bg-white' : 'bg-[rgb(50,50,50)]'
                }`}
              >
                <div 
                  className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${
                    notifications.push 
                      ? 'right-0.5 bg-[rgb(15,15,15)]' 
                      : 'left-0.5 bg-[rgb(80,80,80)]'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-[rgb(25,25,25)] border border-[rgb(40,40,40)] rounded-[10px]">
              <div>
                <p 
                  className="text-white text-[14.75px] mb-1"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                >
                  Product Updates
                </p>
                <p 
                  className="text-[rgb(130,130,130)] text-[12px]"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                >
                  Get notified about new features
                </p>
              </div>
              <button
                onClick={() => toggleNotification('updates')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications.updates ? 'bg-white' : 'bg-[rgb(50,50,50)]'
                }`}
              >
                <div 
                  className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${
                    notifications.updates 
                      ? 'right-0.5 bg-[rgb(15,15,15)]' 
                      : 'left-0.5 bg-[rgb(80,80,80)]'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] rounded-[16px] p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-[10px] bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] flex items-center justify-center">
              <Palette className="w-5 h-5 text-[rgb(160,160,160)]" />
            </div>
            <div>
              <h3 
                className="text-white text-[18px] leading-[1.1]"
                style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
              >
                Appearance
              </h3>
              <p 
                className="text-[rgb(130,130,130)] text-[13px] mt-1"
                style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
              >
                Customize the look and feel
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p 
              className="text-[rgb(130,130,130)] text-[12px] mb-3"
              style={{ fontFamily: "'Geist Mono', ui-monospace" }}
            >
              THEME PREFERENCE
            </p>
            
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`p-4 rounded-[10px] border transition-all ${
                  theme === 'light'
                    ? 'border-white bg-[rgb(30,30,30)]'
                    : 'border-[rgb(40,40,40)] bg-[rgb(25,25,25)] hover:border-[rgb(50,50,50)]'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <Sun className="w-6 h-6 text-[rgb(160,160,160)]" />
                  <span 
                    className="text-white text-[13px]"
                    style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                  >
                    Light
                  </span>
                  {theme === 'light' && (
                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                      <Check className="w-3 h-3 text-[rgb(15,15,15)]" />
                    </div>
                  )}
                </div>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-[10px] border transition-all ${
                  theme === 'dark'
                    ? 'border-white bg-[rgb(30,30,30)]'
                    : 'border-[rgb(40,40,40)] bg-[rgb(25,25,25)] hover:border-[rgb(50,50,50)]'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <Moon className="w-6 h-6 text-[rgb(160,160,160)]" />
                  <span 
                    className="text-white text-[13px]"
                    style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                  >
                    Dark
                  </span>
                  {theme === 'dark' && (
                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                      <Check className="w-3 h-3 text-[rgb(15,15,15)]" />
                    </div>
                  )}
                </div>
              </button>

              <button
                onClick={() => setTheme('system')}
                className={`p-4 rounded-[10px] border transition-all ${
                  theme === 'system'
                    ? 'border-white bg-[rgb(30,30,30)]'
                    : 'border-[rgb(40,40,40)] bg-[rgb(25,25,25)] hover:border-[rgb(50,50,50)]'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <Monitor className="w-6 h-6 text-[rgb(160,160,160)]" />
                  <span 
                    className="text-white text-[13px]"
                    style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                  >
                    System
                  </span>
                  {theme === 'system' && (
                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                      <Check className="w-3 h-3 text-[rgb(15,15,15)]" />
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[rgb(40,40,40)]">
            <div className="flex items-center justify-between p-4 bg-[rgb(25,25,25)] border border-[rgb(40,40,40)] rounded-[10px]">
              <div>
                <p 
                  className="text-white text-[14.75px] mb-1"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                >
                  Custom Cursor
                </p>
                <p 
                  className="text-[rgb(130,130,130)] text-[12px]"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                >
                  Use animated custom cursor or default system cursor
                </p>
              </div>
              <button
                onClick={handleCursorToggle}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  customCursor ? 'bg-white' : 'bg-[rgb(50,50,50)]'
                }`}
              >
                <div 
                  className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${
                    customCursor 
                      ? 'right-0.5 bg-[rgb(15,15,15)]' 
                      : 'left-0.5 bg-[rgb(80,80,80)]'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] rounded-[16px] p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-[10px] bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] flex items-center justify-center">
              <Globe className="w-5 h-5 text-[rgb(160,160,160)]" />
            </div>
            <div>
              <h3 
                className="text-white text-[18px] leading-[1.1]"
                style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
              >
                Language & Region
              </h3>
              <p 
                className="text-[rgb(130,130,130)] text-[13px] mt-1"
                style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
              >
                Set your preferred language
              </p>
            </div>
          </div>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-4 bg-[rgb(25,25,25)] border border-[rgb(40,40,40)] rounded-[10px] text-white text-[14.75px] focus:outline-none focus:border-[rgb(60,60,60)] cursor-pointer"
            style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="ja">日本語</option>
            <option value="zh">中文</option>
          </select>
        </div>

        <div className="bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] rounded-[16px] p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-[10px] bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] flex items-center justify-center">
              <Lock className="w-5 h-5 text-[rgb(160,160,160)]" />
            </div>
            <div>
              <h3 
                className="text-white text-[18px] leading-[1.1]"
                style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
              >
                Privacy & Security
              </h3>
              <p 
                className="text-[rgb(130,130,130)] text-[13px] mt-1"
                style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
              >
                Manage your data and security settings
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <button className="w-full p-4 bg-[rgb(25,25,25)] border border-[rgb(40,40,40)] rounded-[10px] flex items-center justify-between hover:bg-[rgb(30,30,30)] hover:border-[rgb(50,50,50)] transition-colors">
              <span 
                className="text-white text-[14.75px]"
                style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
              >
                Change Password
              </span>
              <Lock className="w-4 h-4 text-[rgb(160,160,160)]" />
            </button>

            <button className="w-full p-4 bg-[rgb(25,25,25)] border border-[rgb(40,40,40)] rounded-[10px] flex items-center justify-between hover:bg-[rgb(30,30,30)] hover:border-[rgb(50,50,50)] transition-colors">
              <span 
                className="text-white text-[14.75px]"
                style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
              >
                Two-Factor Authentication
              </span>
              <span className="px-3 py-1 bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] rounded-full text-[rgb(130,130,130)] text-[11px]"
                style={{ fontFamily: "'Geist Mono', ui-monospace" }}>
                DISABLED
              </span>
            </button>
          </div>
        </div>

        <div className="bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] rounded-[16px] p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-[10px] bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] flex items-center justify-center">
              <Database className="w-5 h-5 text-[rgb(160,160,160)]" />
            </div>
            <div>
              <h3 
                className="text-white text-[18px] leading-[1.1]"
                style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
              >
                Data Management
              </h3>
              <p 
                className="text-[rgb(130,130,130)] text-[13px] mt-1"
                style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
              >
                Control your data and storage
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <button className="w-full p-4 bg-[rgb(25,25,25)] border border-[rgb(40,40,40)] rounded-[10px] flex items-center justify-between hover:bg-[rgb(30,30,30)] hover:border-[rgb(50,50,50)] transition-colors">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-[rgb(160,160,160)]" />
                <span 
                  className="text-white text-[14.75px]"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                >
                  Export All Data
                </span>
              </div>
            </button>

            <button className="w-full p-4 bg-[rgb(25,25,25)] border border-[rgb(40,40,40)] rounded-[10px] flex items-center justify-between hover:bg-[rgb(30,30,30)] hover:border-[rgb(50,50,50)] transition-colors">
              <div className="flex items-center gap-3">
                <Archive className="w-5 h-5 text-[rgb(160,160,160)]" />
                <span 
                  className="text-white text-[14.75px]"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                >
                  Clear Cache
                </span>
              </div>
            </button>

            <div className="flex items-center justify-between p-4 bg-[rgb(25,25,25)] border border-[rgb(40,40,40)] rounded-[10px]">
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-[rgb(160,160,160)]" />
                <div>
                  <p 
                    className="text-white text-[14.75px] mb-1"
                    style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                  >
                    Auto-delete old documents
                  </p>
                  <p 
                    className="text-[rgb(130,130,130)] text-[12px]"
                    style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                  >
                    Documents older than 1 year
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAutoDelete(!autoDelete)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  autoDelete ? 'bg-white' : 'bg-[rgb(50,50,50)]'
                }`}
              >
                <div 
                  className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${
                    autoDelete 
                      ? 'right-0.5 bg-[rgb(15,15,15)]' 
                      : 'left-0.5 bg-[rgb(80,80,80)]'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[rgb(20,20,20)] border border-[rgb(60,30,30)] rounded-[16px] p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-[10px] bg-[rgb(40,20,20)] border border-[rgb(80,30,30)] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[rgb(255,100,100)]" />
            </div>
            <div>
              <h3 
                className="text-[rgb(255,100,100)] text-[18px] leading-[1.1]"
                style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
              >
                Danger Zone
              </h3>
              <p 
                className="text-[rgb(130,130,130)] text-[13px] mt-1"
                style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
              >
                Irreversible actions
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full p-4 bg-[rgb(40,20,20)] border border-[rgb(80,30,30)] rounded-[10px] flex items-center justify-between hover:bg-[rgb(50,25,25)] hover:border-[rgb(100,40,40)] transition-colors">
              <div>
                <p 
                  className="text-[rgb(255,100,100)] text-[14.75px] text-left mb-1"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                >
                  Delete All Documents
                </p>
                <p 
                  className="text-[rgb(130,130,130)] text-[12px] text-left"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                >
                  Permanently remove all uploaded documents
                </p>
              </div>
              <Trash2 className="w-5 h-5 text-[rgb(255,100,100)]" />
            </button>

            <button className="w-full p-4 bg-[rgb(40,20,20)] border border-[rgb(80,30,30)] rounded-[10px] flex items-center justify-between hover:bg-[rgb(50,25,25)] hover:border-[rgb(100,40,40)] transition-colors">
              <div>
                <p 
                  className="text-[rgb(255,100,100)] text-[14.75px] text-left mb-1"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                >
                  Delete Account
                </p>
                <p 
                  className="text-[rgb(130,130,130)] text-[12px] text-left"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                >
                  Permanently delete your account and all data
                </p>
              </div>
              <AlertTriangle className="w-5 h-5 text-[rgb(255,100,100)]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
