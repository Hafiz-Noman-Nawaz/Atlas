import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { chatApi } from '../services/chatApi';
import type { Message } from '../types';
import MarkdownRenderer from '../components/chat/MarkdownRenderer';
import ShieldLogo from '../components/common/ShieldLogo';
import { Tag, Sparkles, Loader2, MessageSquare, ArrowRight, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SharedChatPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [title, setTitle] = useState<string>('Shared Conversation');
  const [views, setViews] = useState<number>(1);
  const [createdAt, setCreatedAt] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadShared() {
      if (!shareId) return;
      setIsLoading(true);
      setError('');
      try {
        const data = await chatApi.getSharedChat(shareId);
        setTitle(data.title || 'Shared Conversation');
        setMessages(data.messages || []);
        setViews(data.views || 1);
        setCreatedAt(data.created_at || '');
      } catch (err: any) {
        setError('This shared conversation does not exist or has expired.');
      } finally {
        setIsLoading(false);
      }
    }
    loadShared();
  }, [shareId]);

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#090d16] text-white p-4">
        <Loader2 size={32} className="animate-spin text-teal-400 mb-3" />
        <p className="text-sm text-slate-400">Loading shared conversation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#090d16] text-white p-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 mb-4 border border-red-500/20">
          <MessageSquare size={24} />
        </div>
        <h2 className="text-lg font-bold text-slate-200">{error}</h2>
        <p className="text-xs text-slate-400 mt-2 max-w-sm">
          Please check the share URL or ask the author to regenerate the link.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1BD582] px-4 py-2 text-sm font-bold text-[#023047] hover:bg-[#15b86f] transition-all shadow-md"
        >
          <span>Return to Shield Funding AI</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0B1320] text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#1A283D] bg-[#0E1726]/95 backdrop-blur-md px-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <ShieldLogo size="sm" showSubtitle={false} />
          <span className="rounded-full bg-[#1BD582]/20 px-2 py-0.5 text-[10px] font-semibold text-[#1BD582] border border-[#1BD582]/30 uppercase tracking-wider">
            Public Consultation View
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={copyShareLink}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#162338] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-[#1f2f4a] hover:text-white transition-all shadow-xs"
          >
            {copied ? <Check size={13} className="text-[#1BD582]" /> : <Copy size={13} />}
            <span className="hidden sm:inline">Copy Link</span>
          </button>

          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-lg bg-[#1BD582] px-3.5 py-1.5 text-xs font-bold text-[#023047] hover:bg-[#15b86f] transition-all shadow-md active:scale-95"
          >
            <Sparkles size={13} />
            <span>Consult AI Advisor</span>
          </Link>
        </div>
      </header>

      {/* Hero Title Container */}
      <div className="mx-auto w-full max-w-3xl px-4 pt-8 pb-4">
        <div className="border-b border-[#1A283D] pb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">{title}</h1>
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
            {createdAt && <span>Shared on {new Date(createdAt).toLocaleDateString()}</span>}
            <span>•</span>
            <span>{messages.length} messages</span>
            <span>•</span>
            <span>{views} {views === 1 ? 'view' : 'views'}</span>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 space-y-6">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id || index}
              className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="flex-shrink-0 mt-0.5">
                  <ShieldLogo size="sm" variant="icon" showText={false} />
                </div>
              )}

              <div className={`max-w-[90%] sm:max-w-[85%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                {!isUser && msg.intent && (
                  <div className="mb-1.5 flex items-center gap-1.5 rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-medium text-teal-400">
                    <Tag size={10} />
                    <span>Intent: {msg.intent}</span>
                    {msg.confidence && (
                      <span className="text-slate-400">• {Math.round(msg.confidence * 100)}%</span>
                    )}
                  </div>
                )}

                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md ${
                    isUser
                      ? 'bg-teal-600 text-white rounded-br-sm'
                      : 'bg-[#121726] border border-[#21293e] text-slate-100 rounded-bl-sm'
                  }`}
                >
                  <MarkdownRenderer content={msg.content} showAudioReadout={!isUser} />
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* Bottom CTA Banner */}
      <div className="sticky bottom-0 border-t border-[#1c2438] bg-[#0c101d]/95 backdrop-blur-md p-4 text-center">
        <p className="text-xs text-slate-400 mb-2">Want to ask follow-up questions or start your own AI workspace?</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2 text-xs font-semibold text-white hover:bg-teal-500 transition-all shadow-md shadow-teal-600/20"
        >
          <span>Continue Conversation in ZeoAtlas</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
