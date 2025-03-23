"use client"

import type React from "react"
import { type FC, memo, useEffect, useState } from "react"
import { MemoizedReactMarkdown } from "./markdown"
import rehypeRaw from "rehype-raw"
import { Skeleton } from "./ui/skeleton"
import type { ChatMessage } from "../../generated/types.gen"

export interface MessageProps {
  message: ChatMessage
  isStreaming?: boolean
}

// Improve type safety for the citation function
const CitationText = ({ number, href }: { number: number; href: string }): string => {
  return `
  <button className="select-none no-underline">
  <a className="" href="${href}" target="_blank" rel="noopener noreferrer">
        <span className="relative -top-[0rem] inline-flex">
          <span className="h-[1rem] min-w-[1rem] items-center justify-center rounded-full text-center px-1 text-xs font-mono bg-muted text-[0.60rem] text-muted-foreground">
            ${number}
          </span>
        </span>
      </a>
    </button>`
}

// Simple components that don't try to animate individual words
const Paragraph = memo(({ children, ...props }: React.HTMLProps<HTMLParagraphElement>) => {
  return <p {...props}>{children}</p>
})

const ListItem = memo(({ children, ...props }: React.HTMLProps<HTMLLIElement>) => {
  return <li {...props}>{children}</li>
})

Paragraph.displayName = "Paragraph"
ListItem.displayName = "ListItem"

// Add a function to sanitize the content by removing <think> tags
function sanitizeModelContent(content: string): string {
  // Remove <think> tags and their content
  return (
    content
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      // Also handle self-closing <think /> tags if they exist
      .replace(/<think\s*\/>/g, "")
      // Handle any remaining opening or closing tags
      .replace(/<\/?think[^>]*>/g, "")
  )
}

export const MessageComponent: FC<MessageProps> = ({ message, isStreaming = false }) => {
  const { content, sources } = message
  const [parsedMessage, setParsedMessage] = useState<string>(content)

  useEffect(() => {
    const sanitizedContent = sanitizeModelContent(content)
    const citationRegex = /(\[\d+\])/g
    const newMessage = sanitizedContent.replace(citationRegex, (match) => {
      const number = match.slice(1, -1)
      const source = sources?.find((source, idx) => idx + 1 === Number.parseInt(number))
      return CitationText({
        number: Number.parseInt(number),
        href: source?.url ?? "",
      })
    })
    setParsedMessage(newMessage)
  }, [content, sources])

  return (
    <div className={isStreaming ? "animate-pulse" : ""}>
      <MemoizedReactMarkdown
        components={{
          p: Paragraph,
          li: ListItem,
        }}
        className="prose dark:prose-invert inline leading-relaxed break-words"
        rehypePlugins={[rehypeRaw]}
      >
        {parsedMessage}
      </MemoizedReactMarkdown>
    </div>
  )
}

export const MessageComponentSkeleton = () => {
  return (
    <>
      <Skeleton className="w-full py-4 bg-card">
        <div className="flex flex-col gap-4">
          <Skeleton className="mx-5 h-2 bg-primary/30" />
          <Skeleton className="mx-5 h-2 bg-primary/30 mr-20" />
          <Skeleton className="mx-5 h-2 bg-primary/30 mr-40" />
        </div>
      </Skeleton>
    </>
  )
}

