import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  Download,
  Code2,
  Eye,
  Terminal,
  Maximize2,
  Minimize2,
  RefreshCw,
} from 'lucide-react';
import { useUiStore } from '../../stores/uiStore';
import toast from 'react-hot-toast';

export default function CanvasPanel() {
  const { canvasOpen, canvasCode, canvasLanguage, canvasTitle, closeCanvas, setCanvasCode } =
    useUiStore();
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'console'>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isRunnableWeb = ['html', 'jsx', 'tsx', 'javascript', 'js', 'css'].includes(
    (canvasLanguage || '').toLowerCase()
  );

  // Set default tab: if HTML/JS show preview, else show code
  useEffect(() => {
    if (isRunnableWeb) {
      setActiveTab('preview');
    } else {
      setActiveTab('code');
    }
    setConsoleLogs([]);
  }, [canvasCode, canvasLanguage, isRunnableWeb]);

  // Build sandboxed HTML payload with console listener
  const generatePreviewDoc = () => {
    let htmlContent = canvasCode;

    if (canvasLanguage === 'javascript' || canvasLanguage === 'js') {
      htmlContent = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, sans-serif; padding: 20px; color: #f3f4f6; background: #0b0f19; }
    button { background: #0d9488; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    window.addEventListener('error', (e) => {
      window.parent.postMessage({ type: 'CONSOLE_LOG', log: '[Error] ' + e.message }, '*');
    });
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      window.parent.postMessage({ type: 'CONSOLE_LOG', log: args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ') }, '*');
    };
    try {
      ${canvasCode}
    } catch(err) {
      console.log('[Runtime Error] ' + err.message);
    }
  <\/script>
</body>
</html>`;
    } else if (!canvasCode.toLowerCase().includes('<html') && !canvasCode.toLowerCase().includes('<!doctype')) {
      htmlContent = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, sans-serif; padding: 16px; color: #f3f4f6; background: #0b0f19; margin: 0; }
  </style>
</head>
<body>
  ${canvasCode}
</body>
</html>`;
    }

    return htmlContent;
  };

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data && event.data.type === 'CONSOLE_LOG') {
        setConsoleLogs((prev) => [...prev, String(event.data.log)]);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(canvasCode);
      setCopied(true);
      toast.success('Code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy code');
    }
  };

  const handleDownload = () => {
    let ext = 'txt';
    if (['html', 'htm'].includes(canvasLanguage)) ext = 'html';
    else if (['javascript', 'js'].includes(canvasLanguage)) ext = 'js';
    else if (['typescript', 'ts'].includes(canvasLanguage)) ext = 'ts';
    else if (['python', 'py'].includes(canvasLanguage)) ext = 'py';
    else if (['json'].includes(canvasLanguage)) ext = 'json';
    else if (['css'].includes(canvasLanguage)) ext = 'css';

    const blob = new Blob([canvasCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${canvasTitle.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.${ext}`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success(`Downloaded as .${ext}`);
  };

  const reloadPreview = () => {
    setConsoleLogs([]);
    if (iframeRef.current) {
      iframeRef.current.srcdoc = generatePreviewDoc();
    }
  };

  return (
    <AnimatePresence>
      {canvasOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className={`fixed inset-y-0 right-0 z-50 flex flex-col border-l border-[var(--border)] bg-[#0c101a] shadow-2xl transition-all ${
            isFullscreen ? 'w-full' : 'w-full md:w-[540px] lg:w-[680px]'
          }`}
        >
          {/* Canvas Top Bar */}
          <div className="flex h-14 items-center justify-between border-b border-[#1f2638] px-4 bg-[#090d16]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400">
                <Code2 size={16} />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-white">{canvasTitle}</h3>
                <span className="text-[11px] font-mono text-teal-400 uppercase tracking-wider">
                  {canvasLanguage}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-[#1a2133] hover:text-white transition-colors"
                title="Copy code"
              >
                {copied ? <Check size={16} className="text-teal-400" /> : <Copy size={16} />}
              </button>

              <button
                onClick={handleDownload}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-[#1a2133] hover:text-white transition-colors"
                title="Download file"
              >
                <Download size={16} />
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="hidden sm:flex rounded-lg p-1.5 text-slate-400 hover:bg-[#1a2133] hover:text-white transition-colors"
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              <button
                onClick={closeCanvas}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-colors ml-1"
                title="Close Canvas"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Preview / Code / Console) */}
          <div className="flex items-center justify-between border-b border-[#1f2638] bg-[#0d1220] px-4 py-1.5">
            <div className="flex items-center gap-1">
              {isRunnableWeb && (
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                    activeTab === 'preview'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      : 'text-slate-400 hover:bg-[#182033] hover:text-slate-200'
                  }`}
                >
                  <Eye size={13} />
                  <span>Preview</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  activeTab === 'code'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'text-slate-400 hover:bg-[#182033] hover:text-slate-200'
                }`}
              >
                <Code2 size={13} />
                <span>Code Editor</span>
              </button>

              {isRunnableWeb && (
                <button
                  onClick={() => setActiveTab('console')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                    activeTab === 'console'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      : 'text-slate-400 hover:bg-[#182033] hover:text-slate-200'
                  }`}
                >
                  <Terminal size={13} />
                  <span>Logs {consoleLogs.length > 0 && `(${consoleLogs.length})`}</span>
                </button>
              )}
            </div>

            {isRunnableWeb && (
              <button
                onClick={reloadPreview}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-slate-400 hover:bg-[#1a2133] hover:text-white transition-colors"
                title="Reload Preview"
              >
                <RefreshCw size={12} />
                <span>Rerun</span>
              </button>
            )}
          </div>

          {/* Main Body */}
          <div className="flex-1 overflow-hidden relative bg-[#090d16]">
            {/* Live Sandbox Preview */}
            {activeTab === 'preview' && isRunnableWeb && (
              <iframe
                ref={iframeRef}
                srcDoc={generatePreviewDoc()}
                title="Canvas Sandbox Preview"
                sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                className="h-full w-full border-none bg-white"
              />
            )}

            {/* Code Editor Tab */}
            {activeTab === 'code' && (
              <div className="flex h-full flex-col">
                <textarea
                  value={canvasCode}
                  onChange={(e) => setCanvasCode(e.target.value)}
                  className="flex-1 w-full resize-none p-4 font-mono text-xs sm:text-sm text-emerald-400 bg-[#090d16] focus:outline-none leading-relaxed border-none selection:bg-teal-500/30"
                  spellCheck={false}
                />
              </div>
            )}

            {/* Console Log Tab */}
            {activeTab === 'console' && (
              <div className="h-full overflow-y-auto p-4 font-mono text-xs text-slate-300 space-y-1 bg-[#090d16]">
                {consoleLogs.length === 0 ? (
                  <p className="text-slate-500 italic">No console logs output yet. Click 'Rerun' to execute code.</p>
                ) : (
                  consoleLogs.map((log, idx) => (
                    <div key={idx} className="border-b border-slate-800 pb-1 font-mono text-emerald-400">
                      &gt; {log}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
