import { Send, Loader2, Paperclip, X, FileText, Mic, MicOff, Globe } from 'lucide-react';
import { useState, useCallback, useRef, useEffect, type KeyboardEvent, type ClipboardEvent, type ChangeEvent, type DragEvent } from 'react';
import toast from 'react-hot-toast';
import { useChatStore } from '../../stores/chatStore';
import { useAutoResize } from '../../hooks/useAutoResize';
import { chatApi } from '../../services/chatApi';
import type { Attachment } from '../../types';

const PROMPT_CHIPS = [
  { label: '⚡ MCA Requirements', prompt: 'What are the minimum requirements to qualify for a Merchant Cash Advance?' },
  { label: '🔄 Line of Credit', prompt: 'How does a business line of credit work, and what interest rates apply?' },
  { label: '🛡️ Bad Credit Funding', prompt: 'Can I get approved for funding if I have bad or fair credit?' },
  { label: '⏱️ Funding Speed', prompt: 'How quickly can I get funded after submitting my bank statements?' },
  { label: '📊 Term Loans vs MCA', prompt: 'What is the difference between an MCA and a traditional term loan?' },
  { label: '📞 Speak to Advisor', prompt: 'How can I speak directly to a Shield Funding advisor?' },
];

export default function MessageComposer() {
  const { sendMessage, isSending, webSearchEnabled, toggleWebSearch } = useChatStore();
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { ref: textareaRef, resize } = useAutoResize(160);

  const canSend = (input.trim().length > 0 || attachments.length > 0) && !isSending && !isUploading;

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInput((prev) => (prev ? `${prev.trim()} ${transcript}` : transcript));
          resize();
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[Speech Recognition Error]', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [resize]);

  // Listen for external focus requests (e.g., from EmptyState banner or quick prompt button)
  useEffect(() => {
    const handleFocusRequest = () => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };
    window.addEventListener('focus-chat-input', handleFocusRequest);
    return () => window.removeEventListener('focus-chat-input', handleFocusRequest);
  }, [textareaRef]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Voice dictation is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast('Listening... Speak into your microphone', { icon: '🎙️' });
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }
  };

  // Upload handler for files (PDF, DOCX, CSV, TXT, images, code files)
  const handleUploadFiles = async (files: File[]) => {
    if (!files || files.length === 0) return;

    for (const f of files) {
      if (f.size > 20 * 1024 * 1024) {
        toast.error(`File "${f.name}" exceeds the 20MB limit.`);
        return;
      }
    }

    setIsUploading(true);
    try {
      const uploaded = await chatApi.uploadFiles(files);
      setAttachments((prev) => [...prev, ...uploaded]);
      toast.success(`${uploaded.length} file${uploaded.length > 1 ? 's' : ''} attached`);
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUploadFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const filesToUpload: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item && item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        if (blob) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const file = new File([blob], `screenshot_${timestamp}.png`, { type: blob.type });
          filesToUpload.push(file);
        }
      }
    }

    if (filesToUpload.length > 0) {
      e.preventDefault();
      handleUploadFiles(filesToUpload);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeAttachment = (indexToRemove: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if ((!text && attachments.length === 0) || isSending || isUploading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const currentAttachments = [...attachments];
    setInput('');
    setAttachments([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await sendMessage(text, currentAttachments);
  }, [input, attachments, isSending, isUploading, isListening, sendMessage, textareaRef]);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className={`border-t border-[var(--border)] bg-[var(--bg-composer)] shadow-[0_-4px_14px_rgba(0,0,0,0.04)] px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-4 sm:pt-2.5 sm:pb-3 transition-colors ${
        isDragging ? 'bg-accent/5' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="mx-auto max-w-3xl">
        {/* Quick Action Prompt Chips + Live Web Search Toggle */}
        <div className="mb-1.5 sm:mb-2 flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none touch-pan-x">
          {/* Live Web Search Grounding Toggle */}
          <button
            type="button"
            onClick={toggleWebSearch}
            className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-0.5 sm:py-1 text-[11px] font-medium transition-all shadow-2xs ${
              webSearchEnabled
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-sky-500/10'
                : 'border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-slate-600'
            }`}
            title={webSearchEnabled ? 'Live Web Search is ON' : 'Enable live Google search grounding'}
          >
            <Globe size={12} className={webSearchEnabled ? 'text-sky-400 animate-spin-slow' : 'text-slate-400'} />
            <span>Web Search {webSearchEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <span className="h-3 w-px bg-[var(--border)] flex-shrink-0 mx-0.5" />

          {PROMPT_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInput(chip.prompt);
                if (textareaRef.current) {
                  textareaRef.current.focus();
                }
              }}
              className="flex-shrink-0 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-2.5 py-0.5 sm:py-1 text-[10.5px] sm:text-[11px] font-medium text-[var(--text-secondary)] hover:border-accent hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all active:scale-95 shadow-2xs"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Hidden file input supporting documents and images */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
          accept="image/*,.pdf,.docx,.txt,.csv,.json,.js,.ts,.py,.jsx,.tsx,.html,.css,.md,.zip"
        />

        {/* Attachment preview tray */}
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5 sm:gap-2">
            {attachments.map((att, idx) => {
              const isImg = att.type.startsWith('image/');
              return (
                <div
                  key={idx}
                  className="group relative flex items-center gap-1.5 sm:gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-1 sm:p-1.5 pr-2 shadow-xs transition-all"
                >
                  {isImg ? (
                    <img
                      src={att.url}
                      alt={att.name}
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded object-cover border border-[var(--border-light)]"
                    />
                  ) : (
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                      <FileText size={16} className="text-accent" />
                    </div>
                  )}

                  <div className="min-w-0 max-w-[110px] sm:max-w-[140px]">
                    <p className="truncate text-[11px] sm:text-caption font-medium text-[var(--text-primary)]">
                      {att.name}
                    </p>
                    {att.size && (
                      <p className="text-[9px] sm:text-[10px] text-[var(--text-tertiary)]">
                        {formatFileSize(att.size)}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="ml-0.5 rounded-full p-0.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-red-500 transition-colors"
                    aria-label="Remove attachment"
                    title="Remove"
                  >
                    <X size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Text Input Container */}
        <div
          className={`flex items-end gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 sm:px-3 sm:py-2 transition-all shadow-xs ${
            isDragging ? 'border-accent ring-2 ring-accent/20' : 'focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/20'
          }`}
        >
          {/* File Upload Trigger */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isSending}
            className="flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-accent transition-colors disabled:opacity-50"
            aria-label="Attach documents or photos"
            title="Attach PDFs, DOCX, CSV, code, or photos"
          >
            {isUploading ? (
              <Loader2 size={15} className="animate-spin text-accent" />
            ) : (
              <Paperclip size={16} />
            )}
          </button>

          {/* Voice Input Microphone Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-accent'
            }`}
            aria-label="Voice dictation"
            title={isListening ? 'Stop recording' : 'Dictate with voice'}
          >
            {isListening ? <MicOff size={15} /> : <Mic size={16} />}
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              resize();
            }}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={
              isDragging
                ? 'Drop financial documents or statements here...'
                : isListening
                ? 'Listening... Speak now'
                : 'Ask about loan options, qualification requirements, or funding speed…'
            }
            rows={1}
            disabled={isSending}
            className="flex-1 resize-none bg-transparent text-[13.5px] sm:text-body text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none disabled:opacity-50 py-0.5 leading-relaxed"
            style={{ minHeight: '22px', maxHeight: '140px' }}
            aria-label="Message input"
          />

          <button
            onClick={handleSend}
            disabled={!canSend}
            className={`flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all ${
              canSend
                ? 'bg-[#1BD582] text-[#023047] hover:bg-[#15b86f] active:scale-95 shadow-sm font-bold'
                : 'bg-[var(--bg-hover)] text-[var(--text-tertiary)] cursor-not-allowed'
            }`}
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2 size={14} className="animate-spin text-[#023047]" />
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>

        <p className="mt-1 hidden sm:block text-center text-[10.5px] text-[var(--text-tertiary)]">
          Shield Funding AI Assistant provides commercial financing guidance • Subject to final underwriting approval.
        </p>
      </div>
    </div>
  );
}
