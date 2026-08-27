import { motion } from 'framer-motion';
import { Tag, FileText, Code, ExternalLink } from 'lucide-react';
import type { Message } from '../../types';
import { formatMessageTime } from '../../lib/utils';
import MessageActions from './MessageActions';
import MarkdownRenderer from './MarkdownRenderer';

interface Props {
  message: Message;
  index: number;
}

export default function MessageBubble({ message, index }: Props) {
  const isUser = message.role === 'user';
  const attachments = message.attachments || [];

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.2) }}
      className={`group flex gap-3 px-4 py-3 sm:px-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Assistant avatar */}
      {!isUser && (
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-accent text-white shadow-sm mt-0.5">
          <span className="text-xs font-bold">A</span>
        </div>
      )}

      <div className={`max-w-[90%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* ML Intent badge if present on assistant response */}
        {!isUser && message.intent && (
          <div className="mb-1.5 flex items-center gap-1.5 rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-medium text-teal-400">
            <Tag size={10} />
            <span>Intent: {message.intent}</span>
            {message.confidence && (
              <span className="text-slate-400">• {Math.round(message.confidence * 100)}%</span>
            )}
          </div>
        )}

        {/* Message bubble content */}
        <div
          className={`rounded-2xl px-4 py-3 text-body leading-relaxed shadow-sm transition-all ${
            isUser
              ? 'bg-accent text-white rounded-br-md'
              : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-bl-md border border-[var(--border-light)]'
          }`}
        >
          {/* Attachments rendering */}
          {attachments.length > 0 && (
            <div className={`flex flex-col gap-2 ${message.content ? 'mb-3' : ''}`}>
              {attachments.map((att, idx) => {
                const isImage = att.type && att.type.startsWith('image/');

                if (isImage) {
                  return (
                    <a
                      key={idx}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/img block overflow-hidden rounded-xl border border-black/10 bg-black/5"
                    >
                      <img
                        src={att.url}
                        alt={att.name || 'Attached photo'}
                        className="max-h-80 w-full object-cover transition-transform group-hover/img:scale-[1.01]"
                        loading="lazy"
                      />
                    </a>
                  );
                }

                return (
                  <a
                    key={idx}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={att.name}
                    className={`flex items-center gap-3 rounded-xl p-2.5 transition-colors ${
                      isUser
                        ? 'bg-white/10 hover:bg-white/20 text-white'
                        : 'border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-black/10">
                      {att.name.match(/\.(js|ts|py|json|html|css|jsx|tsx)$/i) ? (
                        <Code size={16} />
                      ) : (
                        <FileText size={16} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-caption font-medium">{att.name}</p>
                      {att.size && (
                        <p className={`text-[10px] ${isUser ? 'text-white/70' : 'text-[var(--text-tertiary)]'}`}>
                          {formatFileSize(att.size)}
                        </p>
                      )}
                    </div>
                    <ExternalLink size={14} className="flex-shrink-0 opacity-60" />
                  </a>
                );
              })}
            </div>
          )}

          {/* Formatted Content */}
          {message.content && (
            isUser ? (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            ) : (
              <MarkdownRenderer content={message.content} />
            )
          )}
        </div>

        {/* Timestamp — visible on hover */}
        <span
          className="mt-1 text-[11px] text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity select-none"
        >
          {formatMessageTime(message.created_at)}
        </span>

        {/* Actions — assistant only */}
        {!isUser && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MessageActions messageId={message.id} content={message.content} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
