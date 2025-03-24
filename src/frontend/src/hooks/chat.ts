"use client"

import { useMutation } from "@tanstack/react-query"
import {
  type AgentQueryPlanStream,
  type AgentReadResultsStream,
  type AgentSearchQueriesStream,
  AgentSearchStepStatus,
  type ChatMessage,
  type ChatRequest,
  type ChatResponseEvent,
  type ErrorStream,
  type Message,
  MessageRole,
  type RelatedQueriesStream,
  type SearchResultStream,
  type StreamEndStream,
  StreamEvent,
  type TextChunkStream,
} from "../../generated/types.gen"
import { useState, useRef, useCallback, useEffect } from "react"
import { useConfigStore, useChatStore } from "@/stores"
import { env } from "@/env"
import { getApiUrl } from "@/lib/utils"
import { getApiBaseUrl, getApiUrl as getApiUrlFromUtils } from "@/lib/api-url"

// For all API requests, use Next.js API routes to avoid CORS issues
const CHAT_API_URL = "/api/chat"

// Increased timeout duration (2 minutes)
const REQUEST_TIMEOUT = 120000

const convertToChatRequest = (query: string, history: ChatMessage[]): ChatRequest => {
  const newHistory: Message[] = history.map((message) => ({
    role: message.role === MessageRole.USER ? MessageRole.USER : MessageRole.ASSISTANT,
    content: message.content,
  }))
  return { query, history: newHistory }
}

