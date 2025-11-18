"use client";

import React, { useState, useEffect } from "react";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { loginWithGoogle, loginWithEmail } from "@/lib/appwrite";
import { useAuth } from "@/contexts/AuthContext";
import "@/styles/auth.css";

interface LoginPageProps {
  onBackClick?: () => void;
}

export default function LoginPage({ onBackClick }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, setUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "oauth_failed") {
      setError("Google sign in failed. Please try again.");
    }
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      setLoading(true);
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      const session = await loginWithEmail(email, password);
      if (session) {
        const { getCurrentUser } = await import("@/lib/appwrite");
        const user = await getCurrentUser();
        setUser(user);
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[rgb(15,15,15)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 rounded-[10px] px-3 py-1.5 border border-[rgb(50,50,50)] bg-[rgb(25,25,25)] mb-6">
            <Lock style={{ width: "16px", height: "16px", stroke: "#E5E5E5", strokeWidth: "1.5" }} />
            <span
              className="text-[12.5px] leading-none text-[rgb(200,200,200)]"
              style={{ fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" }}
            >
              Secure Authentication
            </span>
          </div>

          <h1
            className="text-white text-[48px] md:text-[56px] leading-[0.95] mb-4"
            style={{ fontFamily: '"1 TT_Firs_Neue_ExtraBlack Unspecified", sans-serif' }}
          >
            WELCOME
            <br />
            BACK
          </h1>

          <p
            className="text-[rgb(130,130,130)] text-[14px] md:text-[16px]"
            style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", sans-serif' }}
          >
            Sign in to access your AI knowledge library
          </p>
        </div>

        <div className="bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] rounded-2xl p-6 md:p-8">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 rounded-xl px-4 py-3.5 flex items-center justify-center gap-3 transition-colors mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
              <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
              <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05"/>
              <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
            </svg>
            <span className="font-medium">Continue with Google</span>
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[rgb(40,40,40)]"></div>
            </div>
            <div className="relative flex justify-center">
              <span
                className="bg-[rgb(20,20,20)] px-4 text-[rgb(130,130,130)] text-[12px]"
                style={{ fontFamily: "'Geist Mono', ui-monospace" }}
              >
                OR CONTINUE WITH EMAIL
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
              <p className="text-red-400 text-[13px]" style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", sans-serif' }}>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-[rgb(200,200,200)] text-[13px] mb-2"
                style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", sans-serif' }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(130,130,130)]"
                  style={{ width: "18px", height: "18px" }}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[rgb(25,25,25)] border border-[rgb(40,40,40)] rounded-xl px-4 pl-11 py-3 text-white placeholder-[rgb(100,100,100)] focus:outline-none focus:border-[rgb(60,60,60)] transition-colors"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", sans-serif' }}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-[rgb(200,200,200)] text-[13px]"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", sans-serif' }}
                >
                  Password
                </label>
                <button
                  type="button"
                  className="text-[rgb(130,130,130)] hover:text-[rgb(200,200,200)] text-[12px] transition-colors"
                  style={{ fontFamily: "'Geist Mono', ui-monospace" }}
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(130,130,130)]"
                  style={{ width: "18px", height: "18px" }}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[rgb(25,25,25)] border border-[rgb(40,40,40)] rounded-xl px-4 pl-11 pr-11 py-3 text-white placeholder-[rgb(100,100,100)] focus:outline-none focus:border-[rgb(60,60,60)] transition-colors"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", sans-serif' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgb(130,130,130)] hover:text-[rgb(200,200,200)] transition-colors"
                >
                  {showPassword ? <EyeOff style={{ width: "18px", height: "18px" }} /> : <Eye style={{ width: "18px", height: "18px" }} />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-[rgb(40,40,40)] bg-[rgb(25,25,25)] text-white focus:ring-2 focus:ring-[rgb(60,60,60)] focus:ring-offset-0"
              />
              <label
                htmlFor="remember"
                className="ml-2 text-[rgb(130,130,130)] text-[13px]"
                style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", sans-serif' }}
              >
                Remember me for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 rounded-xl px-4 py-3.5 font-medium transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", sans-serif' }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p
            className="text-[rgb(130,130,130)] text-[14px]"
            style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", sans-serif' }}
          >
            Don't have an account?{" "}
            <button
              className="text-white hover:text-[rgb(200,200,200)] transition-colors underline"
              onClick={() => router.push("/auth/register")}
            >
              Sign up
            </button>
          </p>
        </div>

        <div className="text-center mt-8">
          <a href="/">
            <button
              className="inline-flex items-center gap-2 text-[rgb(130,130,130)] hover:text-[rgb(200,200,200)] text-[13px] transition-colors"
              style={{ fontFamily: "'Geist Mono', ui-monospace" }}
            >
              <span>←</span>
              <span>Back to home</span>
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
