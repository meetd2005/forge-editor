"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageIcon, Upload, Link } from "lucide-react"

interface ImageEmbedModalProps {
  isOpen: boolean
  onClose: () => void
  onEmbed: (url: string, alt?: string) => void
}

export function ImageEmbedModal({ isOpen, onClose, onEmbed }: ImageEmbedModalProps) {
  const [url, setUrl] = useState("")
  const [altText, setAltText] = useState("")
  const [error, setError] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (JPG, PNG, GIF, WebP, SVG)")
      return
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      return
    }

    setIsUploading(true)
    setError("")

    try {
      // Create a data URL for the image
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setPreviewUrl(dataUrl)
        setUrl(dataUrl)
        setAltText(file.name.split(".")[0]) // Use filename without extension as alt text
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setError("Failed to upload image")
      setIsUploading(false)
    }
  }

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl)
    setPreviewUrl(newUrl)
    setError("")
  }

  const handleEmbed = () => {
    if (!url.trim()) {
      setError("Please provide an image URL or upload a file")
      return
    }

    onEmbed(url.trim(), altText.trim() || "Image")
    handleClose()
  }

  const handleClose = () => {
    setUrl("")
    setAltText("")
    setError("")
    setPreviewUrl("")
    setIsUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            <span>Add Image</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center space-x-2">
              <Link className="w-4 h-4" />
              <span>URL</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="upload" className="space-y-4">
              {/* File Upload */}
              <div className="space-y-3">
                <Label>Upload Image</Label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 animate-pulse" />
                      <p className="text-sm text-gray-600">Uploading...</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">JPG, PNG, GIF, WebP, SVG up to 10MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.gif"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              {/* URL Input */}
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className={error ? "border-red-500" : ""}
                />
              </div>
            </TabsContent>

            {/* Alt Text - Common for both tabs */}
            <div className="space-y-2 mt-4">
              <Label htmlFor="alt-text">Alt Text</Label>
              <Input
                id="alt-text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe the image"
              />
              <p className="text-sm text-gray-500">Alt text helps with accessibility and SEO</p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Preview */}
            {previewUrl && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border rounded-lg p-2 bg-gray-50">
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt={altText || "Preview"}
                    className="max-w-full h-auto max-h-48 mx-auto rounded"
                    onError={() => {
                      setError("Failed to load image")
                      setPreviewUrl("")
                    }}
                  />
                </div>
              </div>
            )}

            {/* Help Text */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-1">Supported formats:</p>
              <p className="text-sm text-blue-700">JPG, PNG, GIF (animated), WebP, SVG • Max size: 10MB</p>
            </div>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleEmbed}
            disabled={!url.trim() || isUploading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Add Image
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
