"use client";

import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Edit2, Check } from 'lucide-react';
import { uploadDocument, account, listDocuments } from '@/lib/appwrite';

const cleanFileName = (filename: string): string => {
  const parts = filename.split('.');
  const extension = parts.pop() || '';
  let name = parts.join('.');
  name = name.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '');
  name = name.replace(/[-_]+/g, '-');
  name = name.replace(/^-+|-+$/g, '');
  
  if (!name || name.length === 0) {
    name = 'unnamed-file';
  }
  
  return extension ? `${name}.${extension}` : name;
};

interface DocUploadProps {
  onUploadComplete: () => void;
}

interface UploadedFile {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'processing' | 'indexing' | 'complete' | 'error';
  progress: number;
  error?: string;
  appwriteId?: string;
  isEditing?: boolean;
  file?: File;
}

export default function DocUpload({ onUploadComplete }: DocUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = async (fileList: File[]) => {
    const validFiles = fileList.filter(file => {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown'];
      const validExtensions = ['.pdf', '.doc', '.docx', '.txt', '.md'];      
      const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.h', '.hpp', '.cs', '.rb', '.go', '.rs', '.php', '.swift', '.kt', '.scala', '.r', '.css', '.scss', '.sass', '.html', '.xml', '.json', '.yaml', '.yml', '.sql', '.sh', '.bash', '.ps1', '.bat'];      
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
      
      const allValidExtensions = [...validExtensions, ...codeExtensions, ...imageExtensions];
      const hasValidType = validTypes.includes(file.type) || allValidExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      const isValidSize = file.size <= 15 * 1024 * 1024;
      return hasValidType && isValidSize;
    });

    if (validFiles.length === 0) {
      alert('Please select valid files (Documents, Code, Images) under 10MB');
      return;
    }

    const newFiles: UploadedFile[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: cleanFileName(file.name),
      originalName: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      progress: 0,
      isEditing: false,
      file: file,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const startUpload = async (fileId: string) => {
    const fileData = files.find(f => f.id === fileId);
    if (!fileData || !fileData.file) return;
    
    const actualFile = fileData.file;
    
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, status: 'uploading' } : f
      )
    );
    
    try {
      const user = await account.get();
      if (!user?.$id) {
        throw new Error('User not authenticated');
      }

      const { getUserPlanLimits } = await import('@/lib/appwrite');
      const limits = getUserPlanLimits(user);
      const currentFiles = await listDocuments();
      const currentStorage = currentFiles.reduce((acc, file) => acc + (file.sizeOriginal || 0), 0);
      const newFileSize = actualFile.size;
      
      if (currentFiles.length >= limits.documents) {
        throw new Error(`Plan limit reached: You can only upload ${limits.documents} documents on your current plan. Please upgrade to upload more.`);
      }
      
      if (currentStorage + newFileSize > limits.storage) {
        const currentGB = (currentStorage / (1024 * 1024 * 1024)).toFixed(2);
        const limitGB = limits.displayStorage;
        throw new Error(`Storage limit reached: You've used ${currentGB} GB of ${limitGB}. Please upgrade your plan or delete some documents.`);
      }
      
      const renamedFile = new File([actualFile], fileData.name, { type: actualFile.type });
      const uploadedDoc = await uploadDocument(renamedFile, user.$id, (progress) => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, progress: Math.round(progress * 0.5), status: 'uploading' }
              : f
          )
        );
      });

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, appwriteId: uploadedDoc.$id, status: 'indexing', progress: 50 }
            : f
        )
      );

      const indexResponse = await fetch('/api/documents/index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: uploadedDoc.$id,
          userId: user.$id,
          fileName: fileData.name,
        }),
      });

      if (!indexResponse.ok) {
        throw new Error('Failed to index document');
      }

      const indexData = await indexResponse.json();
      console.log('✅ Document indexed:', indexData);

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: 'complete', progress: 100 }
            : f
        )
      );
      
      window.dispatchEvent(new CustomEvent('documentUploaded'));
    } catch (error: any) {
      console.error('Upload/indexing failed:', error);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: 'error', error: error.message || 'Upload failed' }
            : f
        )
      );
    }
  };

  const handleRename = (fileId: string, newName: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, name: newName, isEditing: false } : f
      )
    );
  };

  const toggleEdit = (fileId: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, isEditing: !f.isEditing } : f
      )
    );
  };

  const uploadAll = () => {
    files
      .filter(f => f.status === 'pending')
      .forEach(f => startUpload(f.id));
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] rounded-xl p-5">
          <p 
            className="text-[rgb(130,130,130)] text-[11px] mb-3"
            style={{ fontFamily: "'Geist Mono', ui-monospace" }}
          >
            SUPPORTED FORMATS
          </p>
          <p 
            className="text-[rgb(200,200,200)] text-[14px]"
            style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
          >
            Documents, Code, Images
          </p>
        </div>
        
        <div className="bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] rounded-xl p-5">
          <p 
            className="text-[rgb(130,130,130)] text-[11px] mb-3"
            style={{ fontFamily: "'Geist Mono', ui-monospace" }}
          >
            MAX FILE SIZE
          </p>
          <p 
            className="text-[rgb(200,200,200)] text-[14px]"
            style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
          >
            15 MB per file
          </p>
        </div>
        
        <div className="bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] rounded-xl p-5">
          <p 
            className="text-[rgb(130,130,130)] text-[11px] mb-3"
            style={{ fontFamily: "'Geist Mono', ui-monospace" }}
          >
            STORAGE AVAILABLE
          </p>
          <p 
            className="text-[rgb(200,200,200)] text-[14px]"
            style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
          >
            7.6 GB remaining
          </p>
        </div>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-12 md:p-16 text-center transition-all ${
          isDragging
            ? 'border-[rgb(230,230,230)] bg-[rgb(25,25,25)]'
            : 'border-[rgb(40,40,40)] bg-[rgb(20,20,20)]'
        }`}
      >
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-[rgb(230,230,230)]" />
          </div>
          
          <h3 
            className="text-[rgb(236,236,236)] text-[20px] mb-2"
            style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
          >
            Drop your documents here
          </h3>
          
          <p 
            className="text-[rgb(130,130,130)] text-[14px] mb-6"
            style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
          >
            or click to browse from your computer
          </p>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.md,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.rb,.go,.rs,.php,.swift,.kt,.html,.css,.json,.yaml,.yml,.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-white text-[rgb(15,15,15)] rounded-xl hover:bg-gray-100 transition-colors"
            style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
          >
            Browse Files
          </button>

          <p 
            className="text-[rgb(100,100,100)] text-[12px] mt-4"
            style={{ fontFamily: "'Geist Mono', ui-monospace" }}
          >
            Documents (PDF, DOCX, TXT, MD) • Code (JS, TS, PY, etc.) • Images (JPG, PNG, etc.) • Max 10MB
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-8">
          <h4 
            className="text-[rgb(236,236,236)] text-[18px] mb-4"
            style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
          >
            Uploaded Files ({files.length})
          </h4>

          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] rounded-xl p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-[8px] bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] flex items-center justify-center flex-shrink-0">
                  {file.status === 'complete' ? (
                    <CheckCircle className="w-5 h-5 text-[rgb(163,254,196)]" />
                  ) : file.status === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-[rgb(255,108,122)]" />
                  ) : (
                    <FileText className="w-5 h-5 text-[rgb(230,230,230)]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    {file.isEditing && file.status === 'pending' ? (
                      <div className="flex items-center gap-1 flex-1">
                        <input
                          type="text"
                          value={file.name.substring(0, file.name.lastIndexOf('.')) || file.name}
                          onChange={(e) => {
                            const ext = file.name.substring(file.name.lastIndexOf('.'));
                            setFiles(prev => prev.map(f => f.id === file.id ? {...f, name: e.target.value + ext} : f));
                          }}
                          onBlur={() => toggleEdit(file.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') toggleEdit(file.id);
                            if (e.key === 'Escape') {
                              setFiles(prev => prev.map(f => f.id === file.id ? {...f, name: cleanFileName(f.originalName), isEditing: false} : f));
                            }
                          }}
                          autoFocus
                          className="flex-1 bg-[rgb(30,30,30)] border border-[rgb(60,60,60)] rounded-lg px-2 py-1 text-[rgb(236,236,236)] text-[14px] focus:outline-none focus:border-white"
                          style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                        />
                        <span className="text-[rgb(130,130,130)] text-[14px]" style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}>
                          {file.name.substring(file.name.lastIndexOf('.'))}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <p 
                          className="text-[rgb(236,236,236)] text-[14px] truncate"
                          style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                        >
                          {file.name}
                        </p>
                        {file.status === 'pending' && (
                          <button
                            onClick={() => toggleEdit(file.id)}
                            className="shrink-0 w-6 h-6 rounded flex items-center justify-center text-[rgb(130,130,130)] hover:text-[rgb(200,200,200)] hover:bg-[rgb(30,30,30)] transition-colors"
                            title="Rename file"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                    <span 
                      className="text-[rgb(130,130,130)] text-[12px] ml-2 shrink-0"
                      style={{ fontFamily: "'Geist Mono', ui-monospace" }}
                    >
                      {formatFileSize(file.size)}
                    </span>
                  </div>

                  {file.status !== 'complete' && file.status !== 'pending' && (
                    <div className="w-full h-1.5 bg-[rgb(40,40,40)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      ></div>
                    </div>
                  )}

                  <p 
                    className={`text-[12px] mt-1 ${file.status === 'error' ? 'text-[rgb(255,108,122)]' : file.status === 'complete' ? 'text-[rgb(163,254,196)]' : file.status === 'pending' ? 'text-[rgb(147,197,253)]' : 'text-[rgb(130,130,130)]'}`}
                    style={{ fontFamily: "'Geist Mono', ui-monospace" }}
                  >
                    {file.status === 'pending' && '⏸ Ready to upload (click edit to rename)'}
                    {file.status === 'uploading' && `Uploading... ${file.progress}%`}
                    {file.status === 'processing' && 'Processing...'}
                    {file.status === 'indexing' && `Indexing... ${file.progress}%`}
                    {file.status === 'complete' && '✓ Ready for search'}
                    {file.status === 'error' && (file.error || 'Upload failed')}
                  </p>
                </div>

                <button
                  onClick={() => removeFile(file.id)}
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[rgb(160,160,160)] hover:bg-[rgb(30,30,30)] hover:text-[rgb(200,200,200)] transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            {files.some(f => f.status === 'pending') && (
              <button
                onClick={uploadAll}
                className="px-6 py-3 bg-white text-[rgb(15,15,15)] rounded-xl hover:bg-gray-100 transition-colors font-medium"
                style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
              >
                Upload {files.filter(f => f.status === 'pending').length} File(s)
              </button>
            )}
            {files.some(f => f.status === 'complete') && (
              <button
                onClick={onUploadComplete}
                className="px-6 py-3 bg-white text-[rgb(15,15,15)] rounded-xl hover:bg-gray-100 transition-colors"
                style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
              >
                View Library
              </button>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] text-[rgb(200,200,200)] rounded-xl hover:bg-[rgb(35,35,35)] transition-colors"
              style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
            >
              Add More Files
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
