import {compileMDX} from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypePrettyCode from 'rehype-pretty-code';
import {getPostBySlug, getAllPosts, getSeriesPosts} from '@/lib/blog';
import {mdxComponents} from '@/components/blog/mdx';
import {TableOfContents} from '@/components/blog/TableOfContents';
import {SeriesNav} from '@/components/blog/SeriesNav';
import {notFound} from 'next/navigation';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import Link from 'next/link';

export function generateStaticParams() {
  const enPosts = getAllPosts('en');
  const viPosts = getAllPosts('vi');
  return [
    ...enPosts.map((p) => ({lang: 'en', slug: p.slug})),
    ...viPosts.map((p) => ({lang: 'vi', slug: p.slug})),
  ];
}

function extractHeadings(content: string) {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const headings: {level: number; text: string; id: string}[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const text = match[2].trim();
    headings.push({
      level: match[1].length,
      text,
      id: text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
    });
  }
  return headings;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{lang: string; slug: string}>;
}) {
  const {lang, slug} = await params;
  setRequestLocale(lang);

  let post;
  try {
    post = getPostBySlug(lang, slug);
  } catch {
    notFound();
  }

  const {meta, content} = post;
  const t = await getTranslations({locale: lang, namespace: 'Blog'});

  const {content: mdxContent} = await compileMDX({
    source: content,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypePrettyCode, {theme: 'github-light'}],
        ],
      },
    },
  });

  const headings = extractHeadings(content);

  const seriesPosts =
    meta.series ? getSeriesPosts(lang, meta.series) : [];

  return (
    <div className="min-h-dvh px-6 py-section md:px-8">
      <div className="mx-auto max-w-[1100px]">
        <Link
          href={`/${lang}/blog/`}
          className="mb-12 inline-block text-sm text-text-muted transition-colors hover:text-text-primary"
        >
          &larr; {t('backToBlog')}
        </Link>

        <div className="lg:grid lg:grid-cols-[1fr_250px] lg:gap-12">
          {/* Main content */}
          <article className="min-w-0">
            {/* Post header */}
            <header className="mb-12">
              <h1
                className="font-display text-text-primary"
                style={{
                  fontSize: 'var(--text-display-sm)',
                  fontWeight: 'var(--font-weight-display)',
                }}
              >
                {meta.title}
              </h1>

              <div className="mt-4 flex items-center gap-4 text-sm text-text-muted">
                <time dateTime={meta.date}>
                  {new Date(meta.date).toLocaleDateString(
                    lang === 'vi' ? 'vi-VN' : 'en-US',
                    {year: 'numeric', month: 'long', day: 'numeric'},
                  )}
                </time>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {meta.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-accent-muted px-3 py-1 text-xs text-text-accent"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </header>

            {/* Mobile TOC (inline, collapsible) */}
            <div className="lg:hidden">
              <TableOfContents headings={headings} />
            </div>

            {/* MDX content */}
            <div className="prose-custom">{mdxContent}</div>

            {/* Series navigation */}
            {seriesPosts.length > 1 && meta.series && (
              <SeriesNav
                seriesPosts={seriesPosts}
                currentSlug={slug}
                locale={lang}
                seriesName={meta.series}
              />
            )}
          </article>

          {/* Desktop sidebar: TOC */}
          <aside className="hidden lg:block">
            <TableOfContents headings={headings} />
          </aside>
        </div>
      </div>
    </div>
  );
}
