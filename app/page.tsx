import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getPublishedPosts, getWorkItems } from "@/lib/notion"

import { Button } from "@/components/ui/button"
import DotGridShader from "@/components/DotGridShader"

import AnimatedHeading from "@/components/animated-heading"
import RevealOnView from "@/components/reveal-on-view"
import RightColumn from "@/components/right-column"
import PageLoader from "@/components/page-loader"

export default async function Page() {
  const workItems = await getWorkItems()
  const posts = await getPublishedPosts()

  const gradients = [
    { from: "#0f172a", to: "#6d28d9" },
    { from: "#111827", to: "#2563eb" },
    { from: "#0b132b", to: "#5bc0be" },
    { from: "#0f172a", to: "#10b981" },
    { from: "#1f2937", to: "#8b5cf6" },
    { from: "#0b132b", to: "#10b981" },
  ]

  const projects = workItems.map((item, index) => {
    const gradient = gradients[index % gradients.length]
    return {
      title: item.title,
      subtitle: item.subtitle ?? "",
      imageSrc: item.image ?? "/placeholder.svg?height=720&width=1280",
      tags: item.tags,
      href: `/work/${item.slug}`,
      slug: item.slug,
      priority: index === 0,
      gradientFrom: gradient.from,
      gradientTo: gradient.to,
    }
  })

  return (
    <PageLoader>
      <main className="bg-neutral-950 text-white">
        {/* HERO: full-viewport row. Left is sticky; right scrolls internally. */}
        <section className="px-4 pt-4 pb-16 lg:pb-4">
          <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[420px_1fr]">
            {/* LEFT: sticky and full height, no cut off */}
            <aside className="lg:sticky lg:top-4 lg:h-[calc(100svh-2rem)]">
              <RevealOnView
                as="div"
                intensity="hero"
                className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60 p-6 sm:p-8"
                staggerChildren
              >
                {/* Texture background */}
                <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
                  <DotGridShader />
                </div>
                <div>
                  {/* Wordmark */}
                  <div className="mb-8 flex items-center gap-2">
                    <div className="text-2xl font-extrabold tracking-tight">abdulrahman</div>
                    {/* <div className="h-2 w-2 rounded-full bg-white/60" aria-hidden="true" /> */}
                    <div className="h-2 w-2 rounded-full bg-green-400" aria-hidden="true" />
                  </div>

                  {/* Headline with intro blur effect */}
                  <AnimatedHeading
                    className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl"
                    lines={["I design products", "that people love"]}
                  />

                  <p className="mt-4 max-w-[42ch] text-lg text-white/70">
                    I am a designer and full stack developer based in Dubai. I help early‑stage startups ship beautiful, usable
                    software fast.
                  </p>

                  {/* CTAs */}
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Button asChild size="lg" className="rounded-full">
                      <Link href="mailto:abdulrahman@falak.me" target="_blank" rel="noopener noreferrer">
                        Hire me
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  {/* Trusted by */}
                  <div className="mt-10">
                    <p className="mb-3 text-xs font-semibold tracking-widest text-white/50">COMPANIES I'VE WORKED WITH</p>
                    <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-2xl font-black text-white/25 sm:grid-cols-3">
                      <li>Falak.me</li>
                      <li>Ampiere</li>
                    </ul>
                  </div>
                </div>
              </RevealOnView>
            </aside>

            {/* RIGHT: Work / Blog toggle column */}
            <RightColumn projects={projects} initialPosts={posts} />
          </div>
        </section>
      </main>
    </PageLoader>
  )
}
