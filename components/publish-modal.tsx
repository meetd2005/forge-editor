"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { BannerUpload } from "./banner-upload"

interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string
}

export function PublishModal({ isOpen, onClose, title, content }: PublishModalProps) {
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const [bannerUrl, setBannerUrl] = useState("")
  const [isGeneratingBanner, setIsGeneratingBanner] = useState(false)

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const generateBanner = async (prompt: string) => {
    setIsGeneratingBanner(true)
    try {
      const response = await fetch("/api/generate-banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: content.substring(0, 500),
          prompt,
        }),
      })

      if (response.ok) {
        const { imageUrl } = await response.json()
        setBannerUrl(imageUrl)
      }
    } catch (error) {
      console.error("Error generating banner:", error)
    } finally {
      setIsGeneratingBanner(false)
    }
  }

  const handlePublish = async () => {
    const articleData = {
      title,
      content,
      tags,
      bannerUrl,
    }

    console.log("Publishing article:", articleData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Ready to publish?</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Article Preview */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Article Preview</Label>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{title || "Untitled"}</h3>
              <p className="text-gray-600 text-sm line-clamp-3">
                {content.replace(/<[^>]*>/g, "").substring(0, 200)}...
              </p>
            </div>
          </div>

          {/* Banner Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Story Banner</Label>
            <BannerUpload
              bannerUrl={bannerUrl}
              onBannerChange={setBannerUrl}
              onGenerateBanner={generateBanner}
              isGenerating={isGeneratingBanner}
            />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="px-3 py-1">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-2 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag..."
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addTag} disabled={!currentTag.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500">Add up to 5 tags to help readers discover your story</p>
          </div>

          {/* Publishing note */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> Your article will be published with the current title and content. Make sure
              everything looks good before publishing.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={!title.trim()}
          >
            Publish now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
