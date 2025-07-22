"use client"

import type React from "react"
import type { Editor } from "@tiptap/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ImageIcon, Youtube, Link, Sparkles, Plus } from "lucide-react"
import { YouTubeEmbedModal } from "./youtube-embed-modal"
import { LinkEmbedModal } from "./link-embed-modal"
import { ImageEmbedModal } from "./image-embed-modal"
import { AIImageModal } from "./ai-image-modal"

interface PlusMenuProps {
  editor: Editor
  position: { x: number; y: number }
  isVisible: boolean
}

interface MenuOption {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  action: () => void
}

export function PlusMenu({ editor, position, isVisible }: PlusMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showYouTubeModal, setShowYouTubeModal] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showAIImageModal, setShowAIImageModal] = useState(false)

  const menuOptions: MenuOption[] = [
    {
      title: "Upload Image",
      description: "Add image from computer or URL",
      icon: ImageIcon,
      action: () => {
        setIsOpen(false)
        setShowImageModal(true)
      },
    },
    {
      title: "Generate Image with AI",
      description: "Create image using AI",
      icon: Sparkles,
      action: () => {
        setIsOpen(false)
        setShowAIImageModal(true)
      },
    },
    {
      title: "YouTube Video",
      description: "Embed a YouTube video",
      icon: Youtube,
      action: () => {
        setIsOpen(false)
        setShowYouTubeModal(true)
      },
    },
    {
      title: "Link",
      description: "Add a link",
      icon: Link,
      action: () => {
        setIsOpen(false)
        setShowLinkModal(true)
      },
    },
  ]

  const handleYouTubeEmbed = (url: string, width?: number, height?: number) => {
    editor
      .chain()
      .focus()
      .setYoutubeVideo({
        src: url,
        width: width || 640,
        height: height || 360,
      })
      .run()
  }

  const handleLinkEmbed = (url: string, text?: string) => {
    if (text) {
      editor.chain().focus().insertContent(`<a href="${url}" target="_blank">${text}</a>`).run()
    } else {
      editor.chain().focus().setLink({ href: url, target: "_blank" }).run()
    }
  }

  const handleImageEmbed = (url: string, alt?: string) => {
    editor
      .chain()
      .focus()
      .setImage({ src: url, alt: alt || "Image" })
      .run()
  }

  const handleAIImageEmbed = (url: string, alt?: string) => {
    editor
      .chain()
      .focus()
      .setImage({ src: url, alt: alt || "AI Generated Image" })
      .run()
  }

  if (!isVisible) return null

  return (
    <>
      <div
        className="fixed z-40"
        style={{
          left: position.x - 50,
          top: position.y,
        }}
      >
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-10 h-10 rounded-full border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start" side="right">
            <div className="space-y-1">
              {menuOptions.map((option) => (
                <Button
                  key={option.title}
                  variant="ghost"
                  className="w-full justify-start text-left p-3 h-auto hover:bg-gray-50"
                  onClick={option.action}
                >
                  <option.icon className="w-5 h-5 mr-3 flex-shrink-0 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">{option.title}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Modals */}
      <YouTubeEmbedModal
        isOpen={showYouTubeModal}
        onClose={() => setShowYouTubeModal(false)}
        onEmbed={handleYouTubeEmbed}
      />

      <LinkEmbedModal isOpen={showLinkModal} onClose={() => setShowLinkModal(false)} onEmbed={handleLinkEmbed} />

      <ImageEmbedModal isOpen={showImageModal} onClose={() => setShowImageModal(false)} onEmbed={handleImageEmbed} />

      <AIImageModal isOpen={showAIImageModal} onClose={() => setShowAIImageModal(false)} onEmbed={handleAIImageEmbed} />
    </>
  )
}
