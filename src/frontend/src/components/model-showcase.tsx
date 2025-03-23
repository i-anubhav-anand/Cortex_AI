"use client"

import { useState } from "react"
import { ChatModel } from "../types/models"
import { isCloudModel, isLocalModel } from "@/lib/utils"
import { ModelCardGrid } from "./model-card"
import { modelMap } from "./model-selection"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ModelShowcase() {
  const [selectedModel, setSelectedModel] = useState<ChatModel>(ChatModel.GPT_4O_MINI)
  const [filterType, setFilterType] = useState<"all" | "cloud" | "local">("all")
  
  // Convert model map to array for display
  const allModels = Object.entries(modelMap).map(([key, value]) => ({
    model: key as ChatModel,
    name: value.name,
    description: value.description
  }))
  
  // Filter models based on selected type
  const filteredModels = allModels.filter(item => {
    if (filterType === "all") return true
    if (filterType === "cloud") return isCloudModel(item.model)
    if (filterType === "local") return isLocalModel(item.model)
    return true
  })
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Available Models</h2>
      
      <Tabs defaultValue="all" onValueChange={(value) => setFilterType(value as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Models</TabsTrigger>
          <TabsTrigger value="cloud">
            <div className="flex items-center gap-1">
              <img src="/logo-black.png" alt="Cloud" className="w-4 h-4" />
              Cloud Models
            </div>
          </TabsTrigger>
          <TabsTrigger value="local">
            <div className="flex items-center gap-1">
              <img src="/logo.png" alt="Local" className="w-4 h-4" />
              Local Models
            </div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <ModelCardGrid 
            models={filteredModels} 
            selectedModel={selectedModel}
            onSelect={setSelectedModel}
          />
        </TabsContent>
        
        <TabsContent value="cloud" className="mt-0">
          <ModelCardGrid 
            models={filteredModels} 
            selectedModel={selectedModel}
            onSelect={setSelectedModel}
          />
        </TabsContent>
        
        <TabsContent value="local" className="mt-0">
          <ModelCardGrid 
            models={filteredModels} 
            selectedModel={selectedModel}
            onSelect={setSelectedModel}
          />
        </TabsContent>
      </Tabs>
      
      {selectedModel && (
        <div className="p-4 bg-muted rounded-lg mt-6">
          <p className="font-bold">Selected Model: {modelMap[selectedModel]?.name}</p>
          <p className="text-sm text-muted-foreground">
            {isCloudModel(selectedModel) ? "Cloud Model" : "Local Model"} - {modelMap[selectedModel]?.description}
          </p>
        </div>
      )}
    </div>
  )
} 