import { create } from "zustand"
import { persist } from "zustand/middleware"
import { ChatModel, type ChatMessage } from "../generated/types.gen"
import { env } from "./env"
import { useMemo } from "react"

// Define store types
type ChatState = {
  threadId: number | null
  messages: ChatMessage[]
  addMessage: (message: ChatMessage) => void
  setThreadId: (threadId: number | null) => void
  setMessages: (messages: ChatMessage[]) => void
}

type ConfigState = {
  model: ChatModel
  localMode: boolean
  proMode: boolean
  setModel: (model: ChatModel) => void
  toggleLocalMode: () => void
  toggleProMode: () => void
}

// Create a single store with all state
type StoreState = ChatState & ConfigState

// Create the store
const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // Chat state
      threadId: null,
      messages: [],
      addMessage: (message: ChatMessage) => set((state) => ({ messages: [...state.messages, message] })),
      setThreadId: (threadId: number | null) => set({ threadId }),
      setMessages: (messages: ChatMessage[]) => set({ messages }),

      // Config state
      model: ChatModel.GPT_4O_MINI,
      localMode: false,
      proMode: false,
      setModel: (model: ChatModel) => set({ model }),
      toggleLocalMode: () =>
        set((state) => {
          const localModeEnabled = env.NEXT_PUBLIC_LOCAL_MODE_ENABLED
          if (!localModeEnabled) {
            return { ...state, localMode: false }
          }

          const newLocalMode = !state.localMode
          const newModel = newLocalMode ? ChatModel.LLAMA3 : ChatModel.GPT_4O_MINI
          return { localMode: newLocalMode, model: newModel }
        }),
      toggleProMode: () =>
        set((state) => {
          const proModeEnabled = env.NEXT_PUBLIC_PRO_MODE_ENABLED
          if (!proModeEnabled) {
            return { ...state, proMode: false }
          }
          return { ...state, proMode: !state.proMode }
        }),
    }),
    {
      name: "cortex-store",
      partialize: (state) => ({
        model: state.model,
        localMode: state.localMode,
        proMode: state.proMode,
      }),
    },
  ),
)

// Fixed hooks for React 19 compatibility
export function useChatStore() {
  const store = useStore()
  return useMemo(() => ({
    messages: store.messages,
    addMessage: store.addMessage,
    setMessages: store.setMessages,
    threadId: store.threadId,
    setThreadId: store.setThreadId,
  }), [
    store.messages,
    store.addMessage,
    store.setMessages,
    store.threadId,
    store.setThreadId
  ])
}

export function useConfigStore() {
  const store = useStore()
  return useMemo(() => ({
    localMode: store.localMode,
    toggleLocalMode: store.toggleLocalMode,
    model: store.model,
    setModel: store.setModel,
    proMode: store.proMode,
    toggleProMode: store.toggleProMode,
  }), [
    store.localMode,
    store.toggleLocalMode,
    store.model,
    store.setModel,
    store.proMode,
    store.toggleProMode
  ])
}

