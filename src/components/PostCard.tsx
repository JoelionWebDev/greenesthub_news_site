import Image from 'next/image';
import Link from 'next/link';
import { getCategoryName } from '@/lib/categories';
import type { PostMeta } from '@/lib/posts';

export default function PostCard({ post }: { post: PostMeta }) {
  return (
    <article className="post-card">
      <Link href={`/posts/${post.slug}`} className="post-card-image">
        <Image
          src={post.coverImage}
          alt={post.title}
          width={800}
          height={500}
          sizes="(max-width: 700px) 100vw, 33vw"
        />
      </Link>
      <div className="post-card-body">
        <Link href={`/category/${post.category}`} className="post-card-category">
          {getCategoryName(post.category)}
        </Link>
        <h3 className="post-card-title">
          <Link href={`/posts/${post.slug}`}>{post.title}</Link>
        </h3>
        {post.excerpt ? <p className="post-card-excerpt">{post.excerpt}</p> : null}
        <p className="post-card-meta">
          {post.author} ·{' '}
          {new Date(`${post.date}T00:00:00Z`).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>
    </article>
  );
}
