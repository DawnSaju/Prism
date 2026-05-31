"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { uploadDocument, account, listDocuments } from '@/lib/appwrite';

export interface UploadedFile {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'processing' | 'indexing' | 'complete' | 'error';
  progress: number;
  statusMessage?: string;
  error?: string;
  appwriteId?: string;
  isEditing?: boolean;
  file?: File;
}

interface UploadContextType {
  files: UploadedFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  startUpload: (fileId: string) => Promise<void>;
  uploadAll: () => void;
  removeFile: (fileId: string) => void;
  handleRename: (fileId: string, newName: string) => void;
  toggleEdit: (fileId: string) => void;
  clearCompleted: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error('useUpload must be used within an UploadProvider');
  }
  return context;
};

export const cleanFileName = (filename: string): string => {
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

export function UploadProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const handleRename = useCallback((fileId: string, newName: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, name: newName, isEditing: false } : f
      )
    );
  }, []);

  const toggleEdit = useCallback((fileId: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, isEditing: !f.isEditing } : f
      )
    );
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  }, []);

  const clearCompleted = useCallback(() => {
    setFiles((prev) => prev.filter((file) => file.status !== 'complete'));
  }, []);

  const startUpload = async (fileId: string) => {
    const fileData = files.find(f => f.id === fileId);
    if (!fileData || !fileData.file) return;
    
    const actualFile = fileData.file;
    
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, status: 'uploading', statusMessage: 'Preparing upload...' } : f
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
        throw new Error(`Storage limit reached: You've used ${currentGB} GB of ${limitGB}.`);
      }
      
      const renamedFile = new File([actualFile], fileData.name, { type: actualFile.type });
      
      setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, statusMessage: 'Uploading to storage...' } : f));

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
            ? { ...f, appwriteId: uploadedDoc.$id, status: 'indexing', progress: 50, statusMessage: 'Initiating indexing...' }
            : f
        )
      );

      const indexResponse = await fetch('/api/documents/index', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          documentId: uploadedDoc.$id,
          userId: user.$id,
          fileName: fileData.name,
        }),
      });

      if (!indexResponse.ok) {
        throw new Error('Failed to start indexing');
      }

      const reader = indexResponse.body?.getReader();
      const decoder = new TextDecoder();
      let isSuccess = false;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.error) {
                  throw new Error(data.error);
                }

                if (data.success) {
                  isSuccess = true;
                  break;
                }

                setFiles((prev) => prev.map((f) => f.id === fileId ? { 
                  ...f, 
                  progress: 50 + Math.round((data.progress || 0) * 0.5), 
                  statusMessage: data.message || 'Processing...' 
                } : f));
              } catch (e) {
                if (e instanceof Error && e.message !== "Unexpected end of JSON input") {
                  throw e;
                }
              }
            }
          }
        }
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: 'complete', progress: 100, statusMessage: 'Ready for search!' }
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

  const uploadAll = useCallback(() => {
    files
      .filter(f => f.status === 'pending')
      .forEach(f => startUpload(f.id));
  }, [files]);

  return (
    <UploadContext.Provider value={{
      files, setFiles, startUpload, uploadAll, removeFile, handleRename, toggleEdit, clearCompleted
    }}>
      {children}
    </UploadContext.Provider>
  );
}
