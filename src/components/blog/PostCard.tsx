'use client';

import Link from 'next/link';
import type {PostMeta} from '@/lib/blog';

interface PostCardProps {
  post: PostMeta;
  locale: string;
}

export function PostCard({post, locale}: PostCardProps) {
  const formattedDate = new Date(post.date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link
      href={`/${locale}/blog/${post.slug}/`}
      className="group block rounded-lg border border-border p-6 transition hover:shadow-md"
    >
      <time className="text-sm text-text-muted" dateTime={post.date}>
        {formattedDate}
      </time>

      <h3 className="mt-2 text-xl font-semibold text-text-primary transition group-hover:text-accent">
        {post.title}
      </h3>

      <p className="mt-2 text-text-secondary line-clamp-2">{post.excerpt}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="inline-block rounded-full bg-greige-100 px-3 py-0.5 text-xs text-text-secondary"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
