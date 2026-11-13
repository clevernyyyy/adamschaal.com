import { useEffect, useState } from 'react'

type Post = { title: string; subtitle: string; url: string; date: string }

const BLOG_URL = 'https://blog.adamschaal.com'
// In dev, Vite proxies /blog-feed to the local blog server (see vite.config.ts)
const FEED_URL = import.meta.env.DEV ? '/blog-feed/recent.json' : `${BLOG_URL}/recent.json`
const COUNT = 3

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

export default function RecentPosts() {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    const controller = new AbortController()
    fetch(FEED_URL, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Post[]) => setPosts(data.slice(0, COUNT)))
      .catch(() => {})
    return () => controller.abort()
  }, [])

  return (
    <>
      <p>
        Check out my <a href={BLOG_URL} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">blog</a>
        {posts.length > 0 ? '. Recent posts:' : '.'}
      </p>
      {posts.length > 0 && (
        <ul className="list-disc pl-5 mt-2 space-y-2">
          {posts.map((post) => (
            <li key={post.url}>
              <a href={post.url} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                {post.title}
              </a>
              <div className="text-gray-600 text-sm">
                {formatDate(post.date)}
                {post.subtitle && ` · ${post.subtitle}`}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
