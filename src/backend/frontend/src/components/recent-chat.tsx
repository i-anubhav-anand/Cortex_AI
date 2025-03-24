import { HourglassIcon } from "lucide-react"
import type { ChatModel, ChatSnapshot } from "../../generated/types.gen"
import Link from "next/link"
import { modelMap } from "./model-selection"
import { formatRelativeTime } from "@/lib/utils"

export default function RecentChat({ id, title, date, preview, model_name }: ChatSnapshot) {
  // Safely format the date with error handling
  const formattedDate = formatRelativeTime(date)

  // Safely get the model with fallback
  const model = (() => {
    try {
      return model_name && model_name in modelMap ? modelMap[model_name as ChatModel] : null
    } catch (error) {
      console.error("Error getting model:", error)
      return null
    }
  })()

  // Safely handle title and preview with fallbacks
  const safeTitle = title || "Untitled Chat"
  const safePreview = preview || "No preview available"

  return (
    <Link
      href={`/search/${id}`}
      className="flex-1 rounded-md flex-col cursor-pointer transition-colors group bg-background no-underline"
    >
      <div className="p-2 flex flex-col justify-between h-full space-y-3">
        <div className="flex flex-col">
          <h1 className="line-clamp-1 text-foreground font-medium group-hover:text-tint group-hover:font-semibold">
            {safeTitle}
          </h1>
          <p className="text-foreground/60 line-clamp-2">{safePreview}</p>
        </div>
        <div className="flex justify-between">
          <div className="flex items-center space-x-1 text-foreground/70">
            <HourglassIcon className="w-3 h-3" />
            <p className="text-xs">{formattedDate}</p>
          </div>
          <div className="flex items-center space-x-2 text-foreground/70">
            {model?.smallIcon}
            <p className="font-semibold text-xs">{model?.name || "Unknown model"}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}

