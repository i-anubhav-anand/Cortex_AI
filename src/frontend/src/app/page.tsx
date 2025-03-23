import { ChatPanel } from "@/components/chat-panel"
import { Suspense } from "react"

export default function Home() {
  return (
    <div className="h-full w-full">
      <Suspense>
        <ChatPanel />
      </Suspense>
    </div>
  )
}

