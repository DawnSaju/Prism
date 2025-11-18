"use client";

import React, { useState } from "react";
import Sidebar from "@/components/ui/dashboard/Sidebar";
import MobileView from "@/components/ui/dashboard/MobileView";
import DocUpload from "@/components/ui/dashboard/Upload";
import Library from "@/components/ui/dashboard/Library";
import AIChat from "@/components/ui/dashboard/Chat";
import Search from "@/components/ui/dashboard/Search";
import Profile from "@/components/ui/dashboard/Profile";
import Settings from "@/components/ui/dashboard/Settings";
import Insights from "@/components/ui/dashboard/Insights";
import { Bell, Settings as SettingsIcon, User, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import "@/styles/dashboard.css";

type View = "library" | "upload" | "chat" | "search" | "profile" | "settings" | "insights";

export default function DashboardPage() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<View>("library");
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleDocumentSelect = (docId: string) => {
    setSelectedDocument(docId);
    setCurrentView("chat");
  };

  const handleChatWithDocument = (docId: string, docName: string) => {
    setSelectedDocument(docId);
    setCurrentView("chat");
  };

  const handleClearDocument = () => {
    setSelectedDocument(null);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="h-screen bg-[rgb(15,15,15)] text-white flex overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <MobileView 
        currentView={currentView} 
        onViewChange={setCurrentView}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="shrink-0 border-b border-[rgb(40,40,40)] bg-[rgb(15,15,15)]">
          <div className="px-6 py-6 md:px-8 border-b border-dashed border-[rgb(40,40,40)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setMobileMenuOpen(true)}
                  className="md:hidden w-10 h-10 rounded-[10px] border border-[rgb(50,50,50)] bg-[rgb(25,25,25)] text-[rgb(160,160,160)] flex items-center justify-center hover:bg-[rgb(30,30,30)] hover:text-[rgb(200,200,200)] hover:border-[rgb(60,60,60)] transition-colors"
                  title="Menu"
                >
                  <Menu className="w-[18px] h-[18px]" />
                </button>
                
                <button 
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden md:flex w-9 h-9 rounded-[8px] border border-[rgb(50,50,50)] bg-[rgb(25,25,25)] text-[rgb(160,160,160)] items-center justify-center hover:bg-[rgb(30,30,30)] hover:text-[rgb(200,200,200)] hover:border-[rgb(60,60,60)] transition-colors"
                  title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {sidebarCollapsed ? <ChevronRight className="w-[16px] h-[16px]" /> : <ChevronLeft className="w-[16px] h-[16px]" />}
                </button>
                
                <div>
                  <h1 className="text-white text-[24px] md:text-[32px] leading-[1.05] tracking-tight" style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", sans-serif' }}>
                    {getGreeting()}, {user?.name?.split(" ")[0] || "there"}
                  </h1>
                  <p className="text-[rgb(130,130,130)] text-[13px] md:text-[14.75px] leading-[1.6] mt-1" style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", sans-serif' }}>
                    Welcome to your private AI knowledge library
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="w-9 h-9 rounded-[8px] border border-[rgb(50,50,50)] bg-[rgb(25,25,25)] text-[rgb(160,160,160)] hover:bg-[rgb(30,30,30)] hover:text-[rgb(200,200,200)] hover:border-[rgb(60,60,60)] transition-colors flex items-center justify-center" title="Notifications">
                  <Bell className="w-[17px] h-[17px]" />
                </button>
                <button 
                  onClick={() => setCurrentView("settings")}
                  className="w-9 h-9 rounded-[8px] border border-[rgb(50,50,50)] bg-[rgb(25,25,25)] text-[rgb(160,160,160)] hover:bg-[rgb(30,30,30)] hover:text-[rgb(200,200,200)] hover:border-[rgb(60,60,60)] transition-colors flex items-center justify-center"
                  title="Settings"
                >
                  <SettingsIcon className="w-[17px] h-[17px]" />
                </button>
                <button 
                  onClick={() => setCurrentView("profile")}
                  className="w-9 h-9 rounded-[8px] border border-[rgb(50,50,50)] bg-white text-[rgb(15,15,15)] hover:bg-gray-100 transition-colors flex items-center justify-center"
                  title="Profile"
                >
                  <User className="w-[17px] h-[17px]" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden p-6 md:p-8 bg-[rgb(15,15,15)] flex flex-col min-h-0">
          <div className="h-full overflow-hidden">
            {currentView === "library" && <Library onDocumentSelect={handleDocumentSelect} onChatWithDocument={handleChatWithDocument} />}
            {currentView === "upload" && <DocUpload onUploadComplete={() => setCurrentView("library")} />}
            {currentView === "chat" && <AIChat selectedDocument={selectedDocument} onClearDocument={handleClearDocument} />}
            {currentView === "search" && user && <Search userId={user.$id} />}
            {currentView === "insights" && <Insights />}
            {currentView === "profile" && <Profile />}
            {currentView === "settings" && <Settings />}
          </div>
        </main>
      </div>
    </div>
  );
}
