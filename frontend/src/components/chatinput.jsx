import { useState } from "react";

export default function ChatInput({ onSend }) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    onSend(message);
    setMessage("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-slate-700 p-4 bg-[#0F172A]"
    >
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Ask anything..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 bg-slate-800 text-white rounded-xl px-4 py-3 outline-none border border-slate-700 focus:border-blue-500"
        />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 px-6 rounded-xl font-semibold transition"
        >
          Send
        </button>
      </div>
    </form>
  );
}