"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Youtube } from "lucide-react"

interface YouTubeEmbedModalProps {
  isOpen: boolean
  onClose: () => void
  onEmbed: (url: string, width?: number, height?: number) => void
}

export function YouTubeEmbedModal({ isOpen, onClose, onEmbed }: YouTubeEmbedModalProps) {
  const [url, setUrl] = useState("")
  const [width, setWidth] = useState("640")
  const [height, setHeight] = useState("360")
  const [error, setError] = useState("")

  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const handleEmbed = () => {
    if (!url.trim()) {
      setError("Please enter a YouTube URL")
      return
    }

    const videoId = extractYouTubeId(url.trim())
    if (!videoId) {
      setError("Please enter a valid YouTube URL")
      return
    }

    onEmbed(url.trim(), Number.parseInt(width) || 640, Number.parseInt(height) || 360)
    handleClose()
  }

  const handleClose = () => {
    setUrl("")
    setWidth("640")
    setHeight("360")
    setError("")
    onClose()
  }

  const getVideoPreview = () => {
    const videoId = extractYouTubeId(url)
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    }
    return null
  }

  const previewImage = getVideoPreview()

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Youtube className="w-5 h-5 text-red-600" />
            <span>Embed YouTube Video</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="youtube-url">YouTube URL</Label>
            <Input
              id="youtube-url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setError("")
              }}
              placeholder="https://www.youtube.com/watch?v=..."
              className={error ? "border-red-500" : ""}
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {/* Video Preview */}
          {previewImage && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video">
                <img
                  src={previewImage || "/placeholder.svg"}
                  alt="Video preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Size Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="video-width">Width (px)</Label>
              <Input
                id="video-width"
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                min="320"
                max="1280"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-height">Height (px)</Label>
              <Input
                id="video-height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min="180"
                max="720"
              />
            </div>
          </div>

          {/* Preset Sizes */}
          <div className="space-y-2">
            <Label>Quick Sizes</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setWidth("560")
                  setHeight("315")
                }}
              >
                Small
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setWidth("640")
                  setHeight("360")
                }}
              >
                Medium
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setWidth("854")
                  setHeight("480")
                }}
              >
                Large
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleEmbed} className="bg-red-600 hover:bg-red-700 text-white">
            <Youtube className="w-4 h-4 mr-2" />
            Embed Video
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
