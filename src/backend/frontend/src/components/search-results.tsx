/* eslint-disable @next/next/no-img-element */
"use client"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "./ui/skeleton"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import type { SearchResult } from "../../generated/types.gen" // Import directly from types.gen.ts

export const SearchResultsSkeleton = () => {
  return (
    <>
      <div className="flex flex-wrap w-full">
        {[...Array(4)].map((_, index) => (
          <div className="w-1/2 md:w-1/4 p-1" key={`skeleton-${index}`}>
            <Skeleton className="rounded-md shadow-none border-none h-[70px] bg-card " />
          </div>
        ))}
      </div>
    </>
  )
}

export const Logo = ({ url }: { url: string }) => {
  const [hasError, setHasError] = useState(false)

  if (!url) return null

  try {
    // Make sure the URL is valid
    new URL(url)

    if (hasError) {
      return (
        <div className="rounded-full overflow-hidden relative flex items-center justify-center bg-muted w-4 h-4">
          <span className="text-[8px] text-muted-foreground">URL</span>
        </div>
      )
    }

    return (
      <div className="rounded-full overflow-hidden relative">
        <img
          className="block relative w-4 h-4"
          src={`https://www.google.com/s2/favicons?sz=128&domain=${url}`}
          alt="favicon"
          width={16}
          height={16}
          onError={(e) => {
            setHasError(true)
          }}
        />
      </div>
    )
  } catch (error) {
    console.error("Invalid URL in Logo component:", url)
    return (
      <div className="rounded-full overflow-hidden relative flex items-center justify-center bg-muted w-4 h-4">
        <span className="text-[8px] text-muted-foreground">URL</span>
      </div>
    )
  }
}

export function SearchResults({ results }: { results: SearchResult[] }) {
  const [showAll, setShowAll] = useState(false)

  if (!results || results.length === 0) {
    return <SearchResultsSkeleton />
  }

  const displayedResults = showAll ? results : results.slice(0, 3)
  const additionalCount = results.length > 3 ? results.length - 3 : 0
  const additionalResults = results.slice(3, 3 + additionalCount)

  return (
    <div className="flex flex-wrap w-full ">
      {displayedResults.map(({ title, url, content }, index) => {
        if (!url) return null

        let formattedUrl = "website"
        try {
          const urlObj = new URL(url)
          formattedUrl = urlObj.hostname.split(".").slice(-2, -1)[0] || urlObj.hostname
        } catch (error) {
          console.error("Error parsing URL:", url, error)
        }

        return (
          <HoverCard key={`source-${index}`}>
            <HoverCardTrigger asChild>
              <div className="w-1/2 md:w-1/4 p-1">
                <a
                  className=""
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View source: ${title}`}
                >
                  <Card className="flex-1 rounded-md flex-col shadow-none border-none h-[70px]">
                    <CardContent className="p-2 flex flex-col justify-between h-full">
                      <p className="text-xs line-clamp-2 font-medium text-foreground/80">{title}</p>
                      <div className="flex space-x-1">
                        <div className="flex items-center space-x-2">
                          <div className="rounded-full overflow-hidden relative">
                            <Logo url={url} />
                          </div>
                          <div className="text-xs text-muted-foreground truncate font-medium">{formattedUrl}</div>
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">·</div>
                        <div className="text-xs text-muted-foreground truncate font-medium">{index + 1}</div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 py-2">
              <div className="flex justify-between space-x-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="rounded-full overflow-hidden relative">
                      <Logo url={url} />
                    </div>
                    <div className="text-xs text-muted-foreground truncate font-medium">{formattedUrl}</div>
                  </div>
                  <p className="text-sm font-medium">{title}</p>
                  <span className="text-sm line-clamp-3 font-light text-foreground/90">{content}</span>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        )
      })}
      {!showAll && additionalCount > 0 && (
        <div
          className="cursor-pointer
        w-1/2 md:w-1/4  p-1"
          onClick={() => setShowAll(true)}
        >
          <Card className="flex-1 rounded-md flex-col shadow-none border-none h-[70px]">
            <CardContent className="p-2 flex flex-col justify-between h-full">
              <div className="flex items-center space-x-2">
                {additionalResults.map(({ url }, index) => {
                  if (!url) return null
                  return <Logo url={url} key={`logo-${index}`} />
                })}
              </div>
              <div className="text-xs text-muted-foreground truncate font-medium">View {additionalCount} more</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

