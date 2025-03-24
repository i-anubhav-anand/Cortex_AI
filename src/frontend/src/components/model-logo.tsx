"use client"

import { useTheme } from "next-themes"
import { ChatModel } from "../types/models"
import { isCloudModel } from "@/lib/utils"
import { useEffect, useState } from "react"

interface ModelLogoProps {
  model: ChatModel
  size?: number
  className?: string
}

export function ModelLogo({ model, size = 24, className = "" }: ModelLogoProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Ensure we only use client-side theme after mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Default to dark theme for server-side rendering to ensure consistency
  const isDark = mounted ? theme === "dark" : true
  
  // Get the appropriate logo based on model type
  const getLogoSrc = () => {
    // Match specific model to its logo - using files that definitely exist in public
    switch(model) {
      case ChatModel.LLAMA3:
      case ChatModel.LLAMA_3_70B:
        return "/llama.webp";
      case ChatModel.GPT_4O:
      case ChatModel.GPT_4O_MINI:
        // Always use the green logo version for consistency between client and server
        return "/ChatGPT-Logo-PNG-Green-Color-Design-1.png";
      case ChatModel.PHI3_14B:
        return "/phi3.png";
      case ChatModel.GEMMA:
        return "/gemma-logo-png_seeklogo-611606.png";
      case ChatModel.DEEPSEEK_R1:
        return "/deepseek.png";
      case ChatModel.MISTRAL:
        return "/announcing-mistral.png";
      case ChatModel.CUSTOM:
        return "/setting.png";
      default:
        // Fallback to existing logos
        return "/logo-white.png";
    }
  }
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`Failed to load image for ${model}`)
    // Fallback to a simple icon from public directory
    e.currentTarget.src = "/placeholder-logo.png";
  }
  
  return (
    <div 
      className={`relative overflow-hidden rounded-full ${className}`} 
      style={{ width: size, height: size }}
    >
      <img
        src={getLogoSrc()}
        alt={`${model} logo`}
        className="object-cover h-full w-full"
        width={size}
        height={size}
        onError={handleImageError}
      />
    </div>
  )
} 