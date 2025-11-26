import React, { useState, useEffect } from "react";
import { Home, Upload, MessageSquare, FileText, LogOut, X, Search, Network } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { logout, listDocuments } from "@/lib/appwrite";

type View = "library" | "upload" | "chat" | "search" | "insights";

interface MobileViewProps {
  currentView: "library" | "upload" | "chat" | "search" | "profile" | "settings" | "insights";
  onViewChange: (view: "library" | "upload" | "chat" | "search" | "profile" | "settings" | "insights") => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileView({ currentView, onViewChange, isOpen, onClose }: MobileViewProps) {
  const router = useRouter();
  const { setUser, user } = useAuth();
  const [documentCount, setDocumentCount] = useState(0);
  const [storageUsed, setStorageUsed] = useState("0 B");
  const [storagePercent, setStoragePercent] = useState(0);
  const [storageLimit, setStorageLimit] = useState("5 GB");

  useEffect(() => {
    if (isOpen) fetchDocumentStats();
    const handleDocumentChange = () => fetchDocumentStats();
    window.addEventListener("documentDeleted", handleDocumentChange);
    window.addEventListener("documentUploaded", handleDocumentChange);
    const interval = setInterval(() => {
      if (isOpen) fetchDocumentStats();
    }, 10000);
    return () => {
      window.removeEventListener("documentDeleted", handleDocumentChange);
      window.removeEventListener("documentUploaded", handleDocumentChange);
      clearInterval(interval);
    };
  }, [isOpen]);

  const fetchDocumentStats = async () => {
    try {
      const files = await listDocuments();
      setDocumentCount(files.length);
      const totalBytes = files.reduce((acc, file) => acc + (file.sizeOriginal || 0), 0);
      const totalMB = totalBytes / (1024 * 1024);
      const totalGB = totalBytes / (1024 * 1024 * 1024);
      const { getCurrentUser, getUserPlanLimits } = await import("@/lib/appwrite");
      const currentUser = await getCurrentUser();
      const limits = getUserPlanLimits(currentUser);
      const maxStorageBytes = limits.storage;
      setStorageLimit(limits.displayStorage);
      const percent = maxStorageBytes === Infinity ? 0 : Math.min((totalBytes / maxStorageBytes) * 100, 100);
      setStoragePercent(Math.round(percent));
      setStorageUsed(totalGB >= 0.01 ? `${totalGB.toFixed(2)} GB` : `${totalMB.toFixed(2)} MB`);
    } catch (error) {
      console.error("Failed to fetch document stats:", error);
    }
  };

  const menuItems = [
    { id: "library" as View, label: "Library", icon: FileText },
    { id: "search" as View, label: "Search", icon: Search },
    { id: "insights" as View, label: "Insights", icon: Network },
    { id: "upload" as View, label: "Upload", icon: Upload },
    { id: "chat" as View, label: "Chat", icon: MessageSquare },
  ];

  const handleViewChange = (view: View) => {
    onViewChange(view);
    onClose();
  };

  const handleLogout = async () => {
    try {
      setUser(null);
      await logout();
      onClose();
    } catch (error) {
      console.error("Logout failed:", error);
      setUser(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-[280px] bg-[rgb(20,20,20)] border-r border-[rgb(40,40,40)] z-50 md:hidden flex flex-col">
        <div className="p-6 border-b border-[rgb(40,40,40)] flex items-center justify-between">
          <button onClick={() => { router.push("/"); onClose(); }} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[8px] bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] flex items-center justify-center">
              <FileText className="w-5 h-5 text-[rgb(230,230,230)]" />
            </div>
            <span className="text-white text-[18px]" style={{ fontFamily: "\"2 TT_Firs_Neue_DemiBold Unspecified\", \"2 TT_Firs_Neue_DemiBold Unspecified Placeholder\", sans-serif" }}>
              PRISM APP
            </span>
          </button>
          <button onClick={onClose} className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[rgb(160,160,160)] hover:bg-[rgb(30,30,30)] hover:text-[rgb(200,200,200)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 mx-4 my-4 bg-gradient-to-br from-[rgb(25,25,25)] to-[rgb(20,20,20)] border border-[rgb(50,50,50)] rounded-xl">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[rgb(130,130,130)] text-[11px]" style={{ fontFamily: "\"Geist Mono\", ui-monospace" }}>DOCUMENTS</span>
                <span className="text-white text-[20px]" style={{ fontFamily: "\"2 TT_Firs_Neue_DemiBold Unspecified\", \"2 TT_Firs_Neue_DemiBold Unspecified Placeholder\", sans-serif" }}>{documentCount}</span>
              </div>
            </div>
            <div className="h-px bg-[rgb(40,40,40)]"></div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[rgb(130,130,130)] text-[11px]" style={{ fontFamily: "\"Geist Mono\", ui-monospace" }}>STORAGE USED</span>
                <span className="text-[rgb(200,200,200)] text-[12px]" style={{ fontFamily: "\"2 TT_Firs_Neue_DemiBold Unspecified\", \"2 TT_Firs_Neue_DemiBold Unspecified Placeholder\", sans-serif" }}>{storagePercent}%</span>
              </div>
              <div className="w-full h-2 bg-[rgb(40,40,40)] rounded-full overflow-hidden">
                <div className="h-full bg-[rgb(230,230,230)] rounded-full transition-all duration-500" style={{ width: `${storagePercent}%` }}></div>
              </div>
              <p className="text-[rgb(100,100,100)] text-[10px] mt-2" style={{ fontFamily: "\"Geist Mono\", ui-monospace" }}>{storageUsed} / {storageLimit}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button key={item.id} onClick={() => handleViewChange(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-[10px] transition-colors ${isActive ? "bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] text-white" : "text-[rgb(160,160,160)] hover:bg-[rgb(25,25,25)] hover:text-[rgb(200,200,200)]"}`}>
                  <Icon className="w-[18px] h-[18px]" />
                  <span className="text-[14px]" style={{ fontFamily: "\"3 TT_Firs_Neue_Regular Unspecified\", \"3 TT_Firs_Neue_Regular Unspecified Placeholder\", sans-serif" }}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-[rgb(40,40,40)] space-y-1">
          <button onClick={() => { router.push("/"); onClose(); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-[10px] text-[rgb(160,160,160)] hover:bg-[rgb(25,25,25)] hover:text-[rgb(200,200,200)] transition-colors">
            <Home className="w-[18px] h-[18px]" />
            <span className="text-[14px]" style={{ fontFamily: "\"3 TT_Firs_Neue_Regular Unspecified\", \"3 TT_Firs_Neue_Regular Unspecified Placeholder\", sans-serif" }}>Home</span>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-[10px] text-[rgb(160,160,160)] hover:bg-[rgb(25,25,25)] hover:text-[rgb(200,200,200)] transition-colors">
            <LogOut className="w-[18px] h-[18px]" />
            <span className="text-[14px]" style={{ fontFamily: "\"3 TT_Firs_Neue_Regular Unspecified\", \"3 TT_Firs_Neue_Regular Unspecified Placeholder\", sans-serif" }}>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
