import { memo } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileText, ExternalLink } from 'lucide-react';
import type { Message } from '../../types';
import { formatMessageTime } from '../../lib/utils';
import MessageActions from './MessageActions';
import MarkdownRenderer from './MarkdownRenderer';
import ShieldLogo from '../common/ShieldLogo';

interface Props {
  message: Message;
  index: number;
}

function MessageBubbleComponent({ message, index }: Props) {
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
      transition={{ duration: 0.2, delay: Math.min(index * 0.01, 0.15) }}
      className={`group flex gap-3 px-4 py-3 sm:px-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Assistant avatar — Official Shield Crest */}
      {!isUser && (
        <div className="flex-shrink-0 mt-0.5">
          <ShieldLogo size="sm" variant="icon" showText={false} />
        </div>
      )}

      <div className={`max-w-[90%] sm:max-w-[82%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Shield Funding AI Advisor badge */}
        {!isUser && (
          <div className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold text-[#06C18C] select-none">
            <ShieldCheck size={13} />
            <span>Shield Funding AI Advisor</span>
          </div>
        )}

        {/* Message bubble content */}
        <div
          className={`rounded-2xl px-4 py-3 text-body leading-relaxed shadow-xs transition-all ${
            isUser
              ? 'bg-[#023047] text-white rounded-br-xs'
              : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-bl-xs border border-[var(--border)] shadow-xs'
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
                        alt={att.name || 'Attached document'}
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
                      <FileText size={16} />
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
              <p className="whitespace-pre-wrap break-words text-xs sm:text-sm">{message.content}</p>
            ) : (
              <MarkdownRenderer content={message.content} />
            )
          )}
        </div>

        {/* Timestamp */}
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

const MessageBubble = memo(MessageBubbleComponent, (prev, next) => {
  return (
    prev.message.id === next.message.id &&
    prev.message.content === next.message.content &&
    prev.index === next.index &&
    prev.message.intent === next.message.intent
  );
});

export default MessageBubble;
