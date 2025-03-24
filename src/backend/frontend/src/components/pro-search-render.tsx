"use client"

import { Separator } from "./ui/separator"
import { useState } from "react"
import { type AgentSearchFullResponse, AgentSearchStepStatus, type SearchResult } from "../../generated/types.gen"
import { ChevronDown, SearchIcon, WandSparklesIcon } from "lucide-react"
import { Logo } from "./search-results"
import { cn } from "@/lib/utils"

const SearchQueryItem = ({ query }: { query: string }) => {
  return (
    <div className="flex items-center space-x-2 py-1.5 px-2 rounded-md bg-card/50 text-sm animate-in fade-in-25 duration-300">
      <SearchIcon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-muted-foreground">{query}</span>
    </div>
  )
}

const StepSection = ({
  step,
  queries,
  results,
  status,
  isExpanded,
  onToggle,
  stepNumber,
}: {
  step: string
  queries: string[] | undefined
  results: SearchResult[] | undefined
  status: AgentSearchStepStatus
  isExpanded: boolean
  onToggle: () => void
  stepNumber: number
}) => {
  const isActive = status === AgentSearchStepStatus.CURRENT
  const isDone = status === AgentSearchStepStatus.DONE

  return (
    <div className="flex flex-col space-y-3 w-full">
      <div className="flex items-center justify-between w-full cursor-pointer" onClick={onToggle}>
        <div className="flex items-center">
          <div
            className={cn(
              "flex items-center justify-center rounded-full w-6 h-6 mr-3 flex-shrink-0 transition-colors duration-300",
              isActive
                ? "bg-tint text-primary-foreground"
                : isDone
                  ? "bg-tint/80 text-primary-foreground"
                  : "bg-card text-muted-foreground",
            )}
          >
            {isDone ? "✓" : stepNumber + 1}
          </div>
          <div
            className={cn(
              "text-sm font-medium transition-colors duration-300",
              isActive ? "text-tint" : isDone ? "text-primary" : "text-muted-foreground",
            )}
          >
            {step}
          </div>
        </div>

        <div className="flex items-center">
          {isActive && (
            <div className="text-xs text-tint flex items-center mr-2">
              <span className="mr-2">Searching</span>
              <div className="animate-spin h-3 w-3 border-2 border-tint border-t-transparent rounded-full"></div>
            </div>
          )}

          {isDone && (
            <ChevronDown
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform duration-200",
                isExpanded && "transform rotate-180",
              )}
            />
          )}
        </div>
      </div>

      {/* Always show queries for active steps */}
      {isActive && queries && queries.length > 0 && (
        <div className="flex flex-col space-y-2 pl-9">
          {queries.map((query, index) => (
            <SearchQueryItem key={`query-${index}`} query={query} />
          ))}
        </div>
      )}

      {/* Show queries and results for expanded done steps */}
      {isDone && isExpanded && (
        <div className="flex flex-col space-y-2 pl-9 animate-in fade-in duration-300">
          {queries && queries.length > 0 && (
            <div className="flex flex-col space-y-2">
              {queries.map((query, index) => (
                <SearchQueryItem key={`query-${index}`} query={query} />
              ))}
            </div>
          )}

          {results && results.length > 0 && (
            <div className="pt-2">
              <div className="text-xs text-muted-foreground mb-2">Results</div>
              <div className="flex flex-wrap gap-2">
                {results.map((result, idx) => {
                  if (!result || !result.url) return null

                  try {
                    const url = new URL(result.url)
                    const formattedUrl = url.hostname.split(".").slice(-2, -1)[0] || url.hostname

                    return (
                      <a
                        className="bg-card rounded-full text-muted-foreground pl-2 pr-2 py-1 font-medium flex items-center space-x-1 hover:bg-card/80 transition-colors duration-200 animate-in fade-in"
                        href={result.url}
                        target="_blank"
                        key={`result-${idx}`}
                        rel="noreferrer"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <Logo url={result.url} />
                        <div className="">{formattedUrl}</div>
                      </a>
                    )
                  } catch (error) {
                    console.error("Error parsing URL:", result.url, error)
                    return null
                  }
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const ProSearchSkeleton = () => {
  return (
    <div className="w-full border rounded-lg p-4 mb-4 animate-pulse">
      <div className="flex items-center mb-2">
        <div className="h-5 w-5 mr-2 bg-card rounded-full"></div>
        <div className="h-6 w-40 bg-card rounded-md"></div>
      </div>
      <div className="h-1 w-full bg-card mb-4"></div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start">
            <div className="h-6 w-6 rounded-full bg-card mr-3"></div>
            <div className="flex-1">
              <div className="h-4 w-3/4 bg-card rounded-md mb-2"></div>
              <div className="h-3 w-1/2 bg-card rounded-md"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const ProSearchRender = ({
  streamingProResponse,
  isStreamingProSearch = false,
}: {
  streamingProResponse: AgentSearchFullResponse | null
  isStreamingProSearch?: boolean
}) => {
  const [expandedSteps, setExpandedSteps] = useState<number[]>([])

  // Safety check for null or undefined response
  if (!streamingProResponse) {
    return isStreamingProSearch ? <ProSearchSkeleton /> : null
  }

  // Safety check for missing steps_details
  const stepDetails = streamingProResponse.steps_details || []
  if (stepDetails.length === 0) {
    return isStreamingProSearch ? <ProSearchSkeleton /> : null
  }

  const toggleStep = (index: number) => {
    setExpandedSteps((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  return (
    <div className="w-full border border-border rounded-lg p-4 mb-4 bg-card/10">
      <div className="flex items-center mb-3">
        <WandSparklesIcon className="h-5 w-5 mr-2 text-tint" />
        <h1 className="text-lg font-medium">Expert Search</h1>
      </div>
      <Separator className="mb-4" />

      <div className="flex flex-col space-y-4">
        {stepDetails.map(({ step, queries, results, status, step_number }, index) => {
          if (!step) return null // Skip steps with no content

          const isActive = status === AgentSearchStepStatus.CURRENT
          const isDone = status === AgentSearchStepStatus.DONE
          const isExpanded = expandedSteps.includes(index)

          return (
            <div
              key={`step-${index}`}
              className={cn(
                "flex flex-col space-y-2 rounded-lg transition-all duration-300",
                isActive ? "bg-card/30 p-3" : "p-1",
              )}
            >
              <StepSection
                step={step}
                queries={queries}
                results={results}
                status={status}
                isExpanded={isExpanded}
                onToggle={() => isDone && toggleStep(index)}
                stepNumber={step_number !== undefined ? step_number : index}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

