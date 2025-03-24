"use client"

import React from "react"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { CameraIcon, ListPlusIcon, SparkleIcon, StarIcon, TextSearchIcon } from "lucide-react"

import { motion } from "framer-motion"

export const Section = ({
  title,
  children,
  animate = true,
  streaming = false,
}: {
  title: "Sources" | "Answer" | "Related" | "Images"
  children: ReactNode
  animate?: boolean
  streaming?: boolean
}) => {
  const iconMap = {
    Sources: TextSearchIcon,
    Answer: SparkleIcon,
    Related: ListPlusIcon,
    Images: CameraIcon,
  }

  const IconComponent = iconMap[title] || StarIcon

  return (
    <div className={cn("flex flex-col mb-8", animate ? "animate-in fade-in duration-1000 ease-out" : "")}>
      <div className="flex items-center space-x-2">
        {title === "Answer" && streaming ? (
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "linear" }}
          >
            <IconComponent size={22} className="text-tint" />
          </motion.div>
        ) : (
          <IconComponent size={22} className={title === "Answer" ? "text-tint" : ""} />
        )}
        <div className="text-lg font-medium">{title}</div>
      </div>
      <div className="pt-1">
        {title === "Images"
          ? React.Children.map(children, (child, index) => {
              // Only render the first 4 images
              if (index < 4) return child
              return null
            })
          : children}
      </div>
    </div>
  )
}