export const useChat = () => {
  const { addMessage, messages, threadId, setThreadId } = useChatStore()
  const { model, proMode } = useConfigStore()

  const [streamingMessage, setStreamingMessage] = useState<ChatMessage | null>(null)
  const [isStreamingProSearch, setIsStreamingProSearch] = useState(false)
  const [isStreamingMessage, setIsStreamingMessage] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const xhrRef = useRef<XMLHttpRequest | null>(null)

  // Use a cleanup function to ensure resources are properly released
  useEffect(() => {
    return () => {
      // Clean up resources when component unmounts
      if (xhrRef.current) {
        xhrRef.current.abort()
        xhrRef.current = null
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
    }
  }, [])

  // Use a ref to store the current state between events
  const stateRef = useRef<ChatMessage>({
    role: MessageRole.ASSISTANT,
    content: "",
    sources: [],
    related_queries: [],
    images: [],
    agent_response: null,
  })

  const handleEvent = useCallback(
    (eventData: string) => {
      try {
        // Sanitize the input data before parsing
        // This helps with potentially malformed JSON coming from the server
        const sanitizedData = eventData.trim();
        
        // Skip empty data chunks
        if (!sanitizedData) return;
        
        // Try to parse the JSON with additional error handling
        let eventItem: ChatResponseEvent;
        try {
          eventItem = JSON.parse(sanitizedData);
        } catch (parseError) {
          console.error("Error parsing event data:", parseError);
          console.log("Problematic data:", sanitizedData.substring(0, 100) + (sanitizedData.length > 100 ? "..." : ""));
          return; // Skip this event if it can't be parsed
        }
        
        const state = stateRef.current

        switch (eventItem.event) {
          case StreamEvent.BEGIN_STREAM:
            // Reset state for new message
            state.content = ""
            state.sources = []
            state.related_queries = []
            state.images = []
            state.agent_response = null

            setIsStreamingMessage(true)
            setStreamingMessage({
              role: MessageRole.ASSISTANT,
              content: "",
              related_queries: [],
              sources: [],
              images: [],
              agent_response: null,
            })
            break

          case StreamEvent.SEARCH_RESULTS:
            const data = eventItem.data as SearchResultStream
            state.sources = data.results ?? []
            state.images = data.images ?? []
            break

          case StreamEvent.TEXT_CHUNK:
            // Simply append the text chunk without any processing
            state.content += (eventItem.data as TextChunkStream).text
            break

          case StreamEvent.RELATED_QUERIES:
            state.related_queries = (eventItem.data as RelatedQueriesStream).related_queries ?? []
            break

          case StreamEvent.STREAM_END:
            const endData = eventItem.data as StreamEndStream

            // Add the final message - ensure agent_response is included
            addMessage({
              role: MessageRole.ASSISTANT,
              content: state.content,
              related_queries: state.related_queries,
              sources: state.sources,
              images: state.images,
              agent_response: state.agent_response, // Make sure this is preserved
            })

            // Reset streaming state
            setStreamingMessage(null)
            setIsStreamingMessage(false)
            setIsStreamingProSearch(false)

            // Only if the backend is using the DB
            if (endData.thread_id) {
              setThreadId(endData.thread_id)
              window.history.pushState({}, "", `/search/${endData.thread_id}`)

              // Refresh chat history after a new thread is created
              // Use a small delay to ensure the backend has completed processing
              setTimeout(() => {
                // Use a custom event to trigger history refresh
                window.dispatchEvent(new CustomEvent("refreshChatHistory"))
              }, 500)
            }
            return

          case StreamEvent.AGENT_QUERY_PLAN:
            const { steps } = eventItem.data as AgentQueryPlanStream

            if (!steps || steps.length === 0) {
              console.warn("No steps in AGENT_QUERY_PLAN")
              return
            }

            const newStepsDetails = steps.map((step, index) => ({
              step: step,
              queries: [],
              results: [],
              status: index === 0 ? AgentSearchStepStatus.CURRENT : AgentSearchStepStatus.DEFAULT,
              step_number: index,
            }))

            state.agent_response = {
              steps: steps,
              steps_details: newStepsDetails,
            }

            setIsStreamingProSearch(true)
            break

          case StreamEvent.AGENT_SEARCH_QUERIES:
            const { queries, step_number: queryStepNumber } = eventItem.data as AgentSearchQueriesStream

            if (state.agent_response && state.agent_response.steps_details) {
              const updatedSteps = [...state.agent_response.steps_details]

              // Update the current step with queries
              if (updatedSteps[queryStepNumber]) {
                updatedSteps[queryStepNumber].queries = queries || []
                updatedSteps[queryStepNumber].status = AgentSearchStepStatus.CURRENT

                // Mark previous step as done if this isn't the first step
                if (queryStepNumber > 0) {
                  updatedSteps[queryStepNumber - 1].status = AgentSearchStepStatus.DONE
                }
              }

              state.agent_response = {
                steps: updatedSteps.map((step) => step.step),
                steps_details: updatedSteps,
              }
            }
            break

          case StreamEvent.AGENT_READ_RESULTS:
            const { results, step_number: resultsStepNumber } = eventItem.data as AgentReadResultsStream

            if (state.agent_response && state.agent_response.steps_details) {
              const updatedSteps = [...state.agent_response.steps_details]

              if (updatedSteps[resultsStepNumber]) {
                updatedSteps[resultsStepNumber].results = results || []
              }

              state.agent_response = {
                steps: updatedSteps.map((step) => step.step),
                steps_details: updatedSteps,
              }
            }
            break

          case StreamEvent.AGENT_FINISH:
            if (state.agent_response && state.agent_response.steps_details) {
              // Mark all steps as done when finished
              const updatedSteps = state.agent_response.steps_details.map((step) => ({
                ...step,
                status: AgentSearchStepStatus.DONE,
              }))

              state.agent_response = {
                steps: updatedSteps.map((step) => step.step),
                steps_details: updatedSteps,
              }
            }
            break

          case StreamEvent.ERROR:
            const errorData = eventItem.data as ErrorStream
            addMessage({
              role: MessageRole.ASSISTANT,
              content: errorData.detail,
              related_queries: [],
              sources: [],
              images: [],
              agent_response: state.agent_response,
              is_error_message: true,
            })

            setStreamingMessage(null)
            setIsStreamingMessage(false)
            setIsStreamingProSearch(false)
            return
        }

        // Update the streaming message with the latest state
        setStreamingMessage({
          role: MessageRole.ASSISTANT,
          content: state.content,
          related_queries: state.related_queries,
          sources: state.sources,
          images: state.images,
          agent_response: state.agent_response,
        })
      } catch (error) {
        console.error("Error parsing event data:", error, eventData)
      }
    },
    [addMessage, setThreadId],
  )

  // Function to process SSE data
  const processSSE = useCallback(
    (data: string) => {
      try {
        // Check if we have a complete data set
        if (!data.includes("data: ")) {
          console.log("Incomplete SSE data received, waiting for more...");
          return;
        }
        
        // Split by newlines and process each line
        const lines = data.split("\n");
        
        // Keep track of current event data
        let currentEvent = "";
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          
          // Skip empty lines
          if (trimmedLine === "") continue;
          
          // If we find a new data line, process any accumulated event data
          if (trimmedLine.startsWith("data: ")) {
            // First process any previous event data
            if (currentEvent) {
              handleEvent(currentEvent);
              currentEvent = ""; // Reset for next event
            }
            
            // Extract the new data portion
            const jsonData = trimmedLine.slice(6).trim(); // Remove "data: " prefix
            
            // Handle empty data lines
            if (!jsonData) continue;
            
            // For simple data lines, process immediately
            if (!jsonData.includes("\n") && !jsonData.includes("\r")) {
              handleEvent(jsonData);
            } else {
              // For multi-line data, accumulate
              currentEvent = jsonData;
            }
          } else if (currentEvent) {
            // Accumulate multi-line data
            currentEvent += "\n" + trimmedLine;
          }
        }
        
        // Process any remaining event data
        if (currentEvent) {
          handleEvent(currentEvent);
        }
      } catch (error) {
        console.error("Error processing SSE data:", error);
      }
    },
    [handleEvent]
  )

  // Function to clean up resources
  const cleanupRequest = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.onreadystatechange = null
      xhrRef.current.onerror = null
      xhrRef.current.ontimeout = null
      xhrRef.current = null
    }

    if (abortControllerRef.current) {
      abortControllerRef.current = null
    }
  }, [])

  const { mutateAsync: chat } = useMutation<void, Error, ChatRequest>({
    retry: false,
    mutationFn: async (request) => {
      // Cancel any ongoing request
      if (xhrRef.current) {
        xhrRef.current.abort()
        xhrRef.current = null
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create a new abort controller
      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      // Reset state for new request
      stateRef.current = {
        role: MessageRole.ASSISTANT,
        content: "",
        sources: [],
        related_queries: [],
        images: [],
        agent_response: null,
      }

      // Add user message to chat
      addMessage({ role: MessageRole.USER, content: request.query })

      // Set streaming state for pro search if enabled
      if (proMode) {
        setIsStreamingProSearch(true)
      }

      const req = {
        ...request,
        thread_id: threadId,
        model,
        pro_search: proMode,
      }

      // For streaming connections, we should prefer direct container networking
      // This will route through Docker's internal network rather than going out to the internet
      console.log("Sending request to:", CHAT_API_URL)
      console.log("Request data:", JSON.stringify(req))

      try {
        // Create a custom EventSource implementation using XMLHttpRequest
        let buffer = ""
        let connected = false
        let receivedData = false
        let retryCount = 0
        const MAX_RETRIES = 3

        const makeRequest = () => {
          return new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhrRef.current = xhr

            // Set up a heartbeat mechanism to keep the connection alive
            let heartbeatInterval: NodeJS.Timeout | null = null

            const startHeartbeat = () => {
              if (heartbeatInterval) clearInterval(heartbeatInterval)
              heartbeatInterval = setInterval(() => {
                if (xhr.readyState === 3 || xhr.readyState === 4) {
                  // Connection is still active, do nothing
                  console.log("Heartbeat: connection active, readyState:", xhr.readyState)
                } else {
                  console.log("Heartbeat check: connection may be stalled, readyState:", xhr.readyState)
                }
              }, 10000) // Check every 10 seconds
            }

            const stopHeartbeat = () => {
              if (heartbeatInterval) {
                clearInterval(heartbeatInterval)
                heartbeatInterval = null
              }
            }

            xhr.onreadystatechange = () => {
              console.log("XHR state changed:", xhr.readyState, "status:", xhr.status)
              
              if (xhr.readyState >= 3) {
                // Get only the new data
                const newData = xhr.responseText.substring(buffer.length)
                console.log("New data received:", newData ? newData.length + " bytes" : "none")
                
                if (newData) {
                  buffer += newData
                  processSSE(newData)
                  connected = true
                  receivedData = true
                }
              }

              if (xhr.readyState === 4) {
                stopHeartbeat()

                if ((xhr.status >= 200 && xhr.status < 300) || receivedData) {
                  console.log("Request completed successfully or received partial data")
                  resolve()
                } else if (xhr.status === 0) {
                  // Status 0 usually means CORS error or network issue
                  console.error("Network error or CORS issue detected (status 0)")

                  if (connected || receivedData) {
                    // If we were connected before, this might be a normal connection close
                    console.log("Connection was established before closing, treating as success")
                    resolve()
                  } else if (retryCount < MAX_RETRIES) {
                    // Retry the request
                    retryCount++
                    console.log(`Retrying request (${retryCount}/${MAX_RETRIES})...`)
                    setTimeout(() => {
                      makeRequest().then(resolve).catch(reject)
                    }, 1000 * retryCount) // Exponential backoff
                  } else {
                    reject(
                      new Error(
                        "Failed to connect to the server after multiple attempts. This might be due to a CORS issue or network problem.",
                      ),
                    )
                  }
                } else {
                  reject(new Error(`HTTP error! Status: ${xhr.status}`))
                }
              }
            }

            xhr.onerror = (error) => {
              console.error("XHR error:", error)
              stopHeartbeat()
              if (retryCount < MAX_RETRIES) {
                retryCount++
                console.log(`Retrying request after error (${retryCount}/${MAX_RETRIES})...`)
                setTimeout(() => {
                  makeRequest().then(resolve).catch(reject)
                }, 1000 * retryCount)
              } else {
                reject(new Error("Request failed after multiple retry attempts"))
              }
            }

            xhr.ontimeout = () => {
              stopHeartbeat()
              console.error("Request timed out")

              if (receivedData) {
                // If we received some data, consider it a partial success
                console.log("Received partial data before timeout, treating as partial success")
                resolve()
              } else if (retryCount < MAX_RETRIES) {
                retryCount++
                console.log(`Retrying request after timeout (${retryCount}/${MAX_RETRIES})...`)
                setTimeout(() => {
                  makeRequest().then(resolve).catch(reject)
                }, 1000 * retryCount)
              } else {
                reject(new Error("Request timed out after multiple retry attempts"))
              }
            }

            // Set debug logging
            console.log("Making request to API:", CHAT_API_URL)
            
            // CRITICAL STREAMING FIX:
            // Use Next.js API routes to handle CORS properly
            xhr.open("POST", CHAT_API_URL, true)
            
            // Enable CORS credentials for streaming
            xhr.withCredentials = true
            
            // Headers for proper SSE support
            xhr.setRequestHeader("Content-Type", "application/json")
            xhr.setRequestHeader("Accept", "text/event-stream")
            xhr.setRequestHeader("Cache-Control", "no-cache")
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest")
            xhr.setRequestHeader("Connection", "keep-alive")
            
            // Extended timeout for streaming connections
            xhr.timeout = REQUEST_TIMEOUT * 2

            // Send request
            xhr.send(JSON.stringify(req))

            // Start heartbeat
            startHeartbeat()

            // Set up abort handling
            signal.addEventListener("abort", () => {
              stopHeartbeat()
              xhr.abort()
              reject(new Error("Request aborted"))
            })
          })
        }

        await makeRequest()
      } catch (error) {
        console.error("Error in chat request:", error)

        // Determine if this is likely a CORS issue or timeout
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        const isCORSError =
          errorMessage.includes("CORS") || (error instanceof Error && error.message.includes("status 0"))
        const isTimeoutError = errorMessage.includes("timeout")

        let userFacingMessage = `Sorry, there was an error connecting to the server: ${errorMessage}. Please check your connection and try again.`

        if (isCORSError) {
          userFacingMessage =
            "Unable to connect to the server due to a cross-origin (CORS) issue. This typically happens when the API server is not running or is not configured to accept requests from this domain."
        } else if (isTimeoutError) {
          userFacingMessage =
            "The server took too long to respond. This might be because the server is busy or your query is complex. Please try again or try a simpler query."
        }

        // Add an error message to the chat
        addMessage({
          role: MessageRole.ASSISTANT,
          content: userFacingMessage,
          related_queries: [],
          sources: [],
          images: [],
          is_error_message: true,
        })

        // Reset streaming states
        setIsStreamingMessage(false)
        setIsStreamingProSearch(false)
        setStreamingMessage(null)

        throw error
      } finally {
        // Clean up resources
        cleanupRequest()
      }
    },
  })

  const handleSend = async (query: string) => {
    try {
      await chat(convertToChatRequest(query, messages))
    } catch (error) {
      console.error("Error in handleSend:", error)

      // Add an error message to the chat if not already added in the mutation
      if (!messages.some((m) => m.is_error_message && m.role === MessageRole.ASSISTANT)) {
        addMessage({
          role: MessageRole.ASSISTANT,
          content: `Sorry, there was an error sending your message: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
          related_queries: [],
          sources: [],
          images: [],
          is_error_message: true,
        })
      }

      // Reset streaming states
      setIsStreamingMessage(false)
      setIsStreamingProSearch(false)
      setStreamingMessage(null)
    }
  }

  return {
    handleSend,
    streamingMessage,
    isStreamingMessage,
    isStreamingProSearch,
  }
}

