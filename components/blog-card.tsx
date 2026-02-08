"use client"

import Image from "next/image"
import type { BlogPost } from "@/lib/notion"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"

type Props = {
  post: BlogPost
  onClick: (slug: string) => void
  imagePriority?: boolean
}

export default function BlogCard({ post, onClick, imagePriority }: Props) {
  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <button
      type="button"
      onClick={() => onClick(post.slug)}
      className="group flex w-full items-stretch overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 text-left transition-all hover:border-white/20 hover:bg-neutral-800/60"
    >
      {/* Cover Image - left side, fixed width */}
      <div className="relative hidden h-auto w-36 shrink-0 overflow-hidden bg-neutral-800 sm:block md:w-44">
        {post.coverImage ? (
          <Image
            src={post.coverImage || "/placeholder.svg"}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="176px"
            priority={imagePriority}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="h-8 w-8 text-white/20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Content - right side */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-4">
        {/* Title */}
        <h3 className="text-balance text-sm font-semibold leading-snug text-white group-hover:text-white/90 sm:text-base">
          {post.title}
        </h3>

        {/* Date and ReadTime */}
        <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-white/45 sm:text-xs">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" aria-hidden="true" />
            {formattedDate}
          </span>
          {post.readTime && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {post.readTime}
            </span>
          )}
        </div>

        {/* Summary */}
        {post.summary && (
          <p className="line-clamp-2 text-xs leading-relaxed text-white/50">
            {post.summary}
          </p>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="border-white/10 bg-white/5 px-2 py-0 text-[10px] text-white/50"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}
