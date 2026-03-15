'use client';

import {motion} from 'framer-motion';

/**
 * Bouncing dots animation shown while the assistant is streaming a response.
 * Rendered in a left-aligned bubble container to match assistant message style.
 */
export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white/40 px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block size-2 rounded-full bg-text-muted"
            animate={{y: [0, -6, 0]}}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              repeatDelay: 0.1,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  );
}
