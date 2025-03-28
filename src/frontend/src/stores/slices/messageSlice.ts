import type { StateCreator } from "zustand"
import type { ChatMessage } from "../../../generated/types.gen" // Import directly from types.gen.ts

type State = {
  threadId: number | null
  messages: ChatMessage[]
}

type Actions = {
  addMessage: (message: ChatMessage) => void
  setThreadId: (threadId: number | null) => void
  setMessages: (messages: ChatMessage[]) => void
}

export type ChatStore = State & Actions

export const createMessageSlice: StateCreator<ChatStore, [], [], ChatStore> = (set) => ({
  threadId: null,
  messages: [],
  addMessage: (message: ChatMessage) => set((state) => ({ messages: [...state.messages, message] })),
  setThreadId: (threadId: number | null) => set((state) => ({ threadId })),
  setMessages: (messages: ChatMessage[]) => set((state) => ({ messages })),
})

