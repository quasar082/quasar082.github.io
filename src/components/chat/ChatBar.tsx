'use client';

import {MessageCircle} from 'lucide-react';
import {AnimatePresence} from 'framer-motion';
import {useTranslations} from 'next-intl';
import {useChatStore} from '@/stores/useChatStore';
import {abortCurrentStream} from '@/services/chat';
import {ChatPanel} from './ChatPanel';

/**
 * Sticky chat bar fixed at the bottom of the viewport.
 *
 * Collapsed state: slim bar with placeholder text and icon.
 * Expanded state: ChatPanel slides up above with AnimatePresence.
 *
 * Mounted at layout level so it persists across page navigation.
 */
export function ChatBar() {
  const t = useTranslations('Chat');
  const isOpen = useChatStore((s) => s.isOpen);

  const handleExpand = () => {
    useChatStore.getState().setOpen(true);
  };

  const handleCollapse = () => {
    useChatStore.getState().setOpen(false);
    abortCurrentStream();
  };

  return (
    <div className="fixed right-0 bottom-0 z-50 w-full pb-[env(safe-area-inset-bottom)] md:right-4 md:bottom-4 md:w-[400px]">
      <AnimatePresence>
        {isOpen && <ChatPanel onClose={handleCollapse} />}
      </AnimatePresence>

      {!isOpen && (
        <button
          type="button"
          onClick={handleExpand}
          className="flex w-full items-center gap-3 border border-border bg-surface-elevated px-4 py-3 text-left transition-colors hover:border-border-hover md:rounded-xl"
        >
          <MessageCircle className="size-5 shrink-0 text-accent" />
          <span className="flex-1 truncate text-sm text-text-muted">
            {t('placeholder')}
          </span>
        </button>
      )}
    </div>
  );
}
