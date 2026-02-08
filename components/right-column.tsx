"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import Image from "next/image"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import { cn } from "@/lib/utils"
import { ArrowLeft, Search } from "lucide-react"
import ProjectCard from "@/components/project-card"
import BlogCard from "@/components/blog-card"
import BlogReader from "@/components/blog-reader"
import ShowcaseCarousel from "@/components/showcase-carousel"
import type { BlogPost, WorkItem } from "@/lib/notion"

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch")
    return r.json()
  })

type Tab = "about" | "work" | "blog" | "resume"

type Project = {
  title: string
  subtitle: string
  imageSrc: string
  tags: string[]
  href: string
  slug: string
  priority: boolean
  gradientFrom: string
  gradientTo: string
}

type Props = {
  projects: Project[]
  initialPosts: BlogPost[]
}

export default function RightColumn({ projects, initialPosts }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("about")
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [activeProjectIndex, setActiveProjectIndex] = useState<number | null>(
    null,
  )
  const [searchQuery, setSearchQuery] = useState("")

  const {
    data: posts,
    error,
    isLoading,
  } = useSWR<BlogPost[]>("/api/blog/posts", fetcher, {
    fallbackData: initialPosts,
  })

  const {
    data: resume,
    error: resumeError,
    isLoading: resumeLoading,
  } = useSWR<{ title: string; markdown: string }>(
    activeTab === "resume" ? "/api/resume" : null,
    fetcher,
  )

  const filteredPosts = useMemo(() => {
    if (!posts) return []
    const query = searchQuery.trim().toLowerCase()
    if (!query) return posts
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query)),
    )
  }, [posts, searchQuery])

  /* Blog reader view */
  if (activeTab === "blog" && activeSlug) {
    return (
      <div className="space-y-4">
        <SegmentedControl
          activeTab={activeTab}
          onChange={(t) => {
            setActiveTab(t)
            setActiveSlug(null)
            setSearchQuery("")
          }}
        />
        <div className="animate-fade-in overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60">
          <BlogReader slug={activeSlug} onBack={() => setActiveSlug(null)} />
        </div>
      </div>
    )
  }

  /* Case study reader view */
  if (activeTab === "work" && activeProjectIndex !== null) {
    const project = projects[activeProjectIndex]

    return (
      <div className="space-y-4">
        <SegmentedControl
          activeTab={activeTab}
          onChange={(t) => {
            setActiveTab(t)
            setActiveSlug(null)
            setActiveProjectIndex(null)
            setSearchQuery("")
          }}
        />
        <div className="animate-fade-in overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60">
          <ProjectReader
            project={project}
            onBack={() => setActiveProjectIndex(null)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Segmented Control */}
      <SegmentedControl
        activeTab={activeTab}
        onChange={(t) => {
          setActiveTab(t)
          setActiveSlug(null)
          setActiveProjectIndex(null)
          setSearchQuery("")
        }}
      />

      {/* About View */}
      {activeTab === "about" && (
        <div className="animate-fade-in rounded-3xl border border-white/10 bg-neutral-900/60 p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[180px_1fr] lg:items-center">
            <div className="mx-auto h-40 w-40 overflow-hidden rounded-3xl border border-white/10 bg-neutral-800/80 sm:h-44 sm:w-44">
              <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_rgba(255,255,255,0))]" />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/40">
                About me
              </p>
              <h2 className="text-2xl font-semibold text-white">
                Designing digital experiences with precision and warmth.
              </h2>
              <p className="text-sm leading-relaxed text-white/60">
                I am a designer and full stack developer focused on building
                thoughtful products for ambitious teams. My work spans brand,
                product design, and engineering, with a bias toward clarity and
                momentum.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resume View */}
      {activeTab === "resume" && (
        <div className="animate-fade-in rounded-3xl border border-white/10 bg-neutral-900/60 p-6 sm:p-8">
          {resumeLoading && (
            <div className="space-y-3">
              <div className="h-6 w-40 animate-pulse rounded bg-white/10" />
              <div className="space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-white/10" />
                <div className="h-3 w-3/6 animate-pulse rounded bg-white/10" />
              </div>
            </div>
          )}

          {!resumeLoading && (resumeError || !resume) && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
              Could not load the resume right now.
            </div>
          )}

          {!resumeLoading && resume && resume.markdown && <ResumeView resume={resume} />}
        </div>
      )}

      {/* Work View */}
      {activeTab === "work" && (
        <div className="scrollbar-minimal space-y-4 lg:max-h-[calc(100svh-6rem)] lg:overflow-y-auto lg:snap-y lg:snap-mandatory lg:scroll-smooth">
          {projects.length === 0 ? (
            <div className="animate-fade-in flex min-h-[calc(100svh-6rem)] items-center justify-center rounded-2xl border border-white/10 bg-neutral-900/60 p-8 text-center">
              <div className="max-w-sm space-y-2">
                <p className="text-base font-medium text-white">
                  No projects available right now
                </p>
                <p className="text-sm text-white/50">
                  Check back soon for new work.
                </p>
              </div>
            </div>
          ) : (
            projects.map((p, idx) => (
              <ProjectCard
                key={p.title}
                title={p.title}
                subtitle={p.subtitle}
                imageSrc={p.imageSrc}
                tags={p.tags}
                href={p.href}
                priority={p.priority}
                gradientFrom={p.gradientFrom}
                gradientTo={p.gradientTo}
                imageContainerClassName="lg:h-full"
                containerClassName="lg:h-[calc(100svh-6rem)] lg:snap-start"
                revealDelay={idx * 0.06}
                onOpen={() => setActiveProjectIndex(idx)}
                imagePriority={idx < 2}
              />
            ))
          )}
        </div>
      )}

      {/* Blog View */}
      {activeTab === "blog" && (
        <div className="animate-fade-in space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or tag..."
              className="w-full rounded-xl border border-white/10 bg-neutral-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-white/25 focus:bg-neutral-800/60"
              aria-label="Search blog posts by title or tag"
            />
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="flex items-stretch overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="hidden w-36 shrink-0 animate-pulse bg-white/10 sm:block md:w-44" />
                  <div className="flex flex-1 flex-col gap-2.5 p-4">
                    <div className="h-4 w-3/4 animate-pulse rounded-md bg-white/10" />
                    <div className="flex gap-2.5">
                      <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
                      <div className="h-3 w-14 animate-pulse rounded bg-white/10" />
                    </div>
                    <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                    <div className="flex gap-1">
                      <div className="h-4 w-12 animate-pulse rounded-full bg-white/10" />
                      <div className="h-4 w-12 animate-pulse rounded-full bg-white/10" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="animate-fade-in rounded-2xl border border-white/10 bg-neutral-900/60 p-6 text-center">
              <p className="text-sm text-white/50">
                Could not load blog posts. Please check your Notion integration
                settings.
              </p>
            </div>
          )}

          {/* Empty state */}
          {posts && posts.length === 0 && (
            <div className="animate-fade-in flex min-h-[calc(100svh-6rem)] items-center justify-center rounded-2xl border border-white/10 bg-neutral-900/60 p-8 text-center">
              <div className="max-w-sm space-y-2">
                <p className="text-base font-medium text-white">
                  No blog posts available right now
                </p>
                <p className="text-sm text-white/50">
                  Fresh updates will land here soon.
                </p>
              </div>
            </div>
          )}

          {/* No search results */}
          {posts &&
            posts.length > 0 &&
            filteredPosts.length === 0 &&
            searchQuery.trim() !== "" && (
              <div className="animate-fade-in rounded-2xl border border-white/10 bg-neutral-900/60 p-6 text-center">
                <p className="text-sm text-white/50">
                  No posts match &ldquo;{searchQuery.trim()}&rdquo;. Try a
                  different title or tag.
                </p>
              </div>
            )}

          {/* Posts list */}
          {filteredPosts.length > 0 && (
            <div className="space-y-3">
              {filteredPosts.map((post, i) => (
                <div
                  key={post.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <BlogCard
                    post={post}
                    onClick={(slug) => setActiveSlug(slug)}
                    imagePriority={i < 2}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ProjectReader({
  project,
  onBack,
}: {
  project: Project
  onBack: () => void
}) {
  const caseStudyUrl = `/api/work/posts/${project.slug}`
  const {
    data: caseStudy,
    error,
    isLoading,
  } = useSWR<{ meta: WorkItem; markdown: string }>(
    caseStudyUrl,
    fetcher,
  )

  const fallbackGallery = [
    {
      src: project.imageSrc,
      caption: project.title,
      from: project.gradientFrom,
      to: project.gradientTo,
    },
  ]

  if (isLoading) {
    return (
      <div className="animate-slide-up flex flex-col gap-6 p-5 sm:p-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 self-start text-sm text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to work</span>
        </button>

        <div className="space-y-4">
          <div className="h-8 w-3/5 animate-pulse rounded-lg bg-white/10" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-white/10" />
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

  if (error || !caseStudy) {
    return (
      <div className="animate-slide-up flex flex-col gap-6 p-5 sm:p-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 self-start text-sm text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to work</span>
        </button>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
          Could not load this case study from Notion.
        </div>
      </div>
    )
  }

  const { meta, markdown } = caseStudy

  return (
    <div className="animate-slide-up flex flex-col gap-6 p-5 sm:p-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 self-start text-sm text-white/60 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to work</span>
      </button>

      <header className="flex flex-col gap-3">
        <h1 className="text-balance text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
          {meta.title}
        </h1>
        {meta.subtitle && (
          <p className="text-sm leading-relaxed text-white/60 sm:text-base">
            {meta.subtitle}
          </p>
        )}
        {meta.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {meta.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-white/60"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      

      <article className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-white/80 prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-code:rounded prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-white/90 prose-pre:border prose-pre:border-white/10 prose-pre:bg-neutral-900 prose-img:rounded-xl prose-blockquote:border-white/20 prose-blockquote:text-white/60">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </article>
    </div>
  )
}

/* ── Segmented Control ── */

function SegmentedControl({
  activeTab,
  onChange,
}: {
  activeTab: Tab
  onChange: (tab: Tab) => void
}) {
  const tabs: { value: Tab; label: string }[] = [
    { value: "about", label: "About" },
    { value: "work", label: "Work" },
    { value: "blog", label: "Blog" },
    { value: "resume", label: "Resume" },
  ]

  return (
    <div
      className={cn(
        "inline-flex rounded-full border border-white/10 bg-neutral-900/80 p-1 backdrop-blur-sm",
      )}
      role="tablist"
      aria-label="Content view"
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "rounded-full px-5 py-1.5 text-sm font-medium transition-all",
            activeTab === tab.value
              ? "bg-white text-neutral-950 shadow-sm"
              : "text-white/60 hover:text-white",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
function ResumeView({ resume }: { resume: { title: string; markdown: string } }) {
  const { quote, image, content } = useMemo(() => {
    const md = resume?.markdown || ""
    const quoteRegex = /(?:^|\n)(>[\s\S]*?)(?:\n\n|$)/
    const quoteMatch = md.match(quoteRegex)
    const quote = quoteMatch ? quoteMatch[1].replace(/^> /gm, "") : null

    const imgRegex = /!\[.*?\]\((.*?)\)/
    const imgMatch = md.match(imgRegex)
    const image = imgMatch ? imgMatch[1] : null

    let content = md
    if (quoteMatch) content = content.replace(quoteMatch[0], "")
    if (imgMatch) content = content.replace(imgMatch[0], "")

    return { quote, image, content: content.trim() }
  }, [resume.markdown])

  return (
    <div className="mx-auto w-full max-w-[90%] space-y-8 animate-fade-in lg:max-w-[90%]">
      <h1 className="text-3xl font-bold text-white mb-6 animate-slide-up">{resume.title}</h1>
      
      {(quote || image) && (
        <div className="flex flex-col gap-6 md:flex-row mb-12 animate-slide-up" style={{ animationDelay: "100ms" }}>
          {quote && (
            <div className="flex-1 rounded-xl bg-[#2e291f] border border-white/5 p-6 text-[#EBE5D5] shadow-lg">
              <div className="prose prose-invert prose-p:text-[#EBE5D5] max-w-none [&>p]:leading-relaxed [&>p]:mb-4 [&>p:last-child]:mb-0">
                <ReactMarkdown>{quote}</ReactMarkdown>
              </div>
            </div>
          )}
          {image && (
            <div className="shrink-0 md:w-1/3">
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-900 border border-white/5 shadow-xl">
                <Image
                  src={image}
                  alt={resume.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>
            </div>
          )}
        </div>
      )}

      <article className="prose prose-invert prose-neutral max-w-none 
        prose-headings:font-bold prose-headings:text-white
        prose-h1:text-2xl prose-h2:text-xl 
        prose-p:text-neutral-400 prose-p:leading-7
        prose-li:text-neutral-400 prose-li:my-0
        prose-ul:my-2 prose-ul:list-disc
        prose-hr:my-4 prose-hr:border-white/10
        animate-slide-up" style={{ animationDelay: "200ms" }}>
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
      </article>
    </div>
  )
}
