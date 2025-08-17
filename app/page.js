"use client";
import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChat = async () => {
    setLoading(true);
    setResponse(""); // reset output

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      // Run typewriter effect
      typeWriterEffect(data.response);
    } catch (error) {
      setResponse("Error: " + (error.message));
    }

    setLoading(false);
  };

  // --- Typewriter effect helper ---
  const typeWriterEffect = (text) => {
    let i = 0;
    setResponse(""); // clear old
    const interval = setInterval(() => {
      setResponse((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
      }
    }, 40); // 40ms per character (adjust speed here)
  };

  return (
    <div className="font-sans grid items-center justify-items-center min-h-screen">
      <h1 className="text-2xl font-bold my-4">AI Chat App</h1>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        placeholder="Enter your message"
        className="m-5 border p-3 w-80"
      />

      <button
        onClick={handleChat}
        disabled={loading}
        className="border p-3 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Loading..." : "Chat"}
      </button>

      <div className="border p-5 m-3 text-lg w-80 whitespace-pre-wrap">
        {response || "No response yet."}
      </div>
    </div>
  );
}
