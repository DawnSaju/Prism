"use client";

import React, { useState } from 'react';
import { User, Mail, Calendar, Shield, Key, LogOut, Camera, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/lib/appwrite';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      setUser(null);
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      setUser(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto dashboard-scroll-area">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 
            className="text-white text-[28px] leading-[1.1] tracking-tight mb-2"
            style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
          >
            Profile
          </h2>
          <p 
            className="text-[rgb(130,130,130)] text-[14.75px] leading-[1.6]"
            style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
          >
            Manage your account information and preferences
          </p>
        </div>

        <div className="bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] rounded-[16px] p-8 mb-6">
          <div className="flex items-start gap-6 mb-8 pb-8 border-b border-[rgb(40,40,40)]">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[rgb(80,80,80)] to-[rgb(40,40,40)] border-2 border-[rgb(60,60,60)] flex items-center justify-center">
                <User className="w-12 h-12 text-[rgb(160,160,160)]" />
              </div>
              <button 
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border-2 border-[rgb(20,20,20)] flex items-center justify-center hover:bg-gray-100 transition-colors"
                title="Change avatar"
              >
                <Camera className="w-4 h-4 text-[rgb(15,15,15)]" />
              </button>
            </div>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-4 py-2 bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] rounded-[8px] text-white text-[20px] focus:outline-none focus:border-[rgb(80,80,80)]"
                    style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-white text-[rgb(15,15,15)] rounded-[8px] flex items-center gap-2 hover:bg-gray-100 transition-colors text-[14px]"
                      style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                    >
                      <Check className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedName(user?.name || '');
                      }}
                      className="px-4 py-2 bg-[rgb(30,30,30)] text-[rgb(160,160,160)] border border-[rgb(50,50,50)] rounded-[8px] flex items-center gap-2 hover:bg-[rgb(35,35,35)] transition-colors text-[14px]"
                      style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 
                    className="text-white text-[24px] leading-[1.1] mb-2"
                    style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
                  >
                    {user?.name}
                  </h3>
                  <p 
                    className="text-[rgb(130,130,130)] text-[14px] mb-4"
                    style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                  >
                    {user?.email}
                  </p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-[rgb(30,30,30)] text-[rgb(200,200,200)] border border-[rgb(50,50,50)] rounded-[8px] hover:bg-[rgb(35,35,35)] hover:border-[rgb(60,60,60)] transition-colors text-[14px]"
                    style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                  >
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 
              className="text-white text-[16px] mb-4"
              style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
            >
              Account Details
            </h4>

            <div className="flex items-center gap-4 p-4 bg-[rgb(25,25,25)] border border-[rgb(40,40,40)] rounded-[10px]">
              <div className="w-10 h-10 rounded-[8px] bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] flex items-center justify-center">
                <Mail className="w-5 h-5 text-[rgb(160,160,160)]" />
              </div>
              <div className="flex-1">
                <p 
                  className="text-[rgb(130,130,130)] text-[12px] mb-1"
                  style={{ fontFamily: "'Geist Mono', ui-monospace" }}
                >
                  EMAIL ADDRESS
                </p>
                <p 
                  className="text-white text-[14.75px]"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                >
                  {user?.email}
                </p>
              </div>
              <span className="px-3 py-1 bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] rounded-full text-[rgb(100,200,100)] text-[11px]"
                style={{ fontFamily: "'Geist Mono', ui-monospace" }}>
                VERIFIED
              </span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[rgb(25,25,25)] border border-[rgb(40,40,40)] rounded-[10px]">
              <div className="w-10 h-10 rounded-[8px] bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] flex items-center justify-center">
                <Key className="w-5 h-5 text-[rgb(160,160,160)]" />
              </div>
              <div className="flex-1">
                <p 
                  className="text-[rgb(130,130,130)] text-[12px] mb-1"
                  style={{ fontFamily: "'Geist Mono', ui-monospace" }}
                >
                  USER ID
                </p>
                <p 
                  className="text-white text-[14.75px] font-mono"
                  style={{ fontFamily: "'Geist Mono', ui-monospace" }}
                >
                  {user?.$id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[rgb(25,25,25)] border border-[rgb(40,40,40)] rounded-[10px]">
              <div className="w-10 h-10 rounded-[8px] bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[rgb(160,160,160)]" />
              </div>
              <div className="flex-1">
                <p 
                  className="text-[rgb(130,130,130)] text-[12px] mb-1"
                  style={{ fontFamily: "'Geist Mono', ui-monospace" }}
                >
                  MEMBER SINCE
                </p>
                <p 
                  className="text-white text-[14.75px]"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                >
                  {user?.$createdAt ? formatDate(user.$createdAt) : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[rgb(25,25,25)] border border-[rgb(40,40,40)] rounded-[10px]">
              <div className="w-10 h-10 rounded-[8px] bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[rgb(160,160,160)]" />
              </div>
              <div className="flex-1">
                <p 
                  className="text-[rgb(130,130,130)] text-[12px] mb-1"
                  style={{ fontFamily: "'Geist Mono', ui-monospace" }}
                >
                  ACCOUNT STATUS
                </p>
                <p 
                  className="text-white text-[14.75px]"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                >
                  Active
                </p>
              </div>
              <span className="px-3 py-1 bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] rounded-full text-[rgb(100,200,100)] text-[11px]"
                style={{ fontFamily: "'Geist Mono', ui-monospace" }}>
                PREMIUM
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[rgb(20,20,20)] border border-[rgb(60,30,30)] rounded-[16px] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 
                className="text-[rgb(255,100,100)] text-[16px] mb-1"
                style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
              >
                Sign Out
              </h4>
              <p 
                className="text-[rgb(130,130,130)] text-[13px]"
                style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
              >
                Sign out from your account on this device
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-[rgb(60,20,20)] text-[rgb(255,100,100)] border border-[rgb(80,30,30)] rounded-[8px] hover:bg-[rgb(70,25,25)] hover:border-[rgb(100,40,40)] transition-colors flex items-center gap-2 text-[14px]"
              style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
