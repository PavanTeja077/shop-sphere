import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

function FormattedText({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, lineIdx) => {
        if (!line.trim()) return <div key={lineIdx} className="h-1" />;

        const regex = /(\*\*[^*]+\*\*|~~[^~]+~~|`[^`]+`)/g;
        const parts = [];
        let lastIndex = 0;
        let match;
        let keyIdx = 0;

        while ((match = regex.exec(line)) !== null) {
          if (match.index > lastIndex) {
            parts.push(<span key={keyIdx++}>{line.substring(lastIndex, match.index)}</span>);
          }
          const token = match[0];
          if (token.startsWith('**') && token.endsWith('**')) {
            parts.push(
              <strong key={keyIdx++} className="font-semibold text-teal-300">
                {token.slice(2, -2)}
              </strong>
            );
          } else if (token.startsWith('~~') && token.endsWith('~~')) {
            parts.push(
              <del key={keyIdx++} className="opacity-60 text-xs line-through">
                {token.slice(2, -2)}
              </del>
            );
          } else if (token.startsWith('`') && token.endsWith('`')) {
            parts.push(
              <code key={keyIdx++} className="bg-white/15 px-1 py-0.5 rounded text-amber-300 font-mono text-xs">
                {token.slice(1, -1)}
              </code>
            );
          }
          lastIndex = regex.lastIndex;
        }

        if (lastIndex < line.length) {
          parts.push(<span key={keyIdx++}>{line.substring(lastIndex)}</span>);
        }

        return (
          <div
            key={lineIdx}
            className={
              line.trim().startsWith('•') || line.trim().startsWith('-')
                ? 'pl-2 text-gray-200'
                : 'text-gray-100'
            }
          >
            {parts}
          </div>
        );
      })}
    </div>
  );
}

export default function AICopilot() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: '👋 Hello! I am your ShopSphere AI Shopping Assistant. Looking for top deals, comparisons, product specs, or discount coupons? Ask me anything!'
    }
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, open]);

  const handleSend = async (textToSend) => {
    const text = textToSend || prompt;
    if (!text.trim()) return;
    const userMsg = { role: 'user', text };
    setMessages((msgs) => [...msgs, userMsg]);
    if (!textToSend) setPrompt('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/copilot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      const aiMsg = { role: 'ai', text: data.response || 'I got your question!' };
      setMessages((msgs) => [...msgs, aiMsg]);
    } catch (e) {
      setMessages((msgs) => [
        ...msgs,
        { role: 'ai', text: 'Sorry, I had trouble connecting. Please ensure the backend is running!' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Show top deals",
    "Recommend headphones",
    "Smartwatch specs",
    "Active coupons",
    "Compare headphones and speaker",
    "Delivery & Returns"
  ];

  return (
    <>
      {/* Floating button */}
      <button
        className="fixed bottom-6 right-6 bg-gradient-to-r from-brand-500 to-teal-400 text-white rounded-full p-3.5 flex items-center gap-2 shadow-[0_0_25px_rgba(20,184,166,0.5)] hover:scale-105 transition-all z-50 group font-bold text-sm"
        onClick={() => setOpen(!open)}
        aria-label="AI Co‑pilot"
      >
        <Sparkles className="w-5 h-5 animate-spin-slow" />
        <span className="hidden sm:inline">AI Copilot</span>
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[540px] bg-dark-900/95 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col p-4 border border-brand-500/30 z-50 text-white animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 border border-brand-500/40">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-none">ShopSphere Copilot</h3>
                <span className="text-[11px] text-emerald-400 font-medium">● Online</span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto mb-3 space-y-3 pr-1 custom-scrollbar text-sm">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm ${
                    msg.role === 'user'
                      ? 'bg-brand-500 text-white rounded-br-none'
                      : 'bg-white/10 text-gray-100 rounded-bl-none border border-white/5 shadow-inner'
                  }`}
                >
                  {msg.role === 'user' ? msg.text : <FormattedText text={msg.text} />}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 px-4 py-2 rounded-2xl rounded-bl-none text-xs text-gray-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="text-[11px] bg-white/5 hover:bg-brand-500/20 hover:text-brand-300 text-gray-300 px-2.5 py-1 rounded-full whitespace-nowrap border border-white/5 transition-colors shrink-0"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="flex gap-2 items-center bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-brand-500 transition-colors">
            <input
              type="text"
              className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
              placeholder="Ask anything about products, deals, delivery..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              className="p-1.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white rounded-lg transition-colors"
              onClick={() => handleSend()}
              disabled={!prompt.trim() || loading}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

