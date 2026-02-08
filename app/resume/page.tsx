import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { getResumePage } from "@/lib/notion"

export default async function ResumePage() {
  const { title, markdown } = await getResumePage()

  return (
    <main className="bg-neutral-950 text-white">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pb-16 pt-8 sm:pt-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <header className="space-y-2">
          <h1 className="text-balance text-3xl font-bold text-white sm:text-4xl">
            {title}
          </h1>
          <p className="text-sm text-white/50">
            Updated from Notion
          </p>
        </header>

        <article className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-white/80 prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-code:rounded prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-white/90 prose-pre:border prose-pre:border-white/10 prose-pre:bg-neutral-900 prose-img:rounded-xl prose-blockquote:border-white/20 prose-blockquote:text-white/60">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </article>
      </section>
    </main>
  )
}
