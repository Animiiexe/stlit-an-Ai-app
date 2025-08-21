"use client";
import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  const typeWriterEffect = (text) => {
    let i = 0;
    let current = "";
    const interval = setInterval(() => {
      current = text.substring(0, i + 1);
      setChat((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].text = current;
        return updated;
      });
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 20);
  };

  const handleChat = async () => {
    if (!message.trim()) return;
    setLoading(true);

    setChat((prev) => [...prev, { role: "user", text: message }]);
    setMessage("");

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) throw new Error("Server error: " + res.statusText);

      const data = await res.json();
      setChat((prev) => [...prev, { role: "ai", text: "" }]);
      typeWriterEffect(data.response);
    } catch (error) {
      setChat((prev) => [...prev, { role: "ai", text: "❌ Error: " + error.message }]);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChat();
    }
  };

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [message]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  return (
    <div className="font-sans min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4 sm:p-6">
      <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-2xl shadow-xl p-4 sm:p-6 w-full max-w-lg flex flex-col h-[85vh] sm:h-[80vh]">
        
        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          AI Chat App
        </h1>

        {/* Chat Window */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
          {chat.length === 0 && (
            <p className="text-gray-400 text-center py-4">💡 Start chatting with AI!</p>
          )}
          {chat.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 sm:px-4 sm:py-2 rounded-2xl text-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-700 text-gray-100 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input + Button */}
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={1}
              placeholder="Type your message..."
              className="w-full resize-none rounded-xl border border-gray-600 bg-gray-800 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] max-h-[120px]"
              style={{ height: "auto" }}
            />
          </div>
          <button
            onClick={handleChat}
            disabled={loading || !message.trim()}
            className="p-2 sm:p-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
            aria-label="Send message"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      <style jsx global>{`
        /* Custom scrollbar for chat window */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        /* Ensure proper viewport on mobile devices */
        @media (max-width: 640px) {
          html, body {
            height: -webkit-fill-available;
          }
        }
      `}</style>
    </div>
  );
}