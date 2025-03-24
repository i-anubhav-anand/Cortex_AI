import { AssistantMessageContent } from "./assistant-message"
import { Separator } from "./ui/separator"
import { UserMessageContent } from "./user-message"
import { memo } from "react"
import { type ChatMessage, MessageRole } from "../../generated/types.gen"
import { ProSearchRender } from "./pro-search-render"

const MessagesList = memo(
  ({
    messages,
    streamingMessage,
    isStreamingMessage,
    isStreamingProSearch,
    onRelatedQuestionSelect,
  }: {
    messages: ChatMessage[]
    streamingMessage: ChatMessage | null
    isStreamingMessage: boolean
    isStreamingProSearch: boolean
    onRelatedQuestionSelect: (question: string) => void
  }) => {
    if (!messages || !Array.isArray(messages)) {
      console.warn("Messages is not an array:", messages)
      return null
    }

    return (
      <div className="flex flex-col w-full messages-container custom-scrollbar scroll-container">
        {messages.map((message, index) => {
          if (!message) {
            console.warn("Null message at index", index)
            return null
          }

          const isLast = index === messages.length - 1
          const messageContent = (
            <div key={`message-${index}-${message.role}`} className="message-item">
              {message.role === MessageRole.USER ? (
                <UserMessageContent message={message} />
              ) : (
                <AssistantMessageContent 
                  message={message} 
                  onRelatedQuestionSelect={onRelatedQuestionSelect}
                />
              )}
              {!isLast && <Separator className="my-6" />}
            </div>
          )

          return messageContent
        })}

        {isStreamingMessage && streamingMessage && (
          <div key="streaming" className="message-item">
            {streamingMessage.role === MessageRole.USER ? (
              <UserMessageContent message={streamingMessage} />
            ) : (
              <>
                {isStreamingProSearch && streamingMessage.agent_response ? (
                  <ProSearchRender 
                    streamingProResponse={streamingMessage.agent_response} 
                    isStreamingProSearch={isStreamingProSearch}
                  />
                ) : (
                  <AssistantMessageContent 
                    message={streamingMessage} 
                    isStreaming={true}
                    onRelatedQuestionSelect={onRelatedQuestionSelect}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    )
  },
)

MessagesList.displayName = "MessagesList"

export default MessagesList

