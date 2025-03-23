"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChatModel } from "../types/models"
import { isCloudModel, isLocalModel } from "@/lib/utils"
import { ModelLogo } from "./model-logo"

// Helper function to get provider name from model description
function getProviderFromDescription(description: string): string {
  // Extract the provider from format like "OpenAI/GPT-4o" or "ollama/llama3.1"
  const parts = description.split('/')
  if (parts.length >= 2) {
    return parts[0]
  }
  return ""
}

interface ModelCardProps {
  model: ChatModel
  name: string
  description: string
  isSelected?: boolean
  onClick?: () => void
}

export function ModelCard({ model, name, description, isSelected, onClick }: ModelCardProps) {
  const isCloud = isCloudModel(model)
  const isLocal = isLocalModel(model)
  const provider = getProviderFromDescription(description)
  
  return (
    <Card 
      className={`w-full transition-all hover:shadow-md cursor-pointer ${
        isSelected ? 'border-primary/50 bg-primary/5' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <ModelLogo model={model} size={36} />
          </div>
          <div>
            <CardTitle className="text-md mb-1">{name}</CardTitle>
            <Badge variant={isCloud ? "default" : "outline"} className="mb-1">
              {isCloud ? "Cloud" : "Local"}
            </Badge>
            {provider && (
              <div className="text-xs text-muted-foreground mt-1">
                Provider: {provider}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

export function ModelCardGrid({ models, selectedModel, onSelect }: {
  models: Array<{ model: ChatModel, name: string, description: string }>
  selectedModel?: ChatModel
  onSelect?: (model: ChatModel) => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {models.map((item) => (
        <ModelCard
          key={item.model}
          model={item.model}
          name={item.name}
          description={item.description}
          isSelected={selectedModel === item.model}
          onClick={() => onSelect?.(item.model)}
        />
      ))}
    </div>
  )
} 