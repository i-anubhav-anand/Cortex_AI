"use client"
import type * as React from "react"

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LightningBoltIcon } from "@radix-ui/react-icons"
import {
  AtomIcon,
  BrainIcon,
  FlameIcon,
  RabbitIcon,
  SearchIcon,
  SettingsIcon,
  SparklesIcon,
  WandSparklesIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useConfigStore } from "../stores"
import { ChatModel } from "../types/models" // Use local enum
import { isCloudModel, isLocalModel } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModelLogo } from "./model-logo"

import _ from "lodash"
import { env } from "@/env"

type Model = {
  name: string
  description: string
  value: string
  smallIcon: React.ReactNode
  icon: React.ReactNode
}

export const modelMap: Record<ChatModel, Model> = {
  [ChatModel.GPT_4O_MINI]: {
    name: "Fast",
    description: "OpenAI/GPT-4o-mini",
    value: ChatModel.GPT_4O_MINI,
    smallIcon: <RabbitIcon className="w-4 h-4 text-cyan-500" />,
    icon: <RabbitIcon className="w-5 h-5 text-cyan-500" />,
  },
  [ChatModel.GPT_4O]: {
    name: "Powerful",
    description: "OpenAI/GPT-4o",
    value: ChatModel.GPT_4O,
    smallIcon: <BrainIcon className="w-4 h-4 text-pink-500" />,
    icon: <BrainIcon className="w-5 h-5 text-pink-500" />,
  },
  [ChatModel.LLAMA_3_70B]: {
    name: "Hyper",
    description: "Groq/Llama3-70B",
    value: ChatModel.LLAMA_3_70B,
    smallIcon: <LightningBoltIcon className="w-4 h-4 text-yellow-500" />,
    icon: <LightningBoltIcon className="w-5 h-5 text-yellow-500" />,
  },
  [ChatModel.LLAMA3]: {
    name: "Llama3",
    description: "ollama/llama3.1",
    value: ChatModel.LLAMA3,
    smallIcon: <WandSparklesIcon className="w-4 h-4 text-purple-500" />,
    icon: <WandSparklesIcon className="w-5 h-5 text-purple-500" />,
  },
  [ChatModel.GEMMA]: {
    name: "Gemma",
    description: "ollama/gemma",
    value: ChatModel.GEMMA,
    smallIcon: <SparklesIcon className="w-4 h-4 text-[#449DFF]" />,
    icon: <SparklesIcon className="w-5 h-5 text-[#449DFF]" />,
  },
  [ChatModel.MISTRAL]: {
    name: "Mistral",
    description: "ollama/mistral",
    value: ChatModel.MISTRAL,
    smallIcon: <AtomIcon className="w-4 h-4 text-[#FF7000]" />,
    icon: <AtomIcon className="w-5 h-5 text-[#FF7000]" />,
  },
  [ChatModel.PHI3_14B]: {
    name: "Phi3",
    description: "ollama/phi3:14b",
    value: ChatModel.PHI3_14B,
    smallIcon: <FlameIcon className="w-4 h-4 text-green-500" />,
    icon: <FlameIcon className="w-5 h-5 text-green-500" />,
  },
  [ChatModel.DEEPSEEK_R1]: {
    name: "DeepSeek",
    description: "ollama/deepseek-r1",
    value: ChatModel.DEEPSEEK_R1,
    smallIcon: <SearchIcon className="w-4 h-4 text-blue-500" />,
    icon: <SearchIcon className="w-5 h-5 text-blue-500" />,
  },
  [ChatModel.CUSTOM]: {
    name: "Custom",
    description: "Custom model",
    value: ChatModel.CUSTOM,
    smallIcon: <SettingsIcon className="w-4 h-4 text-red-500" />,
    icon: <SettingsIcon className="w-5 h-5 text-red-500" />,
  },
}

const localModelMap: Partial<Record<ChatModel, Model>> = _.pickBy(modelMap, (_, key) => isLocalModel(key as ChatModel))

const cloudModelMap: Partial<Record<ChatModel, Model>> = _.pickBy(modelMap, (_, key) => isCloudModel(key as ChatModel))

