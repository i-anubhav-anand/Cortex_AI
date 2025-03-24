"use client"
import { useChat } from "@/hooks/chat"
import { useChatStore } from "../stores"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState, memo } from "react"
import { LoaderIcon, AlertCircle } from "lucide-react"

import { AskInput } from "./ask-input"
import { useChatThread } from "@/hooks/threads"
import MessagesList from "./messages-list"
import { StarterQuestionsList } from "./starter-questions"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Button } from "./ui/button"
import { useConfigOverrides } from "@/lib/config-overrides"

// Memoize the component to prevent unnecessary re-renders
const ChatPanel = memo(({ threadId }: { threadId?: number }) => {
  const searchParams = useSearchParams()
  const queryMessage = searchParams.get("q")
  const hasRun = useRef(false)
  
  // Apply configuration overrides (enables Expert mode by default)
  useConfigOverrides()

  const { handleSend, streamingMessage, isStreamingMessage, isStreamingProSearch } = useChat()
  const { messages, setMessages, setThreadId } = useChatStore()
  const { data: thread, isLoading, error } = useChatThread(threadId)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  // Default to not auto-scrolling so content stays at the top
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false)
  // Track the scroll position for maintaining view
  const [scrollPosition, setScrollPosition] = useState(0)
  // Track content height to maintain relative position
  const [prevContentHeight, setPrevContentHeight] = useState(0)

  // Handle initial query from URL if present
  useEffect(() => {
    if (queryMessage && !hasRun.current) {
      setThreadId(null)
      hasRun.current = true
      handleSend(queryMessage)
      window.dispatchEvent(new CustomEvent("refreshChatHistory"))
    }
  }, [queryMessage, handleSend, setThreadId])

  // Load thread data if threadId is provided
  useEffect(() => {
    if (!thread) return
    setThreadId(thread.thread_id)
    if (thread.messages && thread.messages.length > 0) {
      setMessages(thread.messages)
    }
  }, [threadId, thread, setMessages, setThreadId])

  // Reset threadId if no messages and no threadId
  useEffect(() => {
    if (messages.length === 0 && !threadId) {
      setThreadId(null)
    }
  }, [messages, threadId, setThreadId])

  // Detect user scroll to manage manual scrolling
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      // Store current scroll position
      const { scrollTop } = container;
      setScrollPosition(scrollTop);
      
      // Only enable auto-scroll if user scrolls to bottom
      const { scrollHeight, clientHeight } = container
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 20
      setShouldAutoScroll(isAtBottom)
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  // Maintain scroll position when content changes
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    // Get current content height
    const { scrollHeight } = container
    
    // If we have previous content height and we're not at bottom
    if (prevContentHeight > 0 && !shouldAutoScroll) {
      // Calculate how much content was added
      const contentDiff = scrollHeight - prevContentHeight
      
      // Adjust scroll position to maintain view
      if (contentDiff > 0) {
        container.scrollTop = scrollPosition
      }
    }
    
    // Only auto-scroll if it's explicitly enabled by the user
    if (shouldAutoScroll) {
      container.scrollTop = container.scrollHeight
    }
    
    // Update height for next comparison
    setPrevContentHeight(scrollHeight)
  }, [messages, streamingMessage, shouldAutoScroll, scrollPosition, prevContentHeight])

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Show loading state while fetching thread data
  if (threadId && isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-40">
        <LoaderIcon className="animate-spin w-8 h-8 text-tint" />
      </div>
    )
  }

  // Show error state if thread loading fails
  if (threadId && error) {
    return (
      <Alert className="bg-red-500/5 border-red-500/15 p-5">
        <AlertCircle className="h-4 w-4 stroke-red-500 stroke-2" />
        <div className="ml-2">
          <AlertTitle className="text-red-500 mb-2">Error Loading Conversation</AlertTitle>
          <AlertDescription className="text-base text-foreground">
            {error.message || "Failed to load this conversation. Please try again."}
            <div className="mt-4">
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </AlertDescription>
        </div>
      </Alert>
    )
  }

  return (
    <>
      {messages.length > 0 || threadId ? (
        // Chat view with messages
        <div className="flex flex-col h-full">
          {/* Scrollable messages container */}
          <div
            ref={containerRef}
            className="flex-1 overflow-y-auto pt-16 pb-24 custom-scrollbar scroll-container"
            style={{ height: "calc(100vh - 4rem)" }} // Ensure enough space for scrolling
          >
            <div className="max-w-3xl mx-auto px-4 messages-container">
              <MessagesList
                messages={messages}
                streamingMessage={streamingMessage}
                isStreamingMessage={isStreamingMessage}
                isStreamingProSearch={isStreamingProSearch}
                onRelatedQuestionSelect={handleSend}
              />
            </div>
          </div>

          {/* Floating input at bottom */}
          <div className="fixed bottom-4 left-0 right-0 z-10">
            <div className="max-w-3xl mx-auto px-4">
              <AskInput
                isFollowingUp
                sendMessage={(message) => {
                  handleSend(message)
                  // Don't enable auto-scroll by default to maintain position
                }}
                inputRef={inputRef as React.RefObject<HTMLTextAreaElement>}
              />
            </div>
          </div>
        </div>
      ) : (
        // Empty state
        <div className="flex flex-col justify-center items-center min-h-screen py-8 px-4">
          <div className="flex flex-col items-center justify-center mb-8">
            <h1 className="text-4xl font-bold mb-6">What do you want to know?</h1>
            <div className="w-full max-w-xl">
              <AskInput 
                sendMessage={handleSend} 
                inputRef={inputRef as React.RefObject<HTMLTextAreaElement>} 
              />
            </div>
          </div>
          <div className="w-full max-w-xl">
            <StarterQuestionsList handleSend={handleSend} />
          </div>
        </div>
      )}
    </>
  )
})

ChatPanel.displayName = "ChatPanel"

export { ChatPanel }

