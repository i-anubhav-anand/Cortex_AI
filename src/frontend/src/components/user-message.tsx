import type { ChatMessage } from "../../generated/types.gen" // Import directly from types.gen.ts

export const UserMessageContent = ({ message }: { message: ChatMessage }) => {
  return (
    <div className="my-4">
      <span className="text-3xl">{message.content}</span>
    </div>
  )
}

