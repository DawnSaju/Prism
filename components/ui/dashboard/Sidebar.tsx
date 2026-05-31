import React, { useState, useEffect } from 'react';
import { Home, Upload, MessageSquare, FileText, LogOut, Shield, Search, Network } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { listDocuments, logout } from '@/lib/appwrite';
import { useAuth } from '@/contexts/AuthContext';

type View = 'library' | 'upload' | 'chat' | 'search' | 'insights';

interface DashboardSidebarProps {
  currentView: 'library' | 'upload' | 'chat' | 'search' | 'profile' | 'settings' | 'insights';
  onViewChange: (view: 'library' | 'upload' | 'chat' | 'search' | 'profile' | 'settings' | 'insights') => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onStatsRefresh?: () => void;
}

export default function Sidebar({ currentView, onViewChange, collapsed }: DashboardSidebarProps) {
  const router = useRouter();
  const { setUser, user } = useAuth();
  const [documentCount, setDocumentCount] = useState(0);
  const [storageUsed, setStorageUsed] = useState('0 B');
  const [storagePercent, setStoragePercent] = useState(0);
  const [storageLimit, setStorageLimit] = useState('5 GB');
  
  useEffect(() => {
    fetchDocumentStats();
    
    const handleDocumentChange = () => {
      fetchDocumentStats();
    };
    
    window.addEventListener('documentDeleted', handleDocumentChange);
    window.addEventListener('documentUploaded', handleDocumentChange);
    
    return () => {
      window.removeEventListener('documentDeleted', handleDocumentChange);
      window.removeEventListener('documentUploaded', handleDocumentChange);
    };
  }, []);
  
  const fetchDocumentStats = async () => {
    try {
      const files = await listDocuments();
      setDocumentCount(files.length);
      
      const totalBytes = files.reduce((acc, file) => {
        const size = file.sizeOriginal || 0;
        return acc + size;
      }, 0);
      
      const totalMB = totalBytes / (1024 * 1024);
      const totalGB = totalBytes / (1024 * 1024 * 1024);
      
      const { getCurrentUser, getUserPlanLimits } = await import('@/lib/appwrite');
      const currentUser = await getCurrentUser();
      const limits = getUserPlanLimits(currentUser);
      const maxStorageBytes = limits.storage;
      
      setStorageLimit(limits.displayStorage);
      const percent = maxStorageBytes === Infinity ? 0 : Math.min((totalBytes / maxStorageBytes) * 100, 100);
      setStoragePercent(Math.round(percent));
      
      if (totalGB >= 0.01) {
        setStorageUsed(`${totalGB.toFixed(2)} GB`);
      } else {
        setStorageUsed(`${totalMB.toFixed(2)} MB`);
      }
    } catch (error) {
      console.error('Failed to fetch document stats:', error);
    }
  };

  const menuItems = [
    { id: 'library' as View, label: 'Library', icon: FileText },
    { id: 'search' as View, label: 'Search', icon: Search },
    { id: 'insights' as View, label: 'Insights', icon: Network },
    { id: 'upload' as View, label: 'Upload', icon: Upload },
    { id: 'chat' as View, label: 'Chat', icon: MessageSquare },
  ];

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
    <aside 
      className={`hidden md:flex bg-[rgb(20,20,20)] border-r border-[rgb(40,40,40)] flex-col transition-all duration-300 ${
        collapsed ? 'w-[80px]' : 'w-[280px]'
      }`}
    >
      <div className={`p-6 border-b border-[rgb(40,40,40)] ${collapsed ? 'px-4' : ''}`}>
        <button 
          onClick={() => router.push('/')}
          className={`flex items-center group ${collapsed ? 'justify-center' : 'gap-2'}`}
        >
          <div className="w-9 h-9 rounded-[10px] bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] flex items-center justify-center group-hover:border-[rgb(60,60,60)] transition-colors">
            <img src={"./prism light.png"}/>
          </div>
          {!collapsed && (
            <span 
              className="text-white text-[18px] group-hover:text-[rgb(200,200,200)] transition-colors"
              style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
            >
              PRISM APP
            </span>
          )}
        </button>
      </div>

      {!collapsed && (
        <div className="p-4 mx-4 my-4 bg-[rgb(25,25,25)] border border-[rgb(50,50,50)] rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-[14px] h-[14px] text-[rgb(160,160,160)]" />
            <span 
              className="text-[rgb(130,130,130)] text-[11.5px]"
              style={{ fontFamily: "'Geist Mono', ui-monospace" }}
            >
              STATS
            </span>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span 
                  className="text-[rgb(130,130,130)] text-[11.9px]"
                  style={{ fontFamily: "'Geist Mono', ui-monospace" }}
                >
                  DOCUMENTS
                </span>
                <span 
                  className="text-white text-[20px] leading-none"
                  style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
                >
                  {documentCount}
                </span>
              </div>
            </div>

            <div className="h-px bg-[rgb(40,40,40)]"></div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <span 
                  className="text-[rgb(130,130,130)] text-[11.9px]"
                  style={{ fontFamily: "'Geist Mono', ui-monospace" }}
                >
                  STORAGE USED
                </span>
                <span 
                  className="text-[rgb(200,200,200)] text-[12px]"
                  style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
                >
                  {(() => {
                    const value = parseFloat(storageUsed);
                    const unit = storageUsed.split(' ')[1];
                    const sizeInGB = unit === 'MB' ? value / 1024 : value;
                    const percentage = (sizeInGB / 10) * 100;
                    return percentage < 1 ? percentage.toFixed(2) : percentage.toFixed(0);
                  })()}%
                </span>
              </div>
              
              <div className="w-full h-2 bg-[rgb(40,40,40)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[rgb(230,230,230)] rounded-full transition-all duration-300"
                  style={{ width: `${(() => {
                    const value = parseFloat(storageUsed);
                    const unit = storageUsed.split(' ')[1];
                    const sizeInGB = unit === 'MB' ? value / 1024 : value;
                    return Math.min((sizeInGB / 10) * 100, 100);
                  })()}%` }}
                ></div>
              </div>
              
              <p 
                className="text-[rgb(100,100,100)] text-[10px] mt-2"
                style={{ fontFamily: "'Geist Mono', ui-monospace" }}
              >
                {storageUsed} / {storageLimit}
              </p>
            </div>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="px-4 py-4 border-b border-[rgb(40,40,40)]">
          <div className="text-center">
            <div 
              className="text-white text-[22px] leading-none mb-1"
              style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
            >
              {documentCount}
            </div>
            <div 
              className="text-[rgb(100,100,100)] text-[9px]"
              style={{ fontFamily: "'Geist Mono', ui-monospace" }}
            >
              DOCS
            </div>
          </div>
        </div>
      )}

      <nav className={`flex-1 ${collapsed ? 'p-2' : 'p-4'}`}>
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center rounded-[10px] transition-colors border ${
                  collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
                } ${
                  isActive
                    ? 'bg-[rgb(30,30,30)] border-[rgb(50,50,50)] text-white'
                    : 'border-transparent text-[rgb(160,160,160)] hover:bg-[rgb(25,25,25)] hover:text-[rgb(200,200,200)] hover:border-[rgb(50,50,50)]'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-[18px] h-[18px]" />
                {!collapsed && (
                  <span 
                    className="text-[14.75px]"
                    style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <div className={`border-t border-[rgb(40,40,40)] space-y-1 ${collapsed ? 'p-2' : 'p-4'}`}>
        <button
          onClick={() => router.push('/')}
          className={`w-full flex items-center rounded-[10px] text-[rgb(160,160,160)] hover:bg-[rgb(25,25,25)] hover:text-[rgb(200,200,200)] transition-colors ${
            collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
          }`}
          title={collapsed ? "Home" : undefined}
        >
          <Home className="w-[18px] h-[18px]" />
          {!collapsed && (
            <span 
              className="text-[14.75px]"
              style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
            >
              Home
            </span>
          )}
        </button>
        
        <button
          onClick={handleLogout}
          className={`w-full flex items-center rounded-[10px] text-[rgb(160,160,160)] hover:bg-[rgb(25,25,25)] hover:text-[rgb(200,200,200)] transition-colors ${
            collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
          }`}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="w-[18px] h-[18px]" />
          {!collapsed && (
            <span 
              className="text-[14.75px]"
              style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
            >
              Logout
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
