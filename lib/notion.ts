import { Client } from "@notionhq/client"
import { NotionToMarkdown } from "notion-to-md"
import { marked } from "marked"

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const n2m = new NotionToMarkdown({ notionClient: notion })

n2m.setCustomTransformer("column_list", async (block) => {
  const results = await n2m.pageToMarkdown(block.id)
  const children = results.map((r) => r.parent).join("")
  return `<div class="notion-column-list flex flex-col md:flex-row gap-6 my-4 w-full">\n${children}\n</div>`
})

n2m.setCustomTransformer("column", async (block) => {
  const results = await n2m.pageToMarkdown(block.id)
  // Convert child markdown to HTML so it renders inside the HTML wrapper
  const childrenMd = n2m.toMarkdownString(results).parent
  const childrenHtml = await marked.parse(childrenMd)
  return `<div class="notion-column flex-1 min-w-0 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">\n${childrenHtml}\n</div>`
})

const BlogdatabaseId = process.env.BLOG_DATABASE_ID!
const WorkDatabaseId =
  process.env.WORK_DATABASE ?? process.env.WORK_DATABASE_ID!
const ResumePageId = process.env.RESUME_PAGE_ID!

export interface BlogPost {
  id: string
  title: string
  slug: string
  date: string
  tags: string[]
  coverImage: string | null
  summary: string | null
  readTime: string | null
}

export interface WorkItem {
  id: string
  title: string
  subtitle: string | null
  tags: string[]
  slug: string
  image: string | null
}

const getFilePropertyUrl = (property: any): string | null => {
  const fileItem = property?.files?.[0]
  return fileItem?.external?.url ?? fileItem?.file?.url ?? null
}

const getCoverImageUrl = (page: any): string | null => {
  const properties = page?.properties
  return (
    getFilePropertyUrl(properties?.coverImage) ??
    getFilePropertyUrl(properties?.CoverImage) ??
    getFilePropertyUrl(properties?.Cover) ??
    getFilePropertyUrl(properties?.CoverImageUrl) ??
    page?.cover?.external?.url ??
    page?.cover?.file?.url ??
    null
  )
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const response = await notion.databases.query({
    database_id: BlogdatabaseId,
    filter: {
      property: "Status",
      status: {
        equals: "Published",
      },
    },
    sorts: [
      {
        property: "Date",
        direction: "descending",
      },
    ],
  })

  return response.results.map((page: any) => {
    const properties = page.properties

    const title =
      properties.Name?.title?.[0]?.plain_text ??
      properties.Title?.title?.[0]?.plain_text ??
      "Untitled"

    const slug =
      properties.Slug?.rich_text?.[0]?.plain_text ??
      page.id

    const date =
      properties.Date?.date?.start ?? page.created_time

    const tags =
      properties.Tags?.multi_select?.map((t: any) => t.name) ?? []

    const coverImage = getCoverImageUrl(page)

    const summary =
      properties.Summary?.rich_text?.[0]?.plain_text ?? null

    const readTime =
      properties.ReadTime?.rich_text?.[0]?.plain_text ?? null

    return { id: page.id, title, slug, date, tags, coverImage, summary, readTime }
  })
}

export async function getPostBySlug(
  slug: string
): Promise<{ meta: BlogPost; markdown: string } | null> {
  const response = await notion.databases.query({
    database_id: BlogdatabaseId,
    filter: {
      and: [
        {
          property: "Status",
          status: { equals: "Published" },
        },
        {
          property: "Slug",
          rich_text: { equals: slug },
        },
      ],
    },
  })

  const page = response.results[0] as any
  if (!page) return null

  const properties = page.properties

  const meta: BlogPost = {
    id: page.id,
    title:
      properties.Name?.title?.[0]?.plain_text ??
      properties.Title?.title?.[0]?.plain_text ??
      "Untitled",
    slug,
    date: properties.Date?.date?.start ?? page.created_time,
    tags: properties.Tags?.multi_select?.map((t: any) => t.name) ?? [],
    coverImage: getCoverImageUrl(page),
    summary: properties.Summary?.rich_text?.[0]?.plain_text ?? null,
    readTime: properties.ReadTime?.rich_text?.[0]?.plain_text ?? null,
  }

  const mdBlocks = await n2m.pageToMarkdown(page.id)
  const markdown = n2m.toMarkdownString(mdBlocks).parent

  return { meta, markdown }
}

export async function getWorkItems(): Promise<WorkItem[]> {
  const response = await notion.databases.query({
    database_id: WorkDatabaseId,
  })

  return response.results.map((page: any) => {
    const properties = page.properties

    const title =
      properties.Title?.title?.[0]?.plain_text ??
      properties.Name?.title?.[0]?.plain_text ??
      "Untitled"

    const subtitle =
      properties.Subtitle?.rich_text?.[0]?.plain_text ?? null

    const tags =
      properties.Tags?.multi_select?.map((t: any) => t.name) ?? []

    const slug =
      properties.Slug?.rich_text?.[0]?.plain_text ??
      page.id

    const image =
      getFilePropertyUrl(properties.Image) ??
      getFilePropertyUrl(properties.Cover) ??
      page?.cover?.external?.url ??
      page?.cover?.file?.url ??
      null

    return { id: page.id, title, subtitle, tags, slug, image }
  })
}

export async function getWorkBySlug(
  slug: string
): Promise<{ meta: WorkItem; markdown: string } | null> {
  const response = await notion.databases.query({
    database_id: WorkDatabaseId,
    filter: {
      property: "Slug",
      rich_text: { equals: slug },
    },
  })

  const page = response.results[0] as any
  if (!page) return null

  const properties = page.properties

  const meta: WorkItem = {
    id: page.id,
    title:
      properties.Title?.title?.[0]?.plain_text ??
      properties.Name?.title?.[0]?.plain_text ??
      "Untitled",
    subtitle: properties.Subtitle?.rich_text?.[0]?.plain_text ?? null,
    tags: properties.Tags?.multi_select?.map((t: any) => t.name) ?? [],
    slug,
    image:
      getFilePropertyUrl(properties.Image) ??
      getFilePropertyUrl(properties.Cover) ??
      page?.cover?.external?.url ??
      page?.cover?.file?.url ??
      null,
  }

  const mdBlocks = await n2m.pageToMarkdown(page.id)
  const markdown = n2m.toMarkdownString(mdBlocks).parent

  return { meta, markdown }
}

export async function getResumePage(): Promise<{
  title: string
  markdown: string
}> {
  const page = (await notion.pages.retrieve({
    page_id: ResumePageId,
  })) as any

  const properties = page?.properties
  const title =
    properties?.Name?.title?.[0]?.plain_text ??
    properties?.Title?.title?.[0]?.plain_text ??
    "Resume"

  const mdBlocks = await n2m.pageToMarkdown(ResumePageId)
  const markdown = n2m.toMarkdownString(mdBlocks).parent

  return { title, markdown }
}
