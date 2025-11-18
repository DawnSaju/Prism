"use client";

import React, { useState, useEffect } from "react";
import { Lock, Mail, Eye, EyeOff, User, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { registerWithEmail } from "@/lib/appwrite";
import { useAuth } from "@/contexts/AuthContext";
import "@/styles/auth.css";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    try {
      setLoading(true);
      await registerWithEmail(email, password, name);
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen w-full bg-[rgb(15,15,15)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] rounded-2xl p-8 md:p-10">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-white text-[28px] mb-3" style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", sans-serif' }}>
              Registration Successful!
            </h2>
            <p className="text-[rgb(150,150,150)] text-[14px] mb-4" style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", sans-serif' }}>
              Your account has been created. Redirecting to login...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[rgb(200,200,200)] border-t-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[rgb(15,15,15)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 rounded-[10px] px-3 py-1.5 border border-[rgb(50,50,50)] bg-[rgb(25,25,25)] mb-6">
            <Lock style={{ width: "16px", height: "16px", stroke: "#E5E5E5", strokeWidth: "1.5" }} />
            <span className="text-[12.5px] leading-none text-[rgb(200,200,200)]" style={{ fontFamily: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" }}>
              Create Account
            </span>
          </div>
          <h1 className="text-white text-[48px] md:text-[56px] leading-[0.95] mb-4" style={{ fontFamily: '"1 TT_Firs_Neue_ExtraBlack Unspecified", sans-serif' }}>
            JOIN
            <br />
            PRISM
          </h1>
          <p className="text-[rgb(130,130,130)] text-[14px] md:text-[16px]" style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", sans-serif' }}>
            Start building your AI knowledge library
          </p>
        </div>

        <div className="bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] rounded-2xl p-6 md:p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
              <p className="text-red-400 text-[13px]" style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", sans-serif' }}>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-[rgb(200,200,200)] text-[13px] mb-2" style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", sans-serif' }}>
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(130,130,130)]" style={{ width: "18px", height: "18px" }} />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-[rgb(25,25,25)] border border-[rgb(40,40,40)] rounded-xl px-4 pl-11 py-3 text-white placeholder-[rgb(100,100,100)] focus:outline-none focus:border-[rgb(60,60,60)] transition-colors"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", sans-serif' }}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-[rgb(200,200,200)] text-[13px] mb-2" style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", sans-serif' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(130,130,130)]" style={{ width: "18px", height: "18px" }} />
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
              <label htmlFor="password" className="block text-[rgb(200,200,200)] text-[13px] mb-2" style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", sans-serif' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(130,130,130)]" style={{ width: "18px", height: "18px" }} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
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
              <p className="text-[rgb(100,100,100)] text-[12px] mt-1.5" style={{ fontFamily: "'Geist Mono', ui-monospace" }}>
                Must be at least 8 characters long
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 rounded-xl px-4 py-3.5 font-medium transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", sans-serif' }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-[rgb(130,130,130)] text-[14px]" style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", sans-serif' }}>
            Already have an account?{" "}
            <button className="text-white hover:text-[rgb(200,200,200)] transition-colors underline" onClick={() => router.push("/auth/login")}>
              Sign in
            </button>
          </p>
        </div>

        <div className="text-center mt-8">
          <a href="/">
            <button className="inline-flex items-center gap-2 text-[rgb(130,130,130)] hover:text-[rgb(200,200,200)] text-[13px] transition-colors" style={{ fontFamily: "'Geist Mono', ui-monospace" }}>
              <span>←</span>
              <span>Back to home</span>
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
