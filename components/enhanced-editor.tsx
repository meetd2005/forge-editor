"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import Youtube from "@tiptap/extension-youtube"
import { useEffect, useState } from "react"
import { SimpleFloatingToolbar } from "./simple-floating-toolbar"
import { AICompletion } from "./ai-completion"
import { PlusMenu } from "./plus-menu"
import { ResizableImageExtension } from "../extensions/resizable-image-extension"

interface EnhancedEditorProps {
  content: string
  onChange: (content: string) => void
}

export function EnhancedEditor({ content, onChange }: EnhancedEditorProps) {
  const [showAICompletion, setShowAICompletion] = useState(false)
  const [aiPosition, setAiPosition] = useState({ x: 0, y: 0 })
  const [plusMenuPosition, setPlusMenuPosition] = useState({ x: 0, y: 0 })
  const [showPlusMenu, setShowPlusMenu] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") {
            return "What's the title?"
          }
          return 'Tell your story... (Type "++" for AI assistance)'
        },
      }),
      ResizableImageExtension.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 hover:text-blue-800 underline",
        },
      }),
      Youtube.configure({
        controls: false,
        nocookie: true,
        HTMLAttributes: {
          class: "rounded-lg my-4",
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none focus:outline-none min-h-[500px] px-0 py-4",
      },
      handleKeyDown: (view, event) => {
        // Handle ++ for AI completion
        if (event.key === "+") {
          const { from } = view.state.selection
          const textBefore = view.state.doc.textBetween(Math.max(0, from - 1), from)

          if (textBefore === "+") {
            // Remove the ++ and show AI completion
            const tr = view.state.tr.delete(from - 1, from)
            view.dispatch(tr)

            // Get cursor position for AI completion popup
            const coords = view.coordsAtPos(from - 1)
            setAiPosition({ x: coords.left, y: coords.bottom })
            setShowAICompletion(true)

            return true
          }
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())

      // Show plus menu on empty lines
      const { from } = editor.state.selection
      const currentLine = editor.state.doc.resolve(from)
      const lineStart = currentLine.start()
      const lineEnd = currentLine.end()
      const lineText = editor.state.doc.textBetween(lineStart, lineEnd)

      if (lineText.trim() === "" && currentLine.parent.type.name === "paragraph") {
        const coords = editor.view.coordsAtPos(from)
        setPlusMenuPosition({ x: coords.left, y: coords.top })
        setShowPlusMenu(true)
      } else {
        setShowPlusMenu(false)
      }
    },
    onSelectionUpdate: ({ editor }) => {
      // Update plus menu position on selection change
      const { from } = editor.state.selection
      const currentLine = editor.state.doc.resolve(from)
      const lineStart = currentLine.start()
      const lineEnd = currentLine.end()
      const lineText = editor.state.doc.textBetween(lineStart, lineEnd)

      if (lineText.trim() === "" && currentLine.parent.type.name === "paragraph") {
        const coords = editor.view.coordsAtPos(from)
        setPlusMenuPosition({ x: coords.left, y: coords.top })
        setShowPlusMenu(true)
      } else {
        setShowPlusMenu(false)
      }
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  return (
    <div className="relative">
      <SimpleFloatingToolbar editor={editor} />
      <PlusMenu editor={editor} position={plusMenuPosition} isVisible={showPlusMenu} />
      <EditorContent editor={editor} />

      {showAICompletion && (
        <AICompletion editor={editor} position={aiPosition} onClose={() => setShowAICompletion(false)} />
      )}
    </div>
  )
}
