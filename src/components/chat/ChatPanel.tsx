'use client';

import {useEffect, useRef} from 'react';
import {motion} from 'framer-motion';
import {X, Trash2} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {useChatStore} from '@/stores/useChatStore';
import {isApiConfigured, sendMessage} from '@/services/chat';
import {ChatBubble} from './ChatBubble';
import {TypingIndicator} from './TypingIndicator';
import {PromptChips} from './PromptChips';

/**
 * Transparent glassmorphism chat panel that floats above the input bar.
 * Slides up with spring animation via framer-motion AnimatePresence.
 */
export function ChatPanel({onClose}: {onClose: () => void}) {
  const t = useTranslations('Chat');
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages or streaming content
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({top: el.scrollHeight, behavior: 'smooth'});
    }
  }, [messages.length, messages[messages.length - 1]?.content.length]);

  const handleClear = () => {
    useChatStore.getState().resetToGreeting();
  };

  const handlePromptSelect = (prompt: string) => {
    sendMessage(prompt);
  };

  const isEmpty = messages.length === 0;

  return (
    <motion.div
      initial={{y: 20, opacity: 0}}
      animate={{y: 0, opacity: 1}}
      exit={{y: 20, opacity: 0}}
      transition={{type: 'spring', damping: 25, stiffness: 300}}
      className="w-full md:w-[500px] mb-2 flex flex-col overflow-hidden rounded-2xl bg-white/60 backdrop-blur-md border border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.05)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/20 px-4 py-3">
        <h2 className="font-display text-sm font-medium text-text-primary">
          Robot Assistant
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleClear}
            aria-label={t('clear')}
            className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-white/30 hover:text-text-secondary"
          >
            <Trash2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-white/30 hover:text-text-secondary"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Demo mode notice */}
      {!isApiConfigured && (
        <div className="border-b border-white/20 bg-white/30 px-4 py-1.5 text-center text-xs text-text-muted">
          {t('demoNotice')}
        </div>
      )}

      {/* Message list */}
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-3 max-h-[60vh] md:max-h-[50vh]"
      >
        {isEmpty ? (
          <>
            {/* Greeting */}
            <div className="flex justify-center px-4 py-1">
              <p className="text-center text-sm italic text-text-muted">
                {t('greeting')}
              </p>
            </div>
            <PromptChips onSelect={handlePromptSelect} />
          </>
        ) : (
          messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)
        )}
        {isStreaming && <TypingIndicator />}
      </div>
    </motion.div>
  );
}
