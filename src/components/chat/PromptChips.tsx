'use client';

import {useTranslations} from 'next-intl';

/**
 * Suggested prompt buttons shown on empty chat state (greeting).
 * Clicking a chip fires `onSelect` with the chip's text,
 * which triggers sendMessage in the parent.
 */
export function PromptChips({onSelect}: {onSelect: (prompt: string) => void}) {
  const t = useTranslations('Chat');

  const chips = [
    t('promptChip1'),
    t('promptChip2'),
    t('promptChip3'),
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 px-4 pt-2 pb-1">
      {chips.map((chip) => (
        <button
          key={chip}
          type="button"
          onClick={() => onSelect(chip)}
          className="rounded-md border border-accent px-3 py-1.5 text-sm text-accent transition-colors hover:bg-accent hover:text-surface-base"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
