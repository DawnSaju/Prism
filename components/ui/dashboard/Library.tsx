"use client";

import React, { useState, useEffect } from "react";
import { Search, FileText, Filter, MoreVertical, Trash2, Download, Upload, Grid3x3, List, Clock, Calendar, ChevronDown, File, FileCode, FileImage, Sparkles, Edit2, Check, X as XIcon, Eye, MessageSquare } from "lucide-react";
import { listDocuments, deleteDocument, renameDocument, downloadDocument, storage } from "@/lib/appwrite";
import { useAuth } from "@/contexts/AuthContext";
import ConfirmationModal from "./ConfirmationModal";
import type { Models } from "appwrite";

interface LibraryProps {
  onDocumentSelect: (docId: string) => void;
  onChatWithDocument?: (docId: string, docName: string) => void;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  preview: string;
  category: "documents" | "code" | "image" | "other";
  isRenaming?: boolean;
}

export default function Library({ onDocumentSelect, onChatWithDocument }: LibraryProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "size">("recent");
  const [filterType, setFilterType] = useState<"all" | "documents" | "code" | "image">("all");
  const [previewFile, setPreviewFile] = useState<Document | null>(null);
  const [codeContent, setCodeContent] = useState<string>("");
  const [loadingCode, setLoadingCode] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; fileId: string | null }>({ isOpen: false, fileId: null });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const files = await listDocuments();
      
      const formattedDocs: Document[] = files.map((file: Models.File) => {
        const extension = file.name.split(".").pop()?.toLowerCase() || "";
        let category: "documents" | "code" | "image" | "other" = "other";
        let type = extension.toUpperCase();
        
        const codeExtensions = ["js", "jsx", "ts", "tsx", "py", "java", "cpp", "c", "h", "hpp", "cs", "rb", "go", "rs", "php", "swift", "kt", "scala", "r", "css", "scss", "sass", "html", "xml", "json", "yaml", "yml", "sql", "sh", "bash", "ps1", "bat"];
        const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
        const documentExtensions = ["pdf", "doc", "docx", "md", "txt"];
        
        if (documentExtensions.includes(extension)) category = "documents";
        else if (codeExtensions.includes(extension)) category = "code";
        else if (imageExtensions.includes(extension)) category = "image";
        
        return {
          id: file.$id,
          name: file.name,
          type,
          size: formatFileSize(file.sizeOriginal),
          date: formatDate(file.$createdAt),
          preview: `Document uploaded on ${new Date(file.$createdAt).toLocaleDateString()}`,
          category,
        };
      });
      
      setDocuments(formattedDocs);
    } catch (err: any) {
      console.error("Failed to fetch documents:", err);
      setError(err.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const handleDelete = async (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({ isOpen: true, fileId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.fileId) return;
    
    try {
      await deleteDocument(deleteConfirm.fileId);
      await fetchDocuments();
      
      window.dispatchEvent(new CustomEvent("documentDeleted"));
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(err.message || "Failed to delete document");
    }
  };

  const startRename = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === fileId ? { ...doc, isRenaming: true } : doc
      )
    );
  };

  const handleRename = async (fileId: string, newName: string) => {
    if (!newName.trim()) {
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === fileId ? { ...doc, isRenaming: false } : doc
        )
      );
      return;
    }

    try {
      await renameDocument(fileId, newName);
      await fetchDocuments();
    } catch (err: any) {
      console.error("Rename failed:", err);
      alert(err.message || "Failed to rename document");
      await fetchDocuments();
    }
  };

  const cancelRename = (fileId: string) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === fileId ? { ...doc, isRenaming: false } : doc
      )
    );
  };

  const handleDownload = async (fileId: string, fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await downloadDocument(fileId);
      
      const blob = new Blob([result]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error("Download failed:", err);
      alert(err.message || "Failed to download document");
    }
  };

  const handlePreview = async (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewFile(doc);
    setCodeContent("");
    
    if (doc.category === "code") {
      setLoadingCode(true);
      try {
        const response = await fetch(`/api/documents/content?fileId=${doc.id}`);
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `Failed to fetch file: ${response.status}`);
        }
        
        const text = await response.text();
        setCodeContent(text);
      } catch (error) {
        console.error("Error loading code:", error);
        setCodeContent("// Error loading file content\n// Please check browser console for details");
      } finally {
        setLoadingCode(false);
      }
    }
  };

  const fetchRecommendations = async (docId: string) => {
    if (!user?.$id) {
      console.log("⚠️ No user ID, skipping recommendations");
      return;
    }
    
    try {
      setLoadingRecs(true);
      console.log("📚 Fetching recommendations for document:", docId);
      const response = await fetch(
        `/api/documents/recommendations?documentId=${docId}&userId=${user.$id}&limit=5`
      );
      const data = await response.json();
      console.log("📊 Recommendations response:", data);
      
      if (data.success) {
        setRecommendations(data.recommendations);
        console.log(`✅ Loaded ${data.recommendations.length} recommendations`);
      } else {
        console.log("❌ Recommendations failed:", data.error);
      }
    } catch (err) {
      console.error("❌ Failed to fetch recommendations:", err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleDocumentClick = (docId: string, e?: React.MouseEvent) => {
    if (selectedDocId === docId) {
      onDocumentSelect(docId);
      return;
    }
    
    setSelectedDocId(docId);
    fetchRecommendations(docId);
  };

  const filteredDocuments = documents
    .filter((doc) => doc.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((doc) => filterType === "all" || doc.category === filterType);

  const getDocumentIcon = (category: string) => {
    switch (category) {
      case "documents":
        return <FileText className="w-5 h-5" />;
      case "code":
        return <FileCode className="w-5 h-5" />;
      case "image":
        return <FileImage className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getDocumentColor = (category: string) => {
    switch (category) {
      case "documents":
        return "text-[rgb(230,230,230)]";
      case "code":
        return "text-[rgb(163,254,196)]";
      case "image":
        return "text-[rgb(147,197,253)]";
      default:
        return "text-[rgb(180,180,180)]";
    }
  };

  const formatStorageSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    if (bytes < 1024) return bytes.toFixed(0) + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };

  const totalSizeBytes = documents.reduce((acc, doc) => {
    const sizeMatch = doc.size.match(/([\d.]+)\s*(B|KB|MB|GB)/);
    if (sizeMatch) {
      const value = parseFloat(sizeMatch[1]);
      const unit = sizeMatch[2];
      const bytes = unit === "GB" ? value * 1024 * 1024 * 1024 : 
                   unit === "MB" ? value * 1024 * 1024 :
                   unit === "KB" ? value * 1024 : value;
      return acc + bytes;
    }
    return acc;
  }, 0);

  const stats = {
    total: documents.length,
    thisWeek: documents.filter(doc => doc.date.includes("day") || doc.date === "Today" || doc.date === "Yesterday").length,
    totalSize: formatStorageSize(totalSizeBytes),
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FileText className="w-8 h-8 text-[rgb(130,130,130)]" />
          </div>
          <p className="text-[rgb(130,130,130)] text-[14px]" style={{ fontFamily: "\"3 TT_Firs_Neue_Regular Unspecified\", \"3 TT_Firs_Neue_Regular Unspecified Placeholder\", sans-serif" }}>
            Loading documents...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-[rgb(255,108,122)]" />
          </div>
          <p className="text-[rgb(255,108,122)] text-[14px] mb-2" style={{ fontFamily: "\"3 TT_Firs_Neue_Regular Unspecified\", \"3 TT_Firs_Neue_Regular Unspecified Placeholder\", sans-serif" }}>
            {error}
          </p>
          <button 
            onClick={fetchDocuments}
            className="px-4 py-2 bg-white text-[rgb(15,15,15)] rounded-xl hover:bg-gray-100 transition-colors text-[13px]"
            style={{ fontFamily: "\"3 TT_Firs_Neue_Regular Unspecified\", \"3 TT_Firs_Neue_Regular Unspecified Placeholder\", sans-serif" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col max-w-7xl mx-auto">
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-dashed border-[rgb(40,40,40)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] flex items-center justify-center">
              <FileText className="w-5 h-5 text-[rgb(180,180,180)]" />
            </div>
            <div>
              <p 
                className="text-white text-[20px] leading-none mb-1"
                style={{ fontFamily: "\"2 TT_Firs_Neue_DemiBold Unspecified\", \"2 TT_Firs_Neue_DemiBold Unspecified Placeholder\", sans-serif" }}
              >
                {stats.total}
              </p>
              <p 
                className="text-[rgb(130,130,130)] text-[11px]"
                style={{ fontFamily: "\"Geist Mono\", ui-monospace" }}
              >
                TOTAL DOCS
              </p>
            </div>
          </div>

          <div className="w-px h-10 bg-[rgb(40,40,40)]" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] flex items-center justify-center">
              <Clock className="w-5 h-5 text-[rgb(180,180,180)]" />
            </div>
            <div>
              <p 
                className="text-white text-[20px] leading-none mb-1"
                style={{ fontFamily: "\"2 TT_Firs_Neue_DemiBold Unspecified\", \"2 TT_Firs_Neue_DemiBold Unspecified Placeholder\", sans-serif" }}
              >
                {stats.thisWeek}
              </p>
              <p 
                className="text-[rgb(130,130,130)] text-[11px]"
                style={{ fontFamily: "\"Geist Mono\", ui-monospace" }}
              >
                THIS WEEK
              </p>
            </div>
          </div>

          <div className="w-px h-10 bg-[rgb(40,40,40)]" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] flex items-center justify-center">
              <FileText className="w-5 h-5 text-[rgb(180,180,180)]" />
            </div>
            <div>
              <p 
                className="text-white text-[20px] leading-none mb-1"
                style={{ fontFamily: "\"2 TT_Firs_Neue_DemiBold Unspecified\", \"2 TT_Firs_Neue_DemiBold Unspecified Placeholder\", sans-serif" }}
              >
                {stats.totalSize}
              </p>
              <p 
                className="text-[rgb(130,130,130)] text-[11px]"
                style={{ fontFamily: "\"Geist Mono\", ui-monospace" }}
              >
                STORAGE USED
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 pointer-events-none" style={{ transform: "translateY(-50%)" }}>
              <Search className="w-[18px] h-[18px] text-[rgb(130,130,130)]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] rounded-[10px] pl-12 pr-4 py-3 text-white placeholder-[rgb(100,100,100)] focus:outline-none focus:border-[rgb(60,60,60)] transition-colors text-[14px]"
              style={{ fontFamily: "\"3 TT_Firs_Neue_Regular Unspecified\", \"3 TT_Firs_Neue_Regular Unspecified Placeholder\", sans-serif" }}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2.5 rounded-[8px] text-[13px] transition-all border ${
                filterType === "all"
                  ? "bg-white text-[rgb(15,15,15)] border-white"
                  : "bg-transparent text-[rgb(160,160,160)] border-[rgb(40,40,40)] hover:border-[rgb(60,60,60)] hover:text-[rgb(200,200,200)]"
              }`}
              style={{ fontFamily: "\"3 TT_Firs_Neue_Regular Unspecified\", \"3 TT_Firs_Neue_Regular Unspecified Placeholder\", sans-serif" }}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("documents")}
              className={`px-4 py-2.5 rounded-[8px] text-[13px] transition-all border ${
                filterType === "documents"
                  ? "bg-white text-[rgb(15,15,15)] border-white"
                  : "bg-transparent text-[rgb(160,160,160)] border-[rgb(40,40,40)] hover:border-[rgb(60,60,60)] hover:text-[rgb(200,200,200)]"
              }`}
              style={{ fontFamily: "\"3 TT_Firs_Neue_Regular Unspecified\", \"3 TT_Firs_Neue_Regular Unspecified Placeholder\", sans-serif" }}
            >
              Documents
            </button>
            <button
              onClick={() => setFilterType("code")}
              className={`px-4 py-2.5 rounded-[8px] text-[13px] transition-all border ${
                filterType === "code"
                  ? "bg-white text-[rgb(15,15,15)] border-white"
                  : "bg-transparent text-[rgb(160,160,160)] border-[rgb(40,40,40)] hover:border-[rgb(60,60,60)] hover:text-[rgb(200,200,200)]"
              }`}
              style={{ fontFamily: "\"3 TT_Firs_Neue_Regular Unspecified\", \"3 TT_Firs_Neue_Regular Unspecified Placeholder\", sans-serif" }}
            >
              Code
            </button>
            <button
              onClick={() => setFilterType("image")}
              className={`px-4 py-2.5 rounded-[8px] text-[13px] transition-all border ${
                filterType === "image"
                  ? "bg-white text-[rgb(15,15,15)] border-white"
                  : "bg-transparent text-[rgb(160,160,160)] border-[rgb(40,40,40)] hover:border-[rgb(60,60,60)] hover:text-[rgb(200,200,200)]"
              }`}
              style={{ fontFamily: "\"3 TT_Firs_Neue_Regular Unspecified\", \"3 TT_Firs_Neue_Regular Unspecified Placeholder\", sans-serif" }}
            >
              Images
            </button>
          </div>

          <div className="flex items-center gap-1 bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] rounded-[8px] p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-[6px] transition-colors ${
                viewMode === "grid"
                  ? "bg-[rgb(30,30,30)] text-white"
                  : "text-[rgb(160,160,160)] hover:text-[rgb(200,200,200)]"
              }`}
              title="Grid view"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-[6px] transition-colors ${
                viewMode === "list"
                  ? "bg-[rgb(30,30,30)] text-white"
                  : "text-[rgb(160,160,160)] hover:text-[rgb(200,200,200)]"
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 -mx-1 px-1 scrollbar-thin scrollbar-thumb-[rgb(60,60,60)] scrollbar-track-[rgb(20,20,20)] hover:scrollbar-thumb-[rgb(80,80,80)]">
        <div className="mb-4 flex items-center justify-between">
          <p 
            className="text-[rgb(130,130,130)] text-[13px]"
            style={{ fontFamily: "\"Geist Mono\", ui-monospace" }}
          >
            {filteredDocuments.length} {filteredDocuments.length === 1 ? "DOCUMENT" : "DOCUMENTS"}
          </p>
        </div>

        {viewMode === "grid" && filteredDocuments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className={`bg-[rgb(20,20,20)] border rounded-[12px] p-5 hover:border-[rgb(80,80,80)] hover:bg-[rgb(22,22,22)] transition-all cursor-pointer group ${
                  selectedDocId === doc.id ? "border-white" : "border-[rgb(40,40,40)]"
                }`}
                onClick={() => handleDocumentClick(doc.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-[8px] bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] flex items-center justify-center">
                    <span className={getDocumentColor(doc.category)}>
                      {getDocumentIcon(doc.category)}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => handlePreview(doc, e)}
                      className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[rgb(160,160,160)] hover:bg-[rgb(30,30,30)] hover:text-[rgb(200,200,200)] transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => startRename(doc.id, e)}
                      className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[rgb(160,160,160)] hover:bg-[rgb(30,30,30)] hover:text-[rgb(200,200,200)] transition-colors"
                      title="Rename document"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDownload(doc.id, doc.name, e)}
                      className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[rgb(160,160,160)] hover:bg-[rgb(30,30,30)] hover:text-[rgb(200,200,200)] transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(doc.id, e)}
                      className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[rgb(160,160,160)] hover:bg-[rgb(30,30,30)] hover:text-[rgb(255,108,122)] transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {doc.isRenaming ? (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1 flex-1">
                      <input
                        type="text"
                        defaultValue={doc.name.substring(0, doc.name.lastIndexOf(".")) || doc.name}
                        onBlur={(e) => {
                          const ext = doc.name.substring(doc.name.lastIndexOf("."));
                          handleRename(doc.id, e.target.value + ext);
                        }}
                        onKeyDown={(e) => {
                          const ext = doc.name.substring(doc.name.lastIndexOf("."));
                          if (e.key === "Enter") handleRename(doc.id, e.currentTarget.value + ext);
                          if (e.key === "Escape") cancelRename(doc.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        className="flex-1 bg-[rgb(30,30,30)] border border-[rgb(60,60,60)] rounded-lg px-2 py-1.5 text-[rgb(236,236,236)] text-[15px] focus:outline-none focus:border-white"
                        style={{ fontFamily: "\"2 TT_Firs_Neue_DemiBold Unspecified\", \"2 TT_Firs_Neue_DemiBold Unspecified Placeholder\", sans-serif" }}
                      />
                      <span className="text-[rgb(130,130,130)] text-[15px]" style={{ fontFamily: "\"2 TT_Firs_Neue_DemiBold Unspecified\", \"2 TT_Firs_Neue_DemiBold Unspecified Placeholder\", sans-serif" }}>
                        {doc.name.substring(doc.name.lastIndexOf("."))}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const container = e.currentTarget.previousElementSibling as HTMLDivElement;
                        const input = container.querySelector("input") as HTMLInputElement;
                        const ext = doc.name.substring(doc.name.lastIndexOf("."));
                        handleRename(doc.id, input.value + ext);
                      }}
                      className="w-7 h-7 rounded flex items-center justify-center text-[rgb(163,254,196)] hover:bg-[rgb(30,30,30)] transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelRename(doc.id);
                      }}
                      className="w-7 h-7 rounded flex items-center justify-center text-[rgb(255,108,122)] hover:bg-[rgb(30,30,30)] transition-colors"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <h3 
                    className="text-[rgb(236,236,236)] text-[15px] mb-2 truncate"
                    style={{ fontFamily: "\"2 TT_Firs_Neue_DemiBold Unspecified\", \"2 TT_Firs_Neue_DemiBold Unspecified Placeholder\", sans-serif" }}
                  >
                    {doc.name}
                  </h3>
                )}

                <p 
                  className="text-[rgb(130,130,130)] text-[13px] mb-4 line-clamp-2 leading-relaxed"
                  style={{ fontFamily: "\"3 TT_Firs_Neue_Regular Unspecified\", \"3 TT_Firs_Neue_Regular Unspecified Placeholder\", sans-serif" }}
                >
                  {doc.preview}
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-dashed border-[rgb(40,40,40)]">
                  <span 
                    className="text-[rgb(100,100,100)] text-[11px]"
                    style={{ fontFamily: "\"Geist Mono\", ui-monospace" }}
                  >
                    {doc.size}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[rgb(60,60,60)]" />
                  <span 
                    className="text-[rgb(100,100,100)] text-[11px]"
                    style={{ fontFamily: "\"Geist Mono\", ui-monospace" }}
                  >
                    {doc.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === "list" && filteredDocuments.length > 0 && (
          <div className="space-y-2 pb-4">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className={`bg-[rgb(20,20,20)] border rounded-[10px] p-4 hover:border-[rgb(80,80,80)] hover:bg-[rgb(22,22,22)] transition-all cursor-pointer group ${
                  selectedDocId === doc.id ? "border-white" : "border-[rgb(40,40,40)]"
                }`}
                onClick={() => handleDocumentClick(doc.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-[8px] bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] flex items-center justify-center flex-shrink-0">
                    <span className={getDocumentColor(doc.category)}>
                      {getDocumentIcon(doc.category)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    {doc.isRenaming ? (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center gap-1 flex-1">
                          <input
                            type="text"
                            defaultValue={doc.name.substring(0, doc.name.lastIndexOf(".")) || doc.name}
                            onBlur={(e) => {
                              const ext = doc.name.substring(doc.name.lastIndexOf("."));
                              handleRename(doc.id, e.target.value + ext);
                            }}
                            onKeyDown={(e) => {
                              const ext = doc.name.substring(doc.name.lastIndexOf("."));
                              if (e.key === "Enter") handleRename(doc.id, e.currentTarget.value + ext);
                              if (e.key === "Escape") cancelRename(doc.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            className="flex-1 bg-[rgb(30,30,30)] border border-[rgb(60,60,60)] rounded-lg px-2 py-1 text-[rgb(236,236,236)] text-[14px] focus:outline-none focus:border-white"
                            style={{ fontFamily: "\"2 TT_Firs_Neue_DemiBold Unspecified\", \"2 TT_Firs_Neue_DemiBold Unspecified Placeholder\", sans-serif" }}
                          />
                          <span className="text-[rgb(130,130,130)] text-[14px]" style={{ fontFamily: "\"2 TT_Firs_Neue_DemiBold Unspecified\", \"2 TT_Firs_Neue_DemiBold Unspecified Placeholder\", sans-serif" }}>
                            {doc.name.substring(doc.name.lastIndexOf("."))}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const container = e.currentTarget.previousElementSibling as HTMLDivElement;
                            const input = container.querySelector("input") as HTMLInputElement;
                            const ext = doc.name.substring(doc.name.lastIndexOf("."));
                            handleRename(doc.id, input.value + ext);
                          }}
                          className="w-6 h-6 rounded flex items-center justify-center text-[rgb(163,254,196)] hover:bg-[rgb(30,30,30)] transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelRename(doc.id);
                          }}
                          className="w-6 h-6 rounded flex items-center justify-center text-[rgb(255,108,122)] hover:bg-[rgb(30,30,30)] transition-colors"
                        >
                          <XIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 mb-1">
                        <h3 
                          className="text-[rgb(236,236,236)] text-[14px] truncate"
                          style={{ fontFamily: "\"2 TT_Firs_Neue_DemiBold Unspecified\", \"2 TT_Firs_Neue_DemiBold Unspecified Placeholder\", sans-serif" }}
                        >
                          {doc.name}
                        </h3>
                        <span 
                          className="text-[rgb(100,100,100)] text-[11px] flex-shrink-0"
                          style={{ fontFamily: "\"Geist Mono\", ui-monospace" }}
                        >
                          {doc.type}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <span 
                        className="text-[rgb(100,100,100)] text-[11px]"
                        style={{ fontFamily: "\"Geist Mono\", ui-monospace" }}
                      >
                        {doc.size}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-[rgb(60,60,60)]" />
                      <span 
                        className="text-[rgb(100,100,100)] text-[11px]"
                        style={{ fontFamily: "\"Geist Mono\", ui-monospace" }}
                      >
                        {doc.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handlePreview(doc, e)}
                      className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[rgb(160,160,160)] hover:bg-[rgb(30,30,30)] hover:text-[rgb(200,200,200)] transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => startRename(doc.id, e)}
                      className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[rgb(160,160,160)] hover:bg-[rgb(30,30,30)] hover:text-[rgb(200,200,200)] transition-colors"
                      title="Rename"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDownload(doc.id, doc.name, e)}
                      className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[rgb(160,160,160)] hover:bg-[rgb(30,30,30)] hover:text-[rgb(200,200,200)] transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(doc.id, e)}
                      className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[rgb(160,160,160)] hover:bg-[rgb(30,30,30)] hover:text-[rgb(255,108,122)] transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredDocuments.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-sm">
              <div className="w-20 h-20 rounded-[12px] bg-[rgb(20,20,20)] border border-dashed border-[rgb(50,50,50)] flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-[rgb(80,80,80)]" />
              </div>
              <h3 
                className="text-[rgb(200,200,200)] text-[16px] mb-2"
                style={{ fontFamily: "\"2 TT_Firs_Neue_DemiBold Unspecified\", \"2 TT_Firs_Neue_DemiBold Unspecified Placeholder\", sans-serif" }}
              >
                No documents found
              </h3>
              <p 
                className="text-[rgb(130,130,130)] text-[14px] leading-relaxed"
                style={{ fontFamily: "\"3 TT_Firs_Neue_Regular Unspecified\", \"3 TT_Firs_Neue_Regular Unspecified Placeholder\", sans-serif" }}
              >
                {searchQuery || filterType !== "all"
                  ? "Try adjusting your search or filters"
                  : "Upload your first document to get started"}
              </p>
            </div>
          </div>
        )}

        {selectedDocId && (
          <div className="mt-8 pt-8 border-t border-[rgb(40,40,40)]">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[rgb(180,180,180)]" />
              <h3 
                className="text-[rgb(220,220,220)] text-[15px]"
                style={{ fontFamily: "\"2 TT_Firs_Neue_DemiBold Unspecified\", \"2 TT_Firs_Neue_DemiBold Unspecified Placeholder\", sans-serif" }}
              >
                Similar Documents
              </h3>
            </div>

            {loadingRecs ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-[rgb(100,100,100)] animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-[rgb(100,100,100)] animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 rounded-full bg-[rgb(100,100,100)] animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-2">
                {recommendations.map((rec, index) => (
                  <div
                    key={rec.documentId}
                    className="bg-[rgb(15,15,15)] border border-[rgb(40,40,40)] rounded-lg p-3 hover:border-[rgb(60,60,60)] transition-colors cursor-pointer"
                    onClick={() => handleDocumentClick(rec.documentId)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-[rgb(25,25,25)] rounded text-[rgb(120,120,120)] text-xs font-mono shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[rgb(220,220,220)] text-sm truncate mb-1">
                          {rec.documentName}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[rgb(140,140,140)] text-xs uppercase">
                            {rec.documentType}
                          </span>
                          <span className="text-[rgb(100,100,100)]">•</span>
                          <span className="text-[rgb(100,200,100)] text-xs font-medium">
                            {Math.round(rec.score * 100)}% similar
                          </span>
                        </div>
                        {rec.matchingChunks && rec.matchingChunks.length > 0 && (
                          <div className="text-[rgb(140,140,140)] text-xs leading-relaxed line-clamp-2">
                            {rec.matchingChunks[0].text.substring(0, 120)}...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p 
                  className="text-[rgb(130,130,130)] text-[13px]"
                  style={{ fontFamily: "\"3 TT_Firs_Neue_Regular Unspecified\", \"3 TT_Firs_Neue_Regular Unspecified Placeholder\", sans-serif" }}
                >
                  No similar documents found. Upload more documents to see recommendations.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {previewFile && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setPreviewFile(null);
            setCodeContent("");
          }}
        >
          <div 
            className="bg-[rgb(15,15,15)] border border-[rgb(40,40,40)] rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[rgb(40,40,40)]">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] flex items-center justify-center shrink-0">
                  <span className={getDocumentColor(previewFile.category)}>
                    {getDocumentIcon(previewFile.category)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 
                    className="text-[rgb(236,236,236)] text-[16px] truncate"
                    style={{ fontFamily: "\"2 TT_Firs_Neue_DemiBold Unspecified\", \"2 TT_Firs_Neue_DemiBold Unspecified Placeholder\", sans-serif" }}
                  >
                    {previewFile.name}
                  </h3>
                  <p 
                    className="text-[rgb(130,130,130)] text-[12px]"
                    style={{ fontFamily: "\"Geist Mono\", ui-monospace" }}
                  >
                    {previewFile.size} • {previewFile.type}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onChatWithDocument) {
                      onChatWithDocument(previewFile.id, previewFile.name);
                      setPreviewFile(null);
                    }
                  }}
                  className="px-4 py-2 bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] text-[rgb(200,200,200)] rounded-lg hover:bg-[rgb(35,35,35)] transition-colors text-[13px] flex items-center gap-2"
                  style={{ fontFamily: "\"3 TT_Firs_Neue_Regular Unspecified\", \"3 TT_Firs_Neue_Regular Unspecified Placeholder\", sans-serif" }}
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </button>
                <button
                  onClick={() => handleDownload(previewFile.id, previewFile.name, { stopPropagation: () => {} } as any)}
                  className="px-4 py-2 bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] text-[rgb(200,200,200)] rounded-lg hover:bg-[rgb(35,35,35)] transition-colors text-[13px]"
                  style={{ fontFamily: "\"3 TT_Firs_Neue_Regular Unspecified\", \"3 TT_Firs_Neue_Regular Unspecified Placeholder\", sans-serif" }}
                >
                  Download
                </button>
                <button
                  onClick={() => {
                    setPreviewFile(null);
                    setCodeContent("");
                  }}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-[rgb(160,160,160)] hover:bg-[rgb(30,30,30)] hover:text-[rgb(200,200,200)] transition-colors"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {previewFile.category === "image" ? (
                <div className="flex items-center justify-center">
                  <img
                    src={storage.getFileView(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!, previewFile.id).toString()}
                    alt={previewFile.name}
                    className="max-w-full max-h-[70vh] rounded-lg object-contain"
                  />
                </div>
              ) : previewFile.category === "documents" && previewFile.type === "PDF" ? (
                <iframe
                  src={storage.getFileView(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!, previewFile.id).toString()}
                  className="w-full h-[70vh] rounded-lg border border-[rgb(40,40,40)]"
                  title={previewFile.name}
                />
              ) : previewFile.category === "code" ? (
                <div className="bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] rounded-lg overflow-hidden">
                  {loadingCode ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-[rgb(160,160,160)] text-[13px]" style={{ fontFamily: "\"Geist Mono\", ui-monospace" }}>
                        Loading code...
                      </div>
                    </div>
                  ) : (
                    <div className="flex">
                      <div className="bg-[rgb(15,15,15)] border-r border-[rgb(40,40,40)] px-4 py-4 text-right select-none">
                        <pre className="text-[rgb(100,100,100)] text-[13px] leading-[1.6]" style={{ fontFamily: "\"Geist Mono\", ui-monospace" }}>
                          {codeContent.split("\n").map((_, i) => (
                            <div key={i}>{i + 1}</div>
                          ))}
                        </pre>
                      </div>
                      <div className="flex-1 px-4 py-4 overflow-auto">
                        <pre className="text-[rgb(220,220,220)] text-[13px] leading-[1.6]" style={{ fontFamily: "\"Geist Mono\", ui-monospace" }}>
                          <code>{codeContent || "// Empty file"}</code>
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="w-16 h-16 text-[rgb(100,100,100)] mb-4" />
                  <p 
                    className="text-[rgb(160,160,160)] text-[14px] mb-2"
                    style={{ fontFamily: "\"3 TT_Firs_Neue_Regular Unspecified\", \"3 TT_Firs_Neue_Regular Unspecified Placeholder\", sans-serif" }}
                  >
                    Preview not available for this file type
                  </p>
                  <p 
                    className="text-[rgb(130,130,130)] text-[12px]"
                    style={{ fontFamily: "\"Geist Mono\", ui-monospace" }}
                  >
                    Click Download to view the file
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, fileId: null })}
        onConfirm={confirmDelete}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone and will remove the document from your library and all associated vector embeddings."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}