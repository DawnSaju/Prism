"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { getCurrentUser } from "@/lib/appwrite";
import ConfirmationModal from "./ConfirmationModal";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

interface GraphNode {
  id: string;
  x: number;
  y: number;
  documentId: string;
  fileName: string;
  documentType: string;
  category: string;
  chunkIndex: number;
  chunkText?: string;
  uploadDate?: string;
}

interface GraphLink {
  source: string;
  target: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  totalDocuments: number;
  totalChunks: number;
  unusedVectors?: number;
  cleanedUp?: boolean;
  documentGroups?: Array<{
    documentId: string;
    fileName: string;
    chunkCount: number;
  }>;
}

export default function Insights() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [cleaning, setCleaning] = useState(false);
  const [cleanupConfirm, setCleanupConfirm] = useState(false);
  const graphRef = useRef<any>(null);

  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async (cleanup = false) => {
    try {
      if (cleanup) setCleaning(true);
      else setLoading(true);

      const user = await getCurrentUser();
      if (!user) {
        setError("User not authenticated");
        return;
      }

      const response = await fetch(
        `/api/analytics/vector-graph?userId=${user.$id}&cleanup=${cleanup}`
      );
      if (!response.ok) throw new Error("Failed to fetch graph data");

      const data = await response.json();
      setGraphData(data);
      setError("");
    } catch (err) {
      console.error("Error fetching graph:", err);
      setError("Failed to load vector graph");
    } finally {
      setLoading(false);
      setCleaning(false);
    }
  };

  const handleCleanup = () => setCleanupConfirm(true);

  const confirmCleanup = async () => await fetchGraphData(true);

  const getDocumentColor = (fileName: string) => {
    const colors = [
      "#06b6d4",
      "#8b5cf6",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#ec4899",
      "#3b82f6",
      "#14b8a6",
      "#f97316",
      "#a855f7",
    ];
    let hash = 0;
    for (let i = 0; i < fileName.length; i++) {
      hash = fileName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getNodeColor = (node: GraphNode) => getDocumentColor(node.fileName);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      work: "#ef4444",
      personal: "#06b6d4",
      research: "#8b5cf6",
      other: "#6b7280",
      uncategorized: "#6b7280",
    };
    return colors[category] || "#6b7280";
  };

  const handleNodeClick = (node: any) => setSelectedNode(node as GraphNode);

  if (loading)
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Generating vector space visualization...</p>
        </div>
      </div>
    );

  if (error) {
    const isConfigError = error.includes("configuration missing") || error.includes("QDRANT");
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-red-400 mb-2 font-medium">{error}</p>
          {isConfigError && (
            <div className="mt-4 p-4 bg-black/40 rounded-lg border border-white/10 text-left">
              <p className="text-xs text-white/60 mb-2">
                Add to your <code className="text-cyan-400">.env.local</code>:
              </p>
              <pre className="text-xs text-white/80 font-mono bg-black/60 p-2 rounded">
                Please update your Qdrant environment config
              </pre>
            </div>
          )}
          <button
            onClick={() => fetchGraphData()}
            className="mt-4 px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!graphData || graphData.nodes.length === 0)
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-2">No documents to visualize</p>
          <p className="text-white/40 text-sm">Upload some documents to see their vector relationships</p>
        </div>
      </div>
    );

  return (
    <div className="h-full flex flex-col bg-[rgb(15,15,15)]">
      <div className="p-4 md:p-6 border-b border-white/8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-white mb-1">Vector Insights</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs md:text-sm text-white/60">
                {graphData.totalDocuments} docs • {graphData.totalChunks} chunks
              </p>
              {graphData.unusedVectors !== undefined && graphData.unusedVectors > 0 && !graphData.cleanedUp && (
                <span className="text-[10px] md:text-xs px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {graphData.unusedVectors} unused
                </span>
              )}
              {graphData.cleanedUp && (
                <span className="text-[10px] md:text-xs px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                  ✓ Cleaned up
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {graphData.unusedVectors !== undefined && graphData.unusedVectors > 0 && !graphData.cleanedUp && (
              <button
                onClick={handleCleanup}
                disabled={cleaning}
                className="px-3 md:px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg text-xs md:text-sm text-amber-400 transition disabled:opacity-50"
                title="Remove unused vectors"
              >
                {cleaning ? "Cleaning..." : "Clean Up"}
              </button>
            )}
            <button
              onClick={() => fetchGraphData(false)}
              disabled={loading}
              className="px-3 md:px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs md:text-sm text-white/80 transition disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>
        <div className="hidden md:block p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-sm text-white/80 leading-relaxed mb-2">
            This visualization maps your documents in semantic vector space. Each node represents a document chunk, and their positions show how similar their content is—closer nodes have related meanings.
          </p>
          <div className="flex items-start gap-2 text-xs text-white/60">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Documents are projected from 768-dimensional vectors to 2D using UMAP dimensionality reduction. Connected nodes belong to the same document. Click any node to see details.
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          nodeLabel={(node: any) => `${node.fileName} (Chunk ${node.chunkIndex + 1})`}
          nodeColor={(node: any) => getNodeColor(node as GraphNode)}
          nodeRelSize={6}
          nodeVal={(node: any) => 8}
          linkColor={() => "rgba(255, 255, 255, 0.1)"}
          linkWidth={1}
          linkDirectionalArrowLength={3}
          linkDirectionalArrowRelPos={1}
          backgroundColor="rgb(15, 15, 15)"
          onNodeClick={handleNodeClick}
          cooldownTicks={100}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = node.fileName;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Inter, sans-serif`;
            const nodeColor = getNodeColor(node as GraphNode);
            ctx.beginPath();
            ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);
            ctx.fillStyle = nodeColor;
            ctx.fill();
            if (selectedNode && selectedNode.id === node.id) {
              ctx.beginPath();
              ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI, false);
              ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
              ctx.lineWidth = 2 / globalScale;
              ctx.stroke();
            }
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
          }}
        />

        {!selectedNode && graphData.documentGroups && graphData.documentGroups.length > 0 && (
          <>
            <div className="hidden md:block absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg border border-white/10 shadow-2xl max-w-xs">
              <div className="p-3 border-b border-white/10">
                <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wide">Documents</h3>
              </div>
              <div className="p-2 max-h-96 overflow-y-auto">
                <div className="space-y-1">
                  {graphData.documentGroups.map((doc) => (
                    <div
                      key={doc.documentId}
                      className="flex items-center gap-2 p-2 rounded hover:bg-white/5 transition group cursor-pointer"
                      onClick={() => {
                        const node = graphData.nodes.find((n) => n.documentId === doc.documentId);
                        if (node) setSelectedNode(node);
                      }}
                    >
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: getDocumentColor(doc.fileName) }}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/80 truncate group-hover:text-white">{doc.fileName}</p>
                        <p className="text-[10px] text-white/40">{doc.chunkCount} chunks</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="md:hidden absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-white/10 shadow-2xl">
              <div className="p-3 border-b border-white/10">
                <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wide">Documents</h3>
              </div>
              <div className="p-2 max-h-32 overflow-x-auto">
                <div className="flex gap-2">
                  {graphData.documentGroups.map((doc) => (
                    <button
                      key={doc.documentId}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition shrink-0"
                      onClick={() => {
                        const node = graphData.nodes.find((n) => n.documentId === doc.documentId);
                        if (node) setSelectedNode(node);
                      }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getDocumentColor(doc.fileName) }}></div>
                      <div className="text-left">
                        <p className="text-xs text-white/80 whitespace-nowrap">{doc.fileName}</p>
                        <p className="text-[10px] text-white/40">{doc.chunkCount} chunks</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {selectedNode && (
          <div className="absolute inset-x-4 top-4 md:inset-x-auto md:top-4 md:right-4 md:w-80 max-h-[calc(100vh-8rem)] md:max-h-none overflow-y-auto bg-black/95 md:bg-black/90 backdrop-blur-sm rounded-lg border border-white/10 shadow-2xl">
            <div className="flex items-start justify-between p-3 md:p-4 border-b border-white/10">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full shrink-0" style={{ backgroundColor: getNodeColor(selectedNode) }} />
                  <h3 className="text-xs md:text-sm font-semibold text-white truncate">{selectedNode.fileName}</h3>
                </div>
                <div className="flex items-center gap-1 md:gap-1.5 flex-wrap">
                  <span className="text-[9px] md:text-[10px] px-1.5 md:px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                    {selectedNode.documentType.toUpperCase()}
                  </span>
                  <span className="text-[9px] md:text-[10px] px-1.5 md:px-2 py-0.5 rounded-full bg-white/10 text-white/60 capitalize">
                    {selectedNode.category}
                  </span>
                  <span className="text-[9px] md:text-[10px] px-1.5 md:px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                    Chunk {selectedNode.chunkIndex + 1}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-white/40 hover:text-white/80 transition ml-2 p-1" title="Close">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {selectedNode.chunkText && (
              <div className="p-3 md:p-4 border-b border-white/10">
                <div className="flex items-center gap-1.5 mb-2">
                  <svg className="w-3 md:w-3.5 h-3 md:h-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-[9px] md:text-[10px] font-medium text-white/60 uppercase tracking-wide">Content Preview</p>
                </div>
                <div className="p-2 md:p-3 bg-white/5 rounded border border-white/10 max-h-24 md:max-h-32 overflow-y-auto">
                  <p className="text-[11px] md:text-xs text-white/80 leading-relaxed">{selectedNode.chunkText}</p>
                </div>
              </div>
            )}
            <div className="p-3 md:p-4">
              <div className="flex items-center gap-1.5 mb-2 md:mb-3">
                <svg className="w-3 md:w-3.5 h-3 md:h-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[9px] md:text-[10px] font-medium text-white/60 uppercase tracking-wide">Metadata</p>
              </div>
              <div className="space-y-1.5 md:space-y-2 text-[11px] md:text-xs">
                {selectedNode.uploadDate && (
                  <div className="flex items-start justify-between py-1.5">
                    <span className="text-white/40">Uploaded</span>
                    <span className="text-white/70 font-medium">
                      {new Date(selectedNode.uploadDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                )}
                <div className="flex items-start justify-between py-1 md:py-1.5">
                  <span className="text-white/40">Position</span>
                  <span className="text-white/70 font-mono text-[9px] md:text-[10px]">
                    ({selectedNode.x.toFixed(1)}, {selectedNode.y.toFixed(1)})
                  </span>
                </div>
                <div className="pt-1.5 md:pt-2 mt-1.5 md:mt-2 border-t border-white/10">
                  <div className="mb-1 md:mb-1.5">
                    <span className="text-white/40">Vector ID</span>
                  </div>
                  <code className="text-[9px] md:text-[10px] text-white/70 font-mono bg-white/5 px-2 py-1 rounded block break-all">
                    {selectedNode.id}
                  </code>
                </div>
                <div className="pt-1.5 md:pt-2">
                  <div className="mb-1 md:mb-1.5">
                    <span className="text-white/40">Document ID</span>
                  </div>
                  <code className="text-[9px] md:text-[10px] text-white/70 font-mono bg-white/5 px-2 py-1 rounded block break-all">
                    {selectedNode.documentId}
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="hidden md:block p-4 border-t border-white/8 bg-black/40">
        <p className="text-xs text-white/40 text-center">
          Each node represents a document chunk in 768-dimensional vector space, projected to 2D using UMAP. Connected nodes belong to the same document.
        </p>
      </div>

      <ConfirmationModal
        isOpen={cleanupConfirm}
        onClose={() => setCleanupConfirm(false)}
        onConfirm={confirmCleanup}
        title="Clean Up Vectors"
        message="This will remove all vectors that no longer have corresponding documents in storage. This action cannot be undone. Are you sure you want to proceed?"
        confirmText="Clean Up"
        cancelText="Cancel"
        variant="warning"
      />
    </div>
  );
}
