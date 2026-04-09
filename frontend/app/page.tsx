"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">

      <div className="flex justify-between items-center px-8 py-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">📄 PDF AI</h1>

        <button
          onClick={() => router.push("/chat")}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Open App
        </button>
      </div>


      <div className="flex flex-col items-center justify-center flex-1 text-center px-6">

        <h1 className="text-5xl font-bold mb-6 leading-tight">
          Chat With Your PDFs <br />
          <span className="text-blue-500">Smarter & Faster</span>
        </h1>

        <p className="text-gray-400 max-w-xl mb-8">
          Upload multiple PDFs, ask questions, and get instant answers powered
          by AI. No more manual reading — just chat and understand.
        </p>

        <button
          onClick={() => router.push("/chat")}
          className="bg-blue-600 px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition"
        >
          Get Started
        </button>

      </div>

      <div className="grid md:grid-cols-3 gap-6 px-10 pb-20">

        <div className="bg-[#1e293b] p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-2">📄 Multi PDF Support</h3>
          <p className="text-gray-400 text-sm">
            Upload multiple PDFs and get answers from all of them together.
          </p>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-2">⚡ Fast AI Answers</h3>
          <p className="text-gray-400 text-sm">
            Get instant responses using advanced AI models.
          </p>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-2">🎯 Source Highlighting</h3>
          <p className="text-gray-400 text-sm">
            Click sources to jump directly into your PDF content.
          </p>
        </div>

      </div>

    </div>
  );
}