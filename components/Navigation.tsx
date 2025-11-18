"use client";

import React, { useState } from 'react';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/lib/appwrite';
import { useRouter, usePathname } from 'next/navigation';

export default  function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, setUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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
    <nav className="sticky top-4 md:top-5 z-50 w-full px-4 md:px-8 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="relative bg-[rgb(15,15,15)] rounded-[15px] border border-neutral-800/40 shadow-[rgba(255,255,255,0.04)_0px_1px_0px_0px_inset,_rgba(255,255,255,0.06)_0px_-1px_3px_0px_inset]">
          <div className="backdrop-blur-lg bg-[rgba(33,33,33,0.5)] rounded-[15px] px-4 md:px-[18px] py-3 md:py-0 h-auto md:h-[52px] flex items-center justify-between">
            <a
              href="/"
              className="flex items-center gap-2 md:gap-3 shrink-0 px-1 py-1 group"
              aria-label="Prism Home"
            >
              <img
                src="/prism light.png"
                alt="Prism logo"
                className="h-6 w-auto md:h-7 object-contain"
              />
              <span
                className="text-[15px] md:text-[17px] tracking-[-0.5px] font-semibold text-[rgb(236,236,236)] group-hover:text-white transition-colors"
                style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
              >
                PRISM APP.
              </span>
            </a>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-[rgb(170,170,170)] hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="hidden md:flex items-center gap-[30px]">
              <div className="flex items-center gap-[5px] pl-[5px]">
                {['Features', 'How it works', 'Security', 'Pricing', 'FAQs'].map((item, idx) => (
                  <a
                    key={item}
                    href={`#${['our', 'how', 'ben', 'join', 'faq'][idx]}`}
                    className="px-2.5 py-0 text-[rgb(170,170,170)] hover:text-white transition-colors text-[14px] tracking-[-0.42px] leading-[31px] rounded-[7px] hover:bg-white/5"
                    style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                  >
                    {item}
                  </a>
                ))}
                {user && (
                  <a
                    href="/dashboard"
                    className={`relative inline-flex items-center px-3 py-0 text-[14px] tracking-[-0.42px] leading-[31px] rounded-[9px] transition-colors border shadow-[0_0_0_1px_rgba(255,255,255,0.06)]
                      ${pathname === '/dashboard'
                        ? 'bg-[rgb(35,35,35)] border-[rgb(70,70,70)] text-white'
                        : 'bg-[rgb(28,28,28)] border-[rgb(55,55,55)] text-[rgb(215,215,215)] hover:text-white hover:bg-[rgb(35,35,35)] hover:border-[rgb(70,70,70)]'}
                    `}
                    style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                    aria-label="Go to dashboard"
                    aria-current={pathname === '/dashboard' ? 'page' : undefined}
                  >
                    <span className="flex items-center gap-1">
                      <span>Dashboard</span>
                    </span>
                    {pathname === '/dashboard' && (
                      <span className="absolute inset-0 rounded-[9px] pointer-events-none ring-2 ring-white/10" aria-hidden="true" />
                    )}
                  </a>
                )}
              </div>
              
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-[7px] border border-[rgb(40,40,40)] bg-[rgb(25,25,25)] hover:bg-[rgb(30,30,30)] transition-colors"
                  >
                    <User className="w-4 h-4 text-[rgb(200,200,200)]" />
                    <span 
                      className="text-[rgb(200,200,200)] text-[14px]"
                      style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                    >
                      {user.name || user.email}
                    </span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[rgb(25,25,25)] border border-[rgb(40,40,40)] rounded-xl overflow-hidden shadow-lg">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-[rgb(200,200,200)] hover:bg-[rgb(30,30,30)] transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span 
                          className="text-[14px]"
                          style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                        >
                          Logout
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <a
                  href="/auth/login"
                  className="relative flex items-center justify-end gap-4 px-2.5 py-1 rounded-[7px] bg-linear-to-b from-[rgb(229,229,229)] to-[rgb(207,207,207)] shadow-[rgba(0,0,0,0.25)_0px_-0.936872px_3.74749px_0px_inset,rgba(255,255,255,0.3)_0px_1.87374px_1.87374px_0px_inset] hover:brightness-105 transition-all border-2 border-[rgb(182,182,182)]"
                >
                  <span 
                    className="capitalize text-[rgb(15,15,15)] text-[14px] tracking-[-0.42px] leading-5"
                    style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                  >
                    Login
                  </span>
                </a>
              )}
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-[rgba(33,33,33,0.95)] backdrop-blur-lg rounded-[15px] border border-neutral-800/40 overflow-hidden">
              <div className="flex flex-col py-2">
                {['Features', 'How it works', 'Security', 'Pricing', 'FAQs'].map((item, idx) => (
                  <a
                    key={item}
                    href={`#${['our', 'how', 'ben', 'join', 'faq'][idx]}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="px-6 py-3 text-[rgb(170,170,170)] hover:text-white hover:bg-white/5 transition-colors text-[14px] tracking-[-0.42px]"
                    style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                  >
                    {item}
                  </a>
                ))}
                {user ? (
                  <>
                    <a
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className={`mx-4 my-1 flex items-center justify-between px-4 py-3 rounded-[9px] border text-[14px] tracking-[-0.42px] transition-colors
                        ${pathname === '/dashboard'
                          ? 'bg-[rgb(35,35,35)] border-[rgb(70,70,70)] text-white'
                          : 'bg-[rgb(28,28,28)] border-[rgb(55,55,55)] text-[rgb(215,215,215)] hover:text-white hover:bg-[rgb(35,35,35)] hover:border-[rgb(70,70,70)]'}
                      `}
                      style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                      aria-label="Go to dashboard"
                      aria-current={pathname === '/dashboard' ? 'page' : undefined}
                    >
                      <span>Dashboard</span>
                    </a>
                    <div className="mx-4 my-1 border-t border-neutral-800/40"></div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="mx-4 my-1 flex items-center gap-2 px-4 py-3 rounded-[9px] bg-[rgb(28,28,28)] border border-[rgb(55,55,55)] text-[rgb(215,215,215)] hover:text-white hover:bg-[rgb(35,35,35)] hover:border-[rgb(70,70,70)] transition-colors text-[14px] tracking-[-0.42px]"
                      style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <a
                    href="/auth/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="mx-4 my-1 flex items-center justify-center px-4 py-3 rounded-[9px] bg-gradient-to-b from-[rgb(229,229,229)] to-[rgb(207,207,207)] shadow-[rgba(0,0,0,0.25)_0px_-0.936872px_3.74749px_0px_inset,rgba(255,255,255,0.3)_0px_1.87374px_1.87374px_0px_inset] hover:brightness-105 transition-all border-2 border-[rgb(182,182,182)] text-[14px] tracking-[-0.42px]"
                    style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                  >
                    <span className="text-[rgb(15,15,15)]">Login</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}