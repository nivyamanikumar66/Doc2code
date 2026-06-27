import { MessageSquare, Trash2, PlusCircle } from "lucide-react";

export default function ChatSidebar() {
  return (
    <div className="w-72 bg-[#020817] border-r border-slate-800 flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white">
          🤖 Doc2Code
        </h2>

        <p className="text-slate-400 text-sm mt-1">
          AI Assistant
        </p>
      </div>

      {/* Actions */}
      <div className="p-4 space-y-3">

        <button className="w-full flex items-center gap-3 bg-blue-600 hover:bg-blue-700 transition rounded-xl px-4 py-3 text-white font-semibold">
          <PlusCircle size={18} />
          New Chat
        </button>

        <button className="w-full flex items-center gap-3 bg-slate-800 hover:bg-slate-700 transition rounded-xl px-4 py-3 text-slate-200">
          <MessageSquare size={18} />
          Chat History
        </button>

        <button className="w-full flex items-center gap-3 bg-red-600/20 hover:bg-red-600 transition rounded-xl px-4 py-3 text-red-400 hover:text-white">
          <Trash2 size={18} />
          Clear Chat
        </button>

      </div>

      {/* Bottom */}
      <div className="mt-auto p-5 border-t border-slate-800">
        <p className="text-xs text-slate-500">
          Doc2Code v1.0
        </p>

        <p className="text-xs text-slate-600 mt-1">
          Powered by Gemini AI
        </p>
      </div>

    </div>
  );
}