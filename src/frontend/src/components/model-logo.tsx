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
  const isDark = theme === "dark"
  
  // Get the appropriate logo based on model type
  const getLogoSrc = () => {
    // Match specific model to its logo - using files that definitely exist in public
    switch(model) {
      case ChatModel.LLAMA3:
      case ChatModel.LLAMA_3_70B:
        return "/llama.webp";
      case ChatModel.GPT_4O:
      case ChatModel.GPT_4O_MINI:
        // Use green logo for dark mode, regular logo for light mode
        return isDark ? "/ChatGPT-Logo-PNG-Green-Color-Design-1.png" : "/ChatGPT-Logo.svg.png";
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
        return isDark ? "/logo-white.png" : "/logo-black.png";
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