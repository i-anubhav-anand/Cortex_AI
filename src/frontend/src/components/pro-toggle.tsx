"use client"

import { useCallback, useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { useConfigStore } from "@/stores"
import { cn } from "@/lib/utils"

// Inline useIsClient hook to avoid import issues
function useIsClient() {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  return isClient
}

export function ProToggle({ className }: { className?: string }) {
  const { proMode, toggleProMode } = useConfigStore()
  const isClient = useIsClient()

  const handleToggle = useCallback(() => {
    console.log("Toggle Expert mode from:", proMode, "to:", !proMode);
    toggleProMode()
  }, [proMode, toggleProMode])

  if (!isClient) {
    // Server-side or during hydration, return a placeholder
    return (
      <div className="flex items-center space-x-2">
        <div className="text-sm font-medium mr-1">Expert</div>
        <div className="w-9 h-5 rounded-full bg-gray-200" />
      </div>
    )
  }

  // Return a simplified toggle to match the UI in the screenshot
  return (
    <div className="flex items-center space-x-2">
      <div className="text-sm font-medium mr-1">Expert</div>
      <Switch
        id="expert-mode"
        checked={proMode}
        onCheckedChange={handleToggle}
        className={cn(
          "data-[state=checked]:bg-purple-600",
          proMode ? "bg-purple-600" : "bg-gray-200" 
        )}
      />
    </div>
  )
}

