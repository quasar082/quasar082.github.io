import {getAllPosts} from '@/lib/blog';
import {PostList} from '@/components/blog/PostList';
import {setRequestLocale} from 'next-intl/server';

export function generateStaticParams() {
  return [{lang: 'en'}, {lang: 'vi'}];
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{lang: string}>;
}) {
  const {lang} = await params;
  setRequestLocale(lang);
  const posts = getAllPosts(lang);
  const allTags = [...new Set(posts.flatMap((p) => p.tags))].sort();

  return (
    <div className="min-h-dvh">
      <PostList posts={posts} allTags={allTags} locale={lang} />
    </div>
  );
}
