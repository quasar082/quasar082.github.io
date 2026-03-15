'use client';

import {useState, useMemo} from 'react';
import {useTranslations} from 'next-intl';
import {PostCard} from './PostCard';
import {TextReveal} from '@/components/animations/TextReveal';
import type {PostMeta} from '@/lib/blog';

interface PostListProps {
  posts: PostMeta[];
  allTags: string[];
  locale: string;
}

export function PostList({posts, allTags, locale}: PostListProps) {
  const t = useTranslations('Blog');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchesTag = !activeTag || p.tags.includes(activeTag);
      const matchesQuery =
        !query ||
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(query.toLowerCase());
      return matchesTag && matchesQuery;
    });
  }, [posts, activeTag, query]);

  return (
    <section className="mx-auto max-w-5xl px-6 pt-32 pb-20">
      <TextReveal as="h1" type="words" className="text-5xl font-light tracking-tight text-text-primary md:text-7xl">
        {t('heading')}
      </TextReveal>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-full border border-border bg-transparent px-5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent sm:max-w-xs"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTag(null)}
          className={`rounded-full px-4 py-1.5 text-sm transition ${
            activeTag === null
              ? 'bg-greige-900 text-white'
              : 'bg-greige-100 text-text-secondary hover:bg-greige-200'
          }`}
        >
          {t('allTags')}
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              activeTag === tag
                ? 'bg-greige-900 text-white'
                : 'bg-greige-100 text-text-secondary hover:bg-greige-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        {filtered.map((post) => (
          <PostCard key={post.slug} post={post} locale={locale} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-text-muted">{t('noResults')}</p>
      )}
    </section>
  );
}
