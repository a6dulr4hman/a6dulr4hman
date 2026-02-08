"use client"

import Image from "next/image"
import { ArrowLeft, Calendar, Clock, AlertCircle, RotateCcw } from "lucide-react"
import ReactMarkdown from "react-markdown"; import rehypeRaw from "rehype-raw"
import useSWR from "swr"
import { Badge } from "@/components/ui/badge"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Props = {
  slug: string
  onBack: () => void
}

export default function BlogReader({ slug, onBack }: Props) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/blog/posts/${slug}`,
    fetcher,
  )

  /* ── Loading skeleton ── */
  if (isLoading) {
    return (
      <div className="animate-fade-in flex flex-col gap-6 p-5 sm:p-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 self-start text-sm text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to posts</span>
        </button>

        <div className="space-y-4">
          <div className="h-8 w-4/5 animate-pulse rounded-lg bg-white/10" />
          <div className="flex gap-3">
            <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
          </div>
          <div className="aspect-[16/9] w-full animate-pulse rounded-2xl bg-white/10" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-white/10" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-3/6 animate-pulse rounded bg-white/10" />
          </div>
        </div>
      </div>
    )
  }

  /* ── Error state ── */
  if (error || !data || data.error) {
    const is404 = data?.error === "Post not found"

    return (
      <div className="animate-fade-in flex flex-col gap-6 p-5 sm:p-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 self-start text-sm text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to posts</span>
        </button>

        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <AlertCircle className="h-6 w-6 text-white/40" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">
              {is404 ? "Post not found" : "Something went wrong"}
            </h2>
            <p className="max-w-xs text-sm leading-relaxed text-white/50">
              {is404
                ? "This post may have been unpublished or the link is no longer valid. Head back to the blog list to find what you're looking for."
                : "We couldn't load this post right now. This could be a temporary issue with the connection. Give it another try or come back in a moment."}
            </p>
          </div>

          <div className="flex gap-3">
            {!is404 && (
              <button
                type="button"
                onClick={() => mutate()}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Try again
              </button>
            )}
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-950 transition-colors hover:bg-white/90"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to blog
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { meta, markdown } = data

  const formattedDate = new Date(meta.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="animate-slide-up flex flex-col gap-6 p-5 sm:p-6">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 self-start text-sm text-white/60 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to posts</span>
      </button>

      {/* Header: title first, large and bold */}
      <header className="flex flex-col gap-4">
        <h1 className="text-balance text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
          {meta.title}
        </h1>

        {/* Date + ReadTime */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-white/50">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            {formattedDate}
          </span>
          {meta.readTime && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {meta.readTime}
            </span>
          )}
        </div>

        {/* Summary */}
        {meta.summary && (
          <p className="text-sm leading-relaxed text-white/60 sm:text-base">
            {meta.summary}
          </p>
        )}

        {/* Tags */}
        {meta.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {meta.tags.map((tag: string) => (
              <Badge
                key={tag}
                variant="secondary"
                className="border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-white/60"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </header>

      {/* Cover image */}
      {meta.coverImage && (
        <div className="relative aspect-[16/4] w-full overflow-hidden rounded-2xl bg-neutral-800">
          <Image
            src={meta.coverImage || "https://placehold.co/600x400"}
            alt={meta.title}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 66vw, 100vw"
          />
        </div>
      )}

      {/* Divider */}
      <div className="h-px w-full bg-white/10" />

      {/* Article body */}
      <article className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-white/80 prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-code:rounded prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-white/90 prose-pre:border prose-pre:border-white/10 prose-pre:bg-neutral-900 prose-img:rounded-xl prose-blockquote:border-white/20 prose-blockquote:text-white/60">
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{markdown}</ReactMarkdown>
      </article>
    </div>
  )
}
