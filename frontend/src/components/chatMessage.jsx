import ReactMarkdown from "react-markdown";

export default function ChatMessage({ message }) {
  const isUser = message?.sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-3xl rounded-2xl px-5 py-4 whitespace-pre-wrap shadow-md ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-slate-800 text-slate-200"
        }`}
      >
        <div className="text-xs mb-2 opacity-70 font-semibold">
          {isUser ? "👤 You" : "🤖 Doc2Code AI"}
        </div>

        <div className="leading-7">
          <ReactMarkdown>
            {message?.text || ""}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}