const ModelItem: React.FC<{ model: Model }> = ({ model }) => {
  const modelType = model.value as ChatModel;
  const { theme } = useTheme();
  const isDark = theme === "dark";
  let logoSrc = "";
  
  // Choose logo based on model type
  switch(modelType) {
    case ChatModel.LLAMA3:
    case ChatModel.LLAMA_3_70B:
      logoSrc = "/llama.webp";
      break;
    case ChatModel.GPT_4O:
    case ChatModel.GPT_4O_MINI:
      logoSrc = isDark ? "/ChatGPT-Logo-PNG-Green-Color-Design-1.png" : "/ChatGPT-Logo.svg.png";
      break;
    case ChatModel.PHI3_14B:
      logoSrc = "/phi3.png";
      break;
    case ChatModel.GEMMA:
      logoSrc = "/gemma-logo-png_seeklogo-611606.png";
      break;
    case ChatModel.DEEPSEEK_R1:
      logoSrc = "/deepseek.png";
      break;
    case ChatModel.MISTRAL:
      logoSrc = "/announcing-mistral.png";
      break;
    case ChatModel.CUSTOM:
      logoSrc = "/setting.png";
      break;
    default:
      logoSrc = isDark ? "/logo-white.png" : "/logo-black.png";
  }
  
  return (
    <SelectItem key={model.value} value={model.value} className="flex flex-col items-start p-2">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 relative overflow-hidden rounded-full">
            <img 
              src={logoSrc} 
              alt={`${model.name} logo`} 
              className="object-contain w-full h-full"
              width={24}
              height={24}
            />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-bold">{model.name}</span>
          <span className="text-muted-foreground text-xs">{model.description}</span>
        </div>
      </div>
    </SelectItem>
  );
}

export function ModelSelection() {
  const { localMode, model, setModel, toggleLocalMode } = useConfigStore()
  const selectedModel = modelMap[model as ChatModel] ?? modelMap[ChatModel.GPT_4O_MINI]
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  // Get logo for the selected model
  let logoSrc = "";
  switch(model) {
    case ChatModel.LLAMA3:
    case ChatModel.LLAMA_3_70B:
      logoSrc = "/llama.webp";
      break;
    case ChatModel.GPT_4O:
    case ChatModel.GPT_4O_MINI:
      logoSrc = isDark ? "/ChatGPT-Logo-PNG-Green-Color-Design-1.png" : "/ChatGPT-Logo.svg.png";
      break;
    case ChatModel.PHI3_14B:
      logoSrc = "/phi3.png";
      break;
    case ChatModel.GEMMA:
      logoSrc = "/gemma-logo-png_seeklogo-611606.png";
      break;
    case ChatModel.DEEPSEEK_R1:
      logoSrc = "/deepseek.png";
      break;
    case ChatModel.MISTRAL:
      logoSrc = "/announcing-mistral.png";
      break;
    case ChatModel.CUSTOM:
      logoSrc = "/setting.png";
      break;
    default:
      logoSrc = isDark ? "/logo-white.png" : "/logo-black.png";
  }

  return (
    <Select
      defaultValue={model}
      value={model}
      onValueChange={(value) => {
        if (value) {
          setModel(value as any)
        }
      }}
    >
      <SelectTrigger className="w-fit space-x-2 bg-transparent outline-none border-none select-none focus:ring-0 shadow-none transition-all duration-200 ease-in-out hover:scale-[1.05] text-sm">
        <SelectValue>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 relative overflow-hidden rounded-full">
              <img 
                src={logoSrc}
                alt={`${selectedModel.name} logo`}
                className="object-contain w-full h-full"
                width={20}
                height={20}
              />
            </div>
            <span className="font-semibold">{selectedModel.name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-[250px]">
        <Tabs
          className="w-full"
          defaultValue={localMode ? "local" : "cloud"}
          onValueChange={(value) => {
            if (value === "local" && !localMode) {
              toggleLocalMode()
            } else if (value === "cloud" && localMode) {
              toggleLocalMode()
            }
          }}
        >
          <TabsList className="w-full">
            <TabsTrigger value="cloud" className="flex-1">
              <div className="flex items-center gap-1">
                <img src={isDark ? "/ChatGPT-Logo-PNG-Green-Color-Design-1.png" : "/ChatGPT-Logo.svg.png"} alt="Cloud" className="w-5 h-5 rounded-full object-cover" />
                Cloud
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="local"
              disabled={!env.NEXT_PUBLIC_LOCAL_MODE_ENABLED}
              className="flex-1 disabled:opacity-50"
            >
              <div className="flex items-center gap-1">
                <img src="/llama.webp" alt="Local" className="w-5 h-5 rounded-full object-cover" />
                Local
              </div>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="cloud" className="w-full">
            <SelectGroup className="w-full">
              {Object.values(cloudModelMap).map((model) => (
                <ModelItem key={model.value} model={model} />
              ))}
            </SelectGroup>
          </TabsContent>
          <TabsContent value="local" className="w-full">
            <SelectGroup className="w-full">
              {Object.values(localModelMap).map((model) => (
                <ModelItem key={model.value} model={model} />
              ))}
            </SelectGroup>
          </TabsContent>
        </Tabs>
      </SelectContent>
    </Select>
  )
}

