import fs from 'fs/promises'
import path from 'path'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeHighlight from 'rehype-highlight'
import { ArrowLeft, BookOpen } from 'lucide-react'

// Import highlight.js theme
import 'highlight.js/styles/github-dark.css'

const GUIDES_DIR = path.join(process.cwd(), 'developer-guides')

// Map slug to actual filename (handles numbered prefixes)
async function getGuideFile(slug: string): Promise<string | null> {
  const files = await fs.readdir(GUIDES_DIR)
  // Try exact match first
  if (files.includes(`${slug}.md`)) {
    return `${slug}.md`
  }
  // Try finding file that ends with the slug (for numbered files like 01-project-structure)
  const match = files.find(
    (f) => f.endsWith('.md') && f.replace(/^\d+-/, '').replace('.md', '') === slug
  )
  return match || null
}

// Extract title from markdown content (first h1)
function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1] : 'Developer Guide'
}

export async function generateStaticParams() {
  const files = await fs.readdir(GUIDES_DIR)
  return files
    .filter((f) => f.endsWith('.md') && f !== 'INDEX.md')
    .map((f) => ({ slug: f.replace('.md', '') }))
}

export const dynamicParams = false
export const dynamic = 'force-static'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const file = await getGuideFile(slug)
  if (!file) return { title: 'Guide Not Found' }

  const content = await fs.readFile(path.join(GUIDES_DIR, file), 'utf-8')
  const title = extractTitle(content)

  return {
    title: `${title} | Developer Guides`,
    description: `Developer guide: ${title}`,
  }
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const file = await getGuideFile(slug)

  if (!file) {
    notFound()
  }

  const content = await fs.readFile(path.join(GUIDES_DIR, file), 'utf-8')
  const title = extractTitle(content)

  return (
    <div className="container-default py-8">
      {/* Back navigation */}
      <div className="mb-6">
        <Link
          href="/system/guides"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-8 px-3 hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="size-4" />
          All Guides
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <BookOpen className="size-4" />
        <span>Developer Guide</span>
      </div>

      {/* Markdown content */}
      <article className="prose prose-lg prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h3:text-xl prose-code:before:content-none prose-code:after:content-none prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-border prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-table:border prose-table:border-border prose-th:border prose-th:border-border prose-th:px-4 prose-th:py-2 prose-th:bg-muted prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2 prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:not-italic">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            rehypeSlug,
            [
              rehypeAutolinkHeadings,
              { behavior: 'wrap', properties: { className: ['anchor'] } },
            ],
            rehypeHighlight,
          ]}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  )
}
