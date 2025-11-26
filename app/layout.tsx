import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SmoothCursor } from "@/components/ui/smooth-cursor"
import { LenisProvider } from "@/components/ui/lenis-provider"
import { AuthProvider } from "@/contexts/AuthContext"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prism App",
  description: "Personal RAG Integrated Semantic Memory",
  openGraph: {
    title: "Prism App",
    description: "Personal RAG Integrated Semantic Memory",
    images: [
      {
        url: "https://prism-app-neurohack.vercel.app/og.png",
        width: 1200,
        height: 630,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Prism App",
    description: "Personal RAG Integrated Semantic Memory",
    images: ["https://prism-app-neurohack.vercel.app/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`bg-[#0f0f0f] ${geistSans.variable} antialiased`}>
        <AuthProvider>
          <LenisProvider>
            <SmoothCursor/>
            {children}
          </LenisProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
