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
      <div className="flex flex-col w-full">
        {messages.map((message, index) => {
          if (!message) {
            console.warn("Null message at index", index)
            return null
          }

          const key = `message-${index}-${message.role}`

          return message.role === MessageRole.USER ? (
            <UserMessageContent key={key} message={message} />
          ) : (
            <div key={key} className="mb-8">
              {/* Always display agent_response (Expert Search) if available */}
              {message.agent_response && <ProSearchRender streamingProResponse={message.agent_response} />}
              <AssistantMessageContent message={message} onRelatedQuestionSelect={onRelatedQuestionSelect} />
              {index !== messages.length - 1 && <Separator className="mt-8" />}
            </div>
          )
        })}

        {/* Show pro search while streaming */}
        {isStreamingProSearch && streamingMessage && streamingMessage.agent_response && (
          <ProSearchRender
            streamingProResponse={streamingMessage.agent_response}
            isStreamingProSearch={isStreamingProSearch}
          />
        )}

        {/* Show streaming message */}
        {streamingMessage && isStreamingMessage && (
          <AssistantMessageContent
            message={streamingMessage}
            isStreaming={true}
            onRelatedQuestionSelect={onRelatedQuestionSelect}
          />
        )}
      </div>
    )
  },
)

MessagesList.displayName = "MessagesList"

export default MessagesList

