"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Check, X } from "lucide-react"
import type { Editor } from "@tiptap/react"

interface AICompletionProps {
  editor: Editor
  position: { x: number; y: number }
  onClose: () => void
}

export function AICompletion({ editor, position, onClose }: AICompletionProps) {
  const [suggestion, setSuggestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const generateCompletion = async () => {
    setIsLoading(true)
    try {
      const currentContent = editor.getText()
      const cursorPosition = editor.state.selection.from
      const textBeforeCursor = editor.state.doc.textBetween(0, cursorPosition)

      const response = await fetch("/api/ai/completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: "",
          context: textBeforeCursor.slice(-200), // Last 200 characters for context
        }),
      })

      // Get response text first
      const responseText = await response.text()
      console.log("Raw response:", responseText)

      let data
      try {
        // Try to parse as JSON
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("JSON parse error:", parseError)
        console.error("Response text:", responseText)

        // If it's not JSON, show the raw response (likely an error page)
        if (responseText.includes("Internal Server Error") || responseText.includes("<!DOCTYPE")) {
          setSuggestion("❌ Server Error: The AI service is currently unavailable. Please try again later.")
        } else {
          setSuggestion(
            `❌ Parse Error: Received invalid response format. Raw response: ${responseText.substring(0, 200)}...`,
          )
        }
        return
      }

      if (!response.ok) {
        if (response.status === 500 && data.error?.includes("API key not configured")) {
          setSuggestion(
            "⚠️ OpenAI API key not configured. Please add your OPENAI_API_KEY to environment variables to use AI completion.",
          )
        } else if (response.status === 401) {
          setSuggestion("❌ Authentication Error: Invalid OpenAI API key. Please check your configuration.")
        } else if (response.status === 429) {
          setSuggestion("❌ Rate Limit: OpenAI API quota exceeded. Please check your billing or try again later.")
        } else {
          setSuggestion(`❌ Error (${response.status}): ${data.error || "Failed to generate completion"}`)
        }
      } else if (data.suggestion) {
        setSuggestion(data.suggestion)
      } else {
        setSuggestion("❌ No suggestion received from AI")
      }
    } catch (error) {
      console.error("Error generating completion:", error)

      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        setSuggestion("❌ Network Error: Unable to connect to the server. Please check your connection.")
      } else {
        setSuggestion(`❌ Unexpected Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const acceptSuggestion = () => {
    if (suggestion && !suggestion.startsWith("⚠️") && !suggestion.startsWith("❌")) {
      editor.chain().focus().insertContent(suggestion).run()
    }
    onClose()
  }

  const rejectSuggestion = () => {
    setSuggestion("")
    onClose()
  }

  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[300px] max-w-[500px]"
      style={{
        left: position.x,
        top: position.y + 10,
      }}
    >
      {!suggestion && !isLoading && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium">AI Writing Assistant</span>
          </div>
          <Button
            onClick={generateCompletion}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            size="sm"
          >
            Continue writing with AI
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center space-x-2 py-2">
          <Sparkles className="w-4 h-4 text-purple-600 animate-spin" />
          <span className="text-sm text-gray-600">Generating suggestion...</span>
        </div>
      )}

      {suggestion && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium">AI Suggestion</span>
          </div>

          <div
            className={`p-3 rounded text-sm border-l-4 ${
              suggestion.startsWith("❌") || suggestion.startsWith("⚠️")
                ? "bg-red-50 border-red-500 text-red-700"
                : "bg-gray-50 border-purple-600 text-gray-700"
            }`}
          >
            {suggestion}
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={acceptSuggestion}
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={suggestion.startsWith("❌") || suggestion.startsWith("⚠️")}
            >
              <Check className="w-4 h-4 mr-1" />
              Accept
            </Button>
            <Button onClick={rejectSuggestion} size="sm" variant="outline" className="flex-1 bg-transparent">
              <X className="w-4 h-4 mr-1" />
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
