"use client"

import { useEffect, useState } from "react"
import type { Editor } from "@tiptap/react"
import { Button } from "@/components/ui/button"
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, Quote, Code, Minus } from "lucide-react"

interface SimpleFloatingToolbarProps {
  editor: Editor
}

export function SimpleFloatingToolbar({ editor }: SimpleFloatingToolbarProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const updateToolbar = () => {
      const { selection } = editor.state
      const { from, to } = selection

      if (from === to) {
        setIsVisible(false)
        return
      }

      const start = editor.view.coordsAtPos(from)
      const end = editor.view.coordsAtPos(to)

      const x = (start.left + end.left) / 2
      const y = start.top - 70

      setPosition({ x, y })
      setIsVisible(true)
    }

    editor.on("selectionUpdate", updateToolbar)
    editor.on("transaction", updateToolbar)

    return () => {
      editor.off("selectionUpdate", updateToolbar)
      editor.off("transaction", updateToolbar)
    }
  }, [editor])

  if (!isVisible) return null

  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-2 flex items-center space-x-1"
      style={{
        left: position.x,
        top: position.y,
        transform: "translateX(-50%)",
      }}
    >
      {/* Basic Formatting */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`text-gray-700 hover:bg-gray-100 ${editor.isActive("bold") ? "bg-gray-100 text-gray-900" : ""}`}
      >
        <Bold className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`text-gray-700 hover:bg-gray-100 ${editor.isActive("italic") ? "bg-gray-100 text-gray-900" : ""}`}
      >
        <Italic className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`text-gray-700 hover:bg-gray-100 ${editor.isActive("strike") ? "bg-gray-100 text-gray-900" : ""}`}
      >
        <Strikethrough className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Code */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`text-gray-700 hover:bg-gray-100 ${editor.isActive("code") ? "bg-gray-100 text-gray-900" : ""}`}
      >
        <Code className="w-4 h-4" />
      </Button>

      {/* Code Block */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`text-gray-700 hover:bg-gray-100 ${editor.isActive("codeBlock") ? "bg-gray-100 text-gray-900" : ""}`}
        title="Code Block"
      >
        <div className="relative">
          <Code className="w-4 h-4" />
          <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-gray-600 rounded-full" />
        </div>
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Headings */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`text-gray-700 hover:bg-gray-100 ${editor.isActive("heading", { level: 1 }) ? "bg-gray-100 text-gray-900" : ""}`}
      >
        <Heading1 className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`text-gray-700 hover:bg-gray-100 ${editor.isActive("heading", { level: 2 }) ? "bg-gray-100 text-gray-900" : ""}`}
      >
        <Heading2 className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Lists */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`text-gray-700 hover:bg-gray-100 ${editor.isActive("bulletList") ? "bg-gray-100 text-gray-900" : ""}`}
      >
        <List className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`text-gray-700 hover:bg-gray-100 ${editor.isActive("orderedList") ? "bg-gray-100 text-gray-900" : ""}`}
      >
        <ListOrdered className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`text-gray-700 hover:bg-gray-100 ${editor.isActive("blockquote") ? "bg-gray-100 text-gray-900" : ""}`}
      >
        <Quote className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Horizontal Rule */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="text-gray-700 hover:bg-gray-100"
        title="Horizontal Line"
      >
        <Minus className="w-4 h-4" />
      </Button>
    </div>
  )
}
