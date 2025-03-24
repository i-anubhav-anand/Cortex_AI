"use client"

import type React from "react"

import TextareaAutosize from "react-textarea-autosize"
import { useState } from "react"
import { Button } from "./ui/button"
import { ArrowUp, Paperclip } from "lucide-react"
import ProToggle from "./pro-toggle"
import { ModelSelection } from "./model-selection"

const InputBar = ({
  input,
  setInput,
  inputRef,
}: {
  input: string
  setInput: (input: string) => void
  inputRef?: React.RefObject<HTMLTextAreaElement>
}) => {
  return (
    <div className="w-full flex flex-col rounded-lg focus:outline-none px-4 py-3 bg-card border-2 shadow-sm">
      <div className="w-full">
        <TextareaAutosize
          ref={inputRef}
          className="w-full bg-transparent text-md resize-none focus:outline-none p-0"
          placeholder="Ask anything..."
          onChange={(e) => setInput(e.target.value)}
          value={input}
          aria-label="Ask a question"
        />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
            <Paperclip size={16} />
          </Button>
          <ModelSelection />
        </div>
        <div className="flex items-center gap-2">
          <ProToggle />
          <Button
            type="submit"
            variant="default"
            size="icon"
            className="rounded-full bg-tint aspect-square h-8 w-8 disabled:opacity-20 hover:bg-tint/80 overflow-hidden"
            disabled={input.trim().length < 5}
          >
            <ArrowUp size={18} />
          </Button>
        </div>
      </div>
    </div>
  )
}

const FollowingUpInput = ({
  input,
  setInput,
  inputRef,
}: {
  input: string
  setInput: (input: string) => void
  inputRef?: React.RefObject<HTMLTextAreaElement>
}) => {
  return (
    <div className="w-full flex flex-row rounded-full focus:outline-none px-4 py-3 bg-card border-2 items-center shadow-sm">
      <div className="w-full">
        <TextareaAutosize
          ref={inputRef}
          className="w-full bg-transparent text-md resize-none focus:outline-none p-0"
          placeholder="Ask anything..."
          onChange={(e) => setInput(e.target.value)}
          value={input}
          aria-label="Ask a question"
        />
      </div>
      <div className="flex items-center gap-2">
        <ProToggle />
        <Button
          type="submit"
          variant="default"
          size="icon"
          className="rounded-full bg-tint aspect-square h-8 w-8 disabled:opacity-20 hover:bg-tint/80 overflow-hidden"
          disabled={input.trim().length < 5}
        >
          <ArrowUp size={18} />
        </Button>
      </div>
    </div>
  )
}

export const AskInput = ({
  sendMessage,
  isFollowingUp = false,
  inputRef,
}: {
  sendMessage: (message: string) => void
  isFollowingUp?: boolean
  inputRef?: React.RefObject<HTMLTextAreaElement>
}) => {
  const [input, setInput] = useState("")
  return (
    <>
      <form
        className="w-full overflow-hidden"
        onSubmit={(e) => {
          if (input.trim().length < 5) return
          e.preventDefault()
          sendMessage(input)
          setInput("")
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            if (input.trim().length < 5) return
            sendMessage(input)
            setInput("")
          }
        }}
      >
        {isFollowingUp ? (
          <FollowingUpInput input={input} setInput={setInput} inputRef={inputRef} />
        ) : (
          <InputBar input={input} setInput={setInput} inputRef={inputRef} />
        )}
      </form>
    </>
  )
}

