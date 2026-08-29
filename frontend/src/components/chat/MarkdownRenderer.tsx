import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy, Play, Volume2, VolumeX, X, ExternalLink, Video, Code2, BookOpen, Globe } from 'lucide-react';
import { useUiStore } from '../../stores/uiStore';

interface Props {
  content: string;
  showAudioReadout?: boolean;
}

function CustomLink({ href, children }: { href?: string; children?: React.ReactNode }) {
  if (!href) return <span>{children}</span>;

  const isYouTube = href.includes('youtube.com') || href.includes('youtu.be');
  const isGitHub = href.includes('github.com');
  const isDocs = href.includes('docs.') || href.includes('documentation') || href.includes('wiki');

  if (isYouTube) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400 hover:border-red-500/60 hover:bg-red-500/20 hover:text-red-300 transition-all shadow-xs my-0.5 group/yt mx-1 align-baseline"
      >
        <Video size={13} className="text-red-400 group-hover/yt:scale-110 transition-transform flex-shrink-0" />
        <span className="underline decoration-red-400/40 underline-offset-2">{children}</span>
        <ExternalLink size={10} className="opacity-70 group-hover/yt:opacity-100 flex-shrink-0" />
      </a>
    );
  }

  if (isGitHub) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600/40 bg-slate-800/60 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:border-slate-500 hover:bg-slate-750 hover:text-white transition-all shadow-xs my-0.5 group/gh mx-1 align-baseline"
      >
        <Code2 size={13} className="group-hover/gh:scale-110 transition-transform flex-shrink-0" />
        <span className="underline decoration-slate-400/40 underline-offset-2">{children}</span>
        <ExternalLink size={10} className="opacity-70 group-hover/gh:opacity-100 flex-shrink-0" />
      </a>
    );
  }

  if (isDocs) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-xs font-semibold text-teal-400 hover:border-teal-500/60 hover:bg-teal-500/20 hover:text-teal-300 transition-all shadow-xs my-0.5 group/doc mx-1 align-baseline"
      >
        <BookOpen size={13} className="text-teal-400 group-hover/doc:scale-110 transition-transform flex-shrink-0" />
        <span className="underline decoration-teal-400/40 underline-offset-2">{children}</span>
        <ExternalLink size={10} className="opacity-70 group-hover/doc:opacity-100 flex-shrink-0" />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent hover:border-accent hover:bg-accent/20 hover:text-accent-light transition-all shadow-xs my-0.5 group/link mx-1 align-baseline"
    >
      <Globe size={12} className="group-hover/link:rotate-12 transition-transform flex-shrink-0" />
      <span className="underline decoration-accent/40 underline-offset-2">{children}</span>
      <ExternalLink size={10} className="opacity-70 group-hover/link:opacity-100 flex-shrink-0" />
    </a>
  );
}

