"use client";

import { useState, useRef } from "react";

function escapeRegex(text: string) {
  return text.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

function highlightText(text: string, highlight: string) {
  if (!highlight) return text;

  const safeHighlightRaw = highlight.slice(0, 100);

  const safeHighlight = escapeRegex(safeHighlightRaw);

  try {
    const parts = text.split(new RegExp(`(${safeHighlight})`, "gi"));
    const lowerHighlight = safeHighlightRaw.toLowerCase();

    return parts.map((part) =>
      part.toLowerCase() === lowerHighlight ? (
        <mark key={part} className="bg-yellow-400 text-black px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  } catch (e) {
    console.warn("Highlight error:", e);
    return text;
  }
}

export default function Home() {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [files, setFiles] = useState<File[]>([]);
  const [query, setQuery] = useState("");
type Message = {
    role: "user" | "bot";
    content: string;
    sources?: { page: number; content: string; highlight?: string }[];
    file?: string | null;
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [pdfUrls, setPdfUrls] = useState<string[]>([]);
  const [activePdf, setActivePdf] = useState(0);

  const [isUploading, setIsUploading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [sessionId] = useState(() => crypto.randomUUID());

  // 🔥 GO TO PAGE
  const goToPage = (page: number) => {
    const url = pdfUrls[activePdf];
    if (!url) return;
    window.open(url + `#page=${page}`, "_blank");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const fileArray = Array.from(selectedFiles);

    const pdfFiles = fileArray.filter(
      (file) => file.type === "application/pdf"
    );

    setFiles(pdfFiles);

    const urls = pdfFiles.map((file) => URL.createObjectURL(file));
    setPdfUrls(urls);

    setActivePdf(0);

    e.target.value = "";
  };

  // 🔥 IMPROVED UPLOAD (WITH ERROR LOG)
  const uploadPDF = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("session_id", sessionId);

    try {
      const res = await fetch(`${API}/api/upload/`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        console.log("Upload success ✅");
      } else {
        const text = await res.text();
        console.error("Upload failed:", text);
      }
    } catch (err) {
      console.error("Upload failed ❌", err);
    }

    setIsUploading(false);
  };

  const sendMessage = async () => {
    if (!query.trim()) return;

    const newMessages = [...messages, { role: "user" as const, content: query }];
    setMessages(newMessages);
    setQuery("");
    setIsThinking(true);

    try {
      const res = await fetch(`${API}/api/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          session_id: sessionId,
          history: messages.slice(-6),
        }),
      });

      const data = await res.json();

      const botMessage: Message = {
        role: "bot",
        content: "",
        sources: data.sources || [],
        file: data.file_used || null,
      };

      setMessages([...newMessages, botMessage]);

      const fullText = data.answer || "No response";
      let currentText = "";

      for (const char of fullText) {
        currentText += char;

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...botMessage,
            content: currentText,
          };
          return updated;
        });

        await new Promise((res) => setTimeout(res, 8));
      }
    } catch (err) {
      console.error("Chat error:", err);

      setMessages([
        ...newMessages,
        { role: "bot" as const, content: "Error ❌", sources: [] },
      ]);
    }

    setIsThinking(false);
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-white">

      {/* LEFT: PDF VIEWER */}
      <div className="w-1/2 border-r border-gray-700 p-4 flex flex-col">

        <h2 className="mb-3 font-semibold">📄 PDF Preview</h2>

        <div className="flex gap-2 mb-3 overflow-x-auto">
          {files.map((file, i) => (
            <button
              key={file.name}
              onClick={() => setActivePdf(i)}
              className={`px-3 py-1 rounded text-sm ${
                activePdf === i ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              {file.name}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-black rounded overflow-hidden">
          {pdfUrls.length > 0 ? (
            <iframe src={pdfUrls[activePdf]} className="w-full h-full" title="PDF Viewer" />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Upload PDFs
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: CHAT */}
      <div className="w-1/2 p-6 flex flex-col">

        <h1 className="text-2xl font-bold mb-4">Chat with PDFs</h1>

        <div className="mb-4 flex gap-2">

          <input
            type="file"
            multiple
            accept="application/pdf"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
          >
            Choose Files
          </button>

          <button
            onClick={uploadPDF}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {/* CHAT */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((msg, i) => (
            <div key={`${msg.role}-${i}`} className={msg.role === "user" ? "text-right" : ""}>
              <div className="inline-block bg-[#1e293b] p-3 rounded-xl max-w-lg shadow">

                {msg.file && (
                  <div className="text-xs text-green-400 mb-1">
                    📄 {msg.file}
                  </div>
                )}

                <div className="whitespace-pre-wrap text-[15px]">
                  {msg.content}
                </div>

                {/* SOURCES */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.sources?.map((s, idx) => (
                      <button
                        type="button"
                        key={`source-${s.page}-${idx}`}
                        className="bg-gray-800 p-2 rounded cursor-pointer hover:bg-gray-700 text-left w-full"
                        onClick={() => s.page && goToPage(s.page)}
                        onKeyDown={(e) => {
                          if ((e.key === "Enter" || e.key === " ") && s.page) {
                            goToPage(s.page);
                          }
                        }}
                      >
                        <div className="text-xs text-blue-400 mb-1">
                          📍 Page {s.page}
                        </div>

                        <div className="text-sm text-gray-300">
                          {highlightText(s.content || "", s.highlight || "")}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

              </div>
            </div>
          ))}

          {isThinking && (
            <div className="text-gray-400 text-sm">typing...</div>
          )}
        </div>

        {/* INPUT */}
        <div className="p-3 border-t border-gray-700">
          <div className="flex gap-2 bg-[#1e293b] rounded-2xl px-4 py-2">

            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about your PDFs..."
              className="flex-1 bg-transparent outline-none resize-none text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <button
              onClick={sendMessage}
              className="bg-blue-600 px-3 py-2 rounded-xl"
            >
              ➤
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}