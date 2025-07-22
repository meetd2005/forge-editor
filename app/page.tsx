"use client"

import { useState } from "react"
import { EnhancedEditor } from "@/components/enhanced-editor"
import { PublishModal } from "@/components/publish-modal"
import { WordCounter } from "@/components/word-counter"
import { Button } from "@/components/ui/button"
import { Save, Eye, Settings } from "lucide-react"

export default function EditorPage() {
  const [content, setContent] = useState("")
  const [title, setTitle] = useState("")
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [isSaved, setIsSaved] = useState(true)

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    setIsSaved(false)
  }

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    setIsSaved(false)
  }

  const handleSave = () => {
    setIsSaved(true)
  }

  const handlePublish = () => {
    setIsPublishModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">Draft</h1>
            <span className="text-sm text-gray-500">{isSaved ? "Saved" : "Saving..."}</span>
          </div>

          <div className="flex items-center space-x-3">
            <WordCounter content={content} />

            <div className="w-px h-6 bg-gray-300" />

            <Button variant="ghost" size="sm" onClick={handleSave} className="text-gray-600 hover:text-gray-900">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>

            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>

            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <Settings className="w-4 h-4" />
            </Button>

            <Button
              onClick={handlePublish}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full"
            >
              Publish
            </Button>
          </div>
        </div>
      </header>

      {/* Main Editor */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Title Input */}
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full text-4xl font-bold text-gray-900 placeholder-gray-400 border-none outline-none resize-none bg-transparent"
          />

          {/* Editor */}
          <EnhancedEditor content={content} onChange={handleContentChange} />
        </div>
      </main>

      {/* Publish Modal */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title={title}
        content={content}
      />
    </div>
  )
}
