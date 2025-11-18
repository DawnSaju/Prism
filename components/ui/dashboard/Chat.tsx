"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, FileText, ExternalLink, X, History, MessageSquareText, Edit2, Trash2, Check, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ConfirmationModal from "./ConfirmationModal";

interface ChatSession {
  $id: string;
  title: string;
  messages: string;
  selectedDocument: string | null;
  $createdAt: string;
  $updatedAt: string;
}

interface AIChatProps {
  selectedDocument: string | null;
  onClearDocument?: () => void;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Array<{
    index: number;
    documentId: string;
    documentName: string;
    documentType: string;
    score: number;
  }>;
}

export default function AIChat({ selectedDocument, onClearDocument }: AIChatProps) {
  const { user } = useAuth();
  const [useRAG, setUseRAG] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; sessionId: string | null }>({ isOpen: false, sessionId: null });
  const [savingSession, setSavingSession] = useState(false);
  
  const getWelcomeMessage = () => {
    if (selectedDocument) {
      return "I'm ready to answer questions about your selected document. What would you like to know?";
    }
    return useRAG 
      ? "Hello! I can help you understand your documents using AI. I'll search through your knowledge base and provide answers with sources!"
      : "Hello! I'm in conversational mode. Ask me anything and I'll chat with you directly!";
  };

  const loadChatSessions = async () => {
    if (!user?.$id) return;
    
    try {
      const response = await fetch(`/api/chat/history?userId=${user.$id}`);
      if (response.ok) {
        const data = await response.json();
        setChatSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  };

  const saveCurrentChat = async () => {
    if (!user?.$id || messages.length <= 1 || savingSession) return;
    
    setSavingSession(true);
    try {
      let title = 'New Chat';
      if (!currentSessionId) {
        const titleResponse = await fetch('/api/chat/generate-title', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages }),
        });
        if (titleResponse.ok) {
          const data = await titleResponse.json();
          title = data.title;
        }
      }

      const method = currentSessionId ? "PUT" : "POST";
      const body: any = {
        userId: user.$id,
        messages,
        selectedDocument,
      };

      if (currentSessionId) {
        body.sessionId = currentSessionId;
      } else {
        body.title = title;
      }

      const response = await fetch("api/chat/history", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        if (!currentSessionId) {
          setCurrentSessionId(data.session.$id);
        }
        await loadChatSessions();
      }
    } catch (error) {
      console.error("Error saving chat:", error);
    } finally {
      setSavingSession(false);
    }
  };

  const loadSession = (session: ChatSession) => {
    try {
      const loadedMessages = JSON.parse(session.messages);
      setMessages(loadedMessages);
      setCurrentSessionId(session.$id);
      setShowHistory(false);
    } catch (error) {
      console.error("Error loading session:", error);
    }
  };

  const startNewChat = () => {
    setMessages([{
      id: "1",
      role: "assistant",
      content: getWelcomeMessage(),
      timestamp: new Date(),
    }]);
    setCurrentSessionId(null);
    setShowHistory(false);
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/history?sessionId=${sessionId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        if (currentSessionId === sessionId) {
          startNewChat();
        }
        await loadChatSessions();
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const renameSession = async (sessionId: string, newTitle: string) => {
    try {
      const response = await fetch("/api/chat/history", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, title: newTitle }),
      });
      if (response.ok) {
        await loadChatSessions();
        setEditingSessionId(null);
      }
    } catch (error) {
      console.error("Error renaming session:", error);
    }
  };
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: getWelcomeMessage(),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    loadChatSessions();
  }, [user?.$id]);

  useEffect(() => {
    if (messages.length > 1 && !isTyping && messages[messages.length - 1].role === "assistant") {
      const timer = setTimeout(() => {
        saveCurrentChat();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          userId: user?.$id,
          useRAG: useRAG,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponseContent = '';

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: '',
        timestamp: new Date(),
        sources: [],
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              
              if (data === "[DONE]") {
                break;
              }

              try {
                const parsed = JSON.parse(data);
                
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
                
                if (parsed.sources) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === aiMessage.id
                        ? { ...msg, sources: parsed.sources }
                        : msg
                    )
                  );
                }
                
                if (parsed.chunk) {
                  aiResponseContent += parsed.chunk;
                  
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === aiMessage.id
                        ? { ...msg, content: aiResponseContent }
                        : msg
                    )
                  );
                }
              } catch (e) {
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${error.message}. Please make sure your Gemini API key is configured correctly.`,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "Summarize my recent documents",
    "Find information about project requirements",
    "What are the key points in my meeting notes?",
    "Search for technical specifications",
  ];

  return (
    <div className="h-full flex gap-4 overflow-hidden">
      <div className={`${showHistory ? 'w-80' : 'w-12'} shrink-0 transition-all duration-300 flex flex-col gap-3`}>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-12 h-12 rounded-xl bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] hover:bg-[rgb(25,25,25)] transition-colors flex items-center justify-center"
          title={showHistory ? "Hide history" : "Show history"}
        >
          <History className="w-5 h-5 text-[rgb(160,160,160)]" />
        </button>

        {showHistory && (
          <div className="flex-1 bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] rounded-xl p-4 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 
                className="text-white text-[14px]"
                style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
              >
                Chat History
              </h3>
              <button
                onClick={startNewChat}
                className="p-1.5 rounded-lg hover:bg-[rgb(30,30,30)] transition-colors"
                title="New chat"
              >
                <Plus className="w-4 h-4 text-[rgb(160,160,160)]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {chatSessions.map((session) => (
                <div
                  key={session.$id}
                  className={`group relative p-3 rounded-lg border transition-all cursor-pointer ${
                    currentSessionId === session.$id
                      ? 'bg-[rgb(30,30,30)] border-[rgb(60,60,60)]'
                      : 'bg-[rgb(25,25,25)] border-[rgb(40,40,40)] hover:bg-[rgb(28,28,28)]'
                  }`}
                  onClick={() => loadSession(session)}
                >
                  {editingSessionId === session.$id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="flex-1 bg-[rgb(20,20,20)] border border-[rgb(50,50,50)] rounded px-2 py-1 text-white text-[12px] focus:outline-none focus:border-[rgb(70,70,70)]"
                        style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            renameSession(session.$id, editingTitle);
                          } else if (e.key === "Escape") {
                            setEditingSessionId(null);
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          renameSession(session.$id, editingTitle);
                        }}
                        className="p-1 rounded hover:bg-[rgb(35,35,35)]"
                      >
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-2 mb-2">
                        <MessageSquareText className="w-4 h-4 text-[rgb(160,160,160)] shrink-0 mt-0.5" />
                        <p 
                          className="text-white text-[13px] line-clamp-2 flex-1"
                          style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                        >
                          {session.title}
                        </p>
                      </div>
                      <p 
                        className="text-[rgb(100,100,100)] text-[11px]"
                        style={{ fontFamily: "'Geist Mono', ui-monospace" }}
                      >
                        {new Date(session.$updatedAt).toLocaleDateString()}
                      </p>

                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSessionId(session.$id);
                            setEditingTitle(session.title);
                          }}
                          className="p-1.5 rounded-lg bg-[rgb(20,20,20)] hover:bg-[rgb(35,35,35)] transition-colors"
                          title="Rename"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[rgb(160,160,160)]" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm({ isOpen: true, sessionId: session.$id });
                          }}
                          className="p-1.5 rounded-lg bg-[rgb(20,20,20)] hover:bg-[rgb(35,35,35)] transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[rgb(255,100,100)]" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="shrink-0 bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] rounded-xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[rgb(230,230,230)]" />
          </div>
          <div>
            <p 
              className="text-[rgb(236,236,236)] text-[14px]"
              style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
            >
              AI Assistant Active
            </p>
            <p 
              className="text-[rgb(130,130,130)] text-[12px] mt-0.5"
              style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
            >
              {useRAG 
                ? (selectedDocument ? 'Analyzing selected document' : 'Searching across all documents')
                : "Conversational mode - No document context"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {selectedDocument && (
            <button
              onClick={() => onClearDocument?.()}
              className="flex items-center gap-2 px-3 py-1.5 bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] rounded-[8px] hover:bg-[rgb(35,35,35)] hover:border-[rgb(60,60,60)] transition-colors group"
              title="Clear selected document"
            >
              <FileText className="w-3.5 h-3.5 text-[rgb(200,200,200)]" />
              <span 
                className="text-[rgb(200,200,200)] text-[12px]"
                style={{ fontFamily: "'Geist Mono', ui-monospace" }}
              >
                1 DOC SELECTED
              </span>
              <X className="w-3.5 h-3.5 text-[rgb(160,160,160)] group-hover:text-[rgb(200,200,200)] transition-colors" />
            </button>
          )}
          
          <button
            onClick={() => setUseRAG(!useRAG)}
            className={`flex items-center gap-2 px-3 py-1.5 border rounded-[8px] transition-all ${
              useRAG
                ? 'bg-white text-[rgb(15,15,15)] border-white'
                : 'bg-[rgb(30,30,30)] text-[rgb(160,160,160)] border-[rgb(50,50,50)] hover:border-[rgb(70,70,70)]'
            }`}
            title={useRAG ? 'Using document context' : 'Conversational mode'}
          >
            <FileText className="w-3.5 h-3.5" />
            <span 
              className="text-[12px] font-medium"
              style={{ fontFamily: "'Geist Mono', ui-monospace" }}
            >
              {useRAG ? 'DOCS' : 'CHAT'}
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 mb-6 min-h-0 relative">
        <div className="absolute inset-0 overflow-y-scroll scrollbar-hide px-6">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'assistant'
                  ? 'bg-[rgb(30,30,30)] border border-[rgb(50,50,50)]'
                  : 'bg-[rgb(30,30,30)] border border-[rgb(50,50,50)]'
              }`}
            >
              {message.role === "assistant" ? (
                <Sparkles className="w-5 h-5 text-white" />
              ) : (
                <span 
                  className="text-white text-[14px]"
                  style={{ fontFamily: '"2 TT_Firs_Neue_DemiBold Unspecified", "2 TT_Firs_Neue_DemiBold Unspecified Placeholder", sans-serif' }}
                >
                  You
                </span>
              )}
            </div>

            <div
              className={`flex-1 rounded-2xl p-4 ${
                message.role === "assistant"
                  ? 'bg-[rgb(20,20,20)] border border-[rgb(40,40,40)]'
                  : 'bg-[rgb(30,30,30)] border border-[rgb(50,50,50)]'
              }`}
            >
              {message.role === "assistant" ? (
                <div 
                  className="text-[rgb(236,236,236)] text-[14px] leading-[1.6] prose prose-invert prose-sm max-w-none"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                >
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code: ({node, inline, className, children, ...props}: any) => (
                        inline ? (
                          <code className="px-1.5 py-0.5 bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] rounded text-[rgb(220,220,220)] text-[13px]" style={{ fontFamily: "'Geist Mono', ui-monospace" }} {...props}>
                            {children}
                          </code>
                        ) : (
                          <pre className="bg-[rgb(15,15,15)] border border-[rgb(40,40,40)] rounded-lg p-4 overflow-x-auto my-3">
                            <code className="text-[rgb(220,220,220)] text-[13px]" style={{ fontFamily: "'Geist Mono', ui-monospace" }} {...props}>
                              {children}
                            </code>
                          </pre>
                        )
                      ),
                      strong: ({children, ...props}: any) => (
                        <strong className="text-white font-semibold" {...props}>{children}</strong>
                      ),
                      a: ({children, href, ...props}: any) => (
                        <a href={href} className="text-[rgb(147,197,253)] hover:underline" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
                      ),
                      ul: ({children, ...props}: any) => (
                        <ul className="list-disc list-inside my-2 space-y-1" {...props}>{children}</ul>
                      ),
                      ol: ({children, ...props}: any) => (
                        <ol className="list-decimal list-inside my-2 space-y-1" {...props}>{children}</ol>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p 
                  className="text-[rgb(236,236,236)] text-[14px] leading-[1.6] whitespace-pre-wrap"
                  style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
                >
                  {message.content}
                </p>
              )}
              
              {message.role === "assistant" && message.sources && message.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[rgb(50,50,50)]">
                  <div className="text-[rgb(160,160,160)] text-xs font-medium mb-2 uppercase tracking-wider">
                    Sources ({message.sources.length})
                  </div>
                  <div className="space-y-2">
                    {message.sources.map((source) => (
                      <div
                        key={source.index}
                        className="flex items-center gap-3 px-3 py-2 bg-[rgb(15,15,15)] border border-[rgb(45,45,45)] rounded-lg hover:border-[rgb(60,60,60)] transition-colors"
                      >
                        <div className="flex items-center justify-center w-6 h-6 bg-[rgb(35,35,35)] rounded text-[rgb(120,120,120)] text-xs font-mono">
                          {source.index}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[rgb(220,220,220)] text-sm truncate">
                            {source.documentName}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[rgb(140,140,140)] text-xs uppercase">
                              {source.documentType}
                            </span>
                            <span className="text-[rgb(100,100,100)]">•</span>
                            <span className="text-[rgb(100,200,100)] text-xs font-medium">
                              {Math.round(source.score * 100)}% relevant
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <span 
                className="text-[rgb(100,100,100)] text-[11px] mt-2 block"
                style={{ fontFamily: "'Geist Mono', ui-monospace" }}
              >
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[rgb(30,30,30)] border border-[rgb(50,50,50)] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-[rgb(230,230,230)]" />
            </div>
            <div className="flex-1 rounded-2xl p-4 bg-[rgb(20,20,20)] border border-[rgb(40,40,40)]">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[rgb(100,100,100)] animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-[rgb(100,100,100)] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-[rgb(100,100,100)] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

          <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {messages.length === 1 && (
        <div className="shrink-0 mb-6">
          <p 
            className="text-[rgb(130,130,130)] text-[12px] mb-3"
            style={{ fontFamily: "'Geist Mono', ui-monospace" }}
          >
            SUGGESTED QUESTIONS
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInput(question)}
                className="text-left px-4 py-3 bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] rounded-xl text-[rgb(200,200,200)] hover:bg-[rgb(25,25,25)] hover:border-[rgb(50,50,50)] transition-colors text-[13px]"
                style={{ fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif' }}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="shrink-0 bg-[rgb(20,20,20)] border border-[rgb(40,40,40)] rounded-2xl p-4">
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your documents..."
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-[rgb(100,100,100)] focus:outline-none resize-none max-h-32"
            style={{ 
              fontFamily: '"3 TT_Firs_Neue_Regular Unspecified", "3 TT_Firs_Neue_Regular Unspecified Placeholder", sans-serif',
              fontSize: '14px'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-[10px] bg-white hover:bg-gray-100 disabled:bg-[rgb(40,40,40)] disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Send className={`w-5 h-5 ${input.trim() ? 'text-[rgb(15,15,15)]' : 'text-[rgb(100,100,100)]'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgb(40,40,40)]">
          <p 
            className="text-[rgb(100,100,100)] text-[11px]"
            style={{ fontFamily: "'Geist Mono', ui-monospace" }}
          >
            Powered by Gemini AI • Press Enter to send
          </p>
          {selectedDocument && (
            <div className="flex items-center gap-2">
              <FileText className="w-3 h-3 text-[rgb(200,200,200)]" />
              <span 
                className="text-[rgb(130,130,130)] text-[11px]"
                style={{ fontFamily: "'Geist Mono', ui-monospace" }}
              >
                Document Context Active
              </span>
            </div>
          )}
        </div>
      </div>
      </div>

      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, sessionId: null })}
        onConfirm={() => {
          if (deleteConfirm.sessionId) {
            deleteSession(deleteConfirm.sessionId);
          }
        }}
        title="Delete Chat"
        message="Are you sure you want to delete this chat? This action cannot be undone and will permanently remove all messages in this conversation."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
