"use client";

import { useState, useRef } from "react";

export default function Home() {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [files, setFiles] = useState<File[]>([]);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [pdfUrls, setPdfUrls] = useState<string[]>([]);
  const [activePdf, setActivePdf] = useState(0);

  const [isUploading, setIsUploading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [sessionId] = useState(() => crypto.randomUUID());

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

  const uploadPDF = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("session_id", sessionId);

    try {
      await fetch(`${API}/api/upload/`, {
        method: "POST",
        body: formData,
      });
    } catch {
      console.error("Upload failed ❌");
    }

    setIsUploading(false);
  };

  const sendMessage = async () => {
    if (!query.trim()) return;

    const newMessages = [...messages, { role: "user", content: query }];
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

      let botMessage = {
        role: "bot",
        content: "",
        sources: data.sources || [],
        file: data.file_used || null,
      };

      setMessages([...newMessages, botMessage]);

      let fullText = data.answer || "No response";
      let currentText = "";

      for (let char of fullText) {
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

    } catch {
      setMessages([
        ...newMessages,
        { role: "bot", content: "Error ❌", sources: [] },
      ]);
    }

    setIsThinking(false);
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-white">

      <div className="w-1/2 border-r border-gray-700 p-4 flex flex-col">

        <h2 className="mb-3 font-semibold">📄 PDF Preview</h2>

        <div className="flex gap-2 mb-3 overflow-x-auto">
          {files.map((file, i) => (
            <button
              key={i}
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
            <iframe src={pdfUrls[activePdf]} className="w-full h-full" />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Upload PDFs
            </div>
          )}
        </div>
      </div>

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
            className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600 transition"
          >
            Choose Files
          </button>

          <button
            onClick={uploadPDF}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>

  
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((msg, i) => (
            <div key={i} className={msg.role === "user" ? "text-right" : ""}>
              <div className="inline-block bg-[#1e293b] p-3 rounded-xl max-w-lg shadow">

                {msg.file && (
                  <div className="text-xs text-green-400 mb-1">
                    📄 {msg.file}
                  </div>
                )}

                <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                  {msg.content}
                </div>

              </div>
            </div>
          ))}

          {isThinking && (
            <div className="text-gray-400 text-sm">typing...</div>
          )}
        </div>

        <div className="p-3 border-t border-gray-700">
          <div className="flex items-end gap-2 bg-[#1e293b] rounded-2xl px-4 py-2 shadow border border-gray-600 focus-within:border-blue-500 transition">

            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about your PDFs..."
              rows={1}
              className="flex-1 bg-transparent outline-none resize-none text-sm placeholder-gray-400"

              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}

              onInput={(e: any) => {
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
            />

            <button
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-700 transition px-3 py-2 rounded-xl flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="white"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}