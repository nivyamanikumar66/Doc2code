import { useState } from "react";
import ChatSidebar from "../components/ChatSidebar";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";

export default function Chatbot({ analysis, url, useCase }) {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text:
        "👋 Hi! I'm Doc2Code AI Assistant.\n\nHow can I help you with this API?",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const handleSend = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      sender: "user",
      text: message,
    };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
       body: JSON.stringify({
  message,
  history: messages,
  analysis,
  url,
  useCase,
}),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.reply || "No response from AI.",
        },
      ]);
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "⚠️ Failed to connect to backend.",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="h-screen bg-[#0B1120]  text-white">

      {/* <ChatSidebar /> */}

      <div className="h-full flex flex-col">

        <div className="border-b border-slate-700 p-2">
            <p className="text-slate-400"></p>
            🤖 Doc2Code AI Assistant
      

          <p className="text-slate-400 text-xs mt-0">
            Ask anything about the API documentation.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {messages.map((msg, index) => (
            <ChatMessage
              key={index}
              message={msg}
            />
          ))}

          {loading && (
            <div className="text-slate-400 animate-pulse">
              🤖 AI is thinking...
            </div>
          )}

        </div>

        <ChatInput onSend={handleSend} />

      </div>

    </div>
  );
}