function CodeRunnerModal({
  code,
  language,
  onClose,
}: {
  code: string;
  language: string;
  onClose: () => void;
}) {
  const isJs = ['javascript', 'js'].includes(language.toLowerCase());
  const isCss = ['css'].includes(language.toLowerCase());

  let fullHtml = code;
  if (isJs) {
    fullHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background: #0f172a; color: #f8fafc; }
    #output { background: #1e293b; padding: 14px; border-radius: 8px; font-family: monospace; font-size: 13px; min-height: 80px; white-space: pre-wrap; border: 1px solid #334155; }
  </style>
</head>
<body>
  <h3>Live JavaScript Execution Console</h3>
  <div id="output"></div>
  <script>
    const output = document.getElementById('output');
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      output.innerText += args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') + '\\n';
    };
    try {
      ${code}
    } catch(err) {
      output.innerHTML += '<span style="color:#ef4444">Error: ' + err.message + '</span>\\n';
    }
  </script>
</body>
</html>`;
  } else if (isCss) {
    fullHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    ${code}
  </style>
</head>
<body style="padding: 20px; font-family: sans-serif;">
  <h2>CSS Sandbox Preview</h2>
  <div class="box" style="padding: 20px; border: 1px dashed #666;">
    <p>Sample preview element</p>
    <button>Sample Button</button>
  </div>
</body>
</html>`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="flex h-[80vh] w-full max-w-3xl flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 bg-[var(--bg-tertiary)]">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Live Sandbox Preview ({language.toUpperCase()})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 bg-white">
          <iframe
            srcDoc={fullHtml}
            sandbox="allow-scripts"
            title="Code Sandbox"
            className="h-full w-full border-none"
          />
        </div>
      </div>
    </div>
  );
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const [showRunner, setShowRunner] = useState(false);
  const openCanvas = useUiStore((s) => s.openCanvas);

  const lang = (language || 'code').toLowerCase();
  const isRunnable = ['javascript', 'js', 'html', 'htm', 'css'].includes(lang);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenCanvas = () => {
    openCanvas(code, lang, `${lang.toUpperCase()} Artifact`);
  };

  return (
    <>
      <div className="my-3 overflow-hidden rounded-xl border border-[var(--border)] bg-[#0d1117] text-slate-100 shadow-md transition-all hover:border-slate-700">
        {/* Code Header Bar */}
        <div className="flex items-center justify-between border-b border-[#21262d] bg-[#161b22] px-3.5 py-1.5 text-xs text-slate-400">
          <span className="font-mono font-medium uppercase tracking-wider text-teal-400">
            {language || 'code'}
          </span>
          <div className="flex items-center gap-1.5">
            {/* Open in Canvas Button */}
            <button
              onClick={handleOpenCanvas}
              type="button"
              className="flex items-center gap-1 rounded-md bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 text-xs font-medium text-teal-300 hover:bg-teal-500/25 transition-all active:scale-95 shadow-2xs"
              title="Open in Side-by-Side Canvas"
            >
              <Code2 size={12} />
              <span>Canvas</span>
            </button>

            {isRunnable && (
              <button
                onClick={() => setShowRunner(true)}
                type="button"
                className="flex items-center gap-1 rounded-md bg-emerald-600/20 border border-emerald-500/30 px-2 py-0.5 text-xs font-medium text-emerald-400 hover:bg-emerald-600/30 transition-all active:scale-95 shadow-2xs"
                title="Run in live preview"
              >
                <Play size={11} className="fill-current" />
                <span>Run</span>
              </button>
            )}
            <button
              onClick={handleCopy}
              type="button"
              className="flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs text-slate-300 hover:bg-[#262c36] hover:text-white transition-colors active:scale-95"
              title="Copy code"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-teal-400" />
                  <span className="text-teal-400 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Content */}
        <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>

      {showRunner && (
        <CodeRunnerModal
          code={code}
          language={language || 'javascript'}
          onClose={() => setShowRunner(false)}
        />
      )}
    </>
  );
}

export default function MarkdownRenderer({ content, showAudioReadout = true }: Props) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const cleanText = content
        .replace(/```[\s\S]*?```/g, 'Code block omitted.')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/[#*_~>]/g, '')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="relative markdown-content text-body leading-relaxed text-[var(--text-primary)]">
      {showAudioReadout && content.length > 20 && (
        <div className="absolute right-0 -top-1">
          <button
            onClick={toggleSpeech}
            type="button"
            className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-accent transition-colors"
            title={isSpeaking ? 'Stop reading' : 'Read aloud'}
          >
            {isSpeaking ? (
              <>
                <VolumeX size={13} className="text-red-400" />
                <span className="text-red-400 font-medium">Stop</span>
              </>
            ) : (
              <>
                <Volume2 size={13} />
                <span>Listen</span>
              </>
            )}
          </button>
        </div>
      )}

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => <CustomLink href={href}>{children}</CustomLink>,
          h1: ({ children }) => (
            <h1 className="mb-3 mt-4 text-heading-md font-bold text-[var(--text-primary)] first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2.5 mt-3.5 text-heading-sm font-semibold text-[var(--text-primary)] first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-3 text-sm font-semibold text-[var(--text-primary)] first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-2.5 last:mb-0 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 list-disc pl-5 space-y-1.5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 list-decimal pl-5 space-y-1.5">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-1">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-[var(--text-primary)]">
              {children}
            </strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-2.5 border-l-4 border-accent/60 bg-accent/5 px-3.5 py-2 text-sm italic text-[var(--text-secondary)] rounded-r-lg shadow-2xs">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-[var(--border)] shadow-xs">
              <table className="w-full text-left text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 font-semibold text-[var(--text-primary)]">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border-t border-[var(--border-light)] px-3 py-2">{children}</td>
          ),
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');

            if (match || String(children).includes('\n')) {
              return (
                <CodeBlock
                  language={match?.[1] ?? 'code'}
                  code={codeString}
                />
              );
            }

            return (
              <code
                className="rounded-md bg-[#1c202d] border border-[#2e364a] px-1.5 py-0.5 font-mono text-[12.5px] font-medium text-teal-300"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
