"use client";

import React, { useState } from "react";
import { useUpload } from "@/contexts/UploadContext";
import { FileText, CheckCircle, AlertCircle, Loader2, ChevronUp, ChevronDown, X } from "lucide-react";

export default function GlobalUploadProgress() {
  const { files, removeFile, clearCompleted } = useUpload();
  const [isMinimized, setIsMinimized] = useState(false);

  const activeFiles = files.filter(f => f.status !== 'pending');
  
  if (activeFiles.length === 0) return null;

  const inProgressCount = activeFiles.filter(f => ['uploading', 'processing', 'indexing'].includes(f.status)).length;
  const completedCount = activeFiles.filter(f => f.status === 'complete').length;
  const errorCount = activeFiles.filter(f => f.status === 'error').length;

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
      <div 
        className="px-4 py-3 bg-[rgb(25,25,25)] border-b border-[rgb(40,40,40)] flex items-center justify-between cursor-pointer hover:bg-[rgb(30,30,30)] transition-colors"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          {inProgressCount > 0 ? (
            <Loader2 className="w-4 h-4 text-[rgb(147,197,253)] animate-spin" />
          ) : errorCount > 0 ? (
            <AlertCircle className="w-4 h-4 text-[rgb(255,108,122)]" />
          ) : (
            <CheckCircle className="w-4 h-4 text-[rgb(163,254,196)]" />
          )}
          <span 
            className="text-[13px] text-white font-medium"
            style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", sans-serif' }}
          >
            {inProgressCount > 0 ? `Processing ${inProgressCount} file${inProgressCount > 1 ? 's' : ''}` : `Completed ${completedCount} file${completedCount > 1 ? 's' : ''}`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {completedCount > 0 && inProgressCount === 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearCompleted();
              }}
              className="text-[11px] text-[rgb(160,160,160)] hover:text-white px-2 py-1 rounded bg-[rgb(35,35,35)] mr-2"
              style={{ fontFamily: '"Geist Mono", ui-monospace' }}
            >
              Clear
            </button>
          )}
          {isMinimized ? <ChevronUp className="w-4 h-4 text-[rgb(160,160,160)]" /> : <ChevronDown className="w-4 h-4 text-[rgb(160,160,160)]" />}
        </div>
      </div>

      {!isMinimized && (
        <div className="max-h-64 overflow-y-auto p-2 space-y-1 bg-[rgb(15,15,15)] scrollbar-thin scrollbar-thumb-[rgb(60,60,60)] scrollbar-track-transparent">
          {activeFiles.map(file => (
            <div key={file.id} className="p-3 rounded-lg bg-[rgb(20,20,20)] border border-[rgb(35,35,35)] relative group">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {file.status === 'complete' ? (
                    <CheckCircle className="w-4 h-4 text-[rgb(163,254,196)]" />
                  ) : file.status === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-[rgb(255,108,122)]" />
                  ) : (
                    <FileText className="w-4 h-4 text-[rgb(147,197,253)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p 
                    className="text-[13px] text-[rgb(230,230,230)] truncate pr-4"
                    style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", sans-serif' }}
                    title={file.name}
                  >
                    {file.name}
                  </p>
                  
                  {file.status !== 'complete' && file.status !== 'error' && (
                    <div className="w-full h-1 bg-[rgb(40,40,40)] rounded-full mt-2 mb-1.5 overflow-hidden">
                      <div 
                        className="h-full bg-[rgb(147,197,253)] transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}

                  <p 
                    className={`text-[10px] mt-1 line-clamp-1 ${file.status === 'error' ? 'text-[rgb(255,108,122)]' : file.status === 'complete' ? 'text-[rgb(163,254,196)]' : 'text-[rgb(140,140,140)]'}`}
                    style={{ fontFamily: '"Geist Mono", ui-monospace' }}
                  >
                    {file.status === 'error' ? file.error : file.statusMessage || 'Processing...'}
                  </p>
                </div>

                {(file.status === 'complete' || file.status === 'error') && (
                  <button
                    onClick={() => removeFile(file.id)}
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded text-[rgb(100,100,100)] opacity-0 group-hover:opacity-100 hover:bg-[rgb(40,40,40)] hover:text-white transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
