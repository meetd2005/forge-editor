"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Upload, Sparkles, X } from "lucide-react"
import Image from "next/image"

interface BannerUploadProps {
  bannerUrl: string
  onBannerChange: (url: string) => void
  onGenerateBanner: (prompt: string) => void
  isGenerating: boolean
}

export function BannerUpload({ bannerUrl, onBannerChange, onGenerateBanner, isGenerating }: BannerUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false)
  const [bannerPrompt, setBannerPrompt] = useState("")

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onBannerChange(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeBanner = () => {
    onBannerChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleGenerateBanner = () => {
    if (bannerPrompt.trim()) {
      onGenerateBanner(bannerPrompt.trim())
      setIsPromptDialogOpen(false)
      setBannerPrompt("")
    }
  }

  return (
    <div className="space-y-3">
      {bannerUrl ? (
        <div className="relative">
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
            <Image src={bannerUrl || "/placeholder.svg"} alt="Banner preview" fill className="object-cover" />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={removeBanner}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="space-y-4">
            <div className="text-gray-500">
              <Upload className="w-8 h-8 mx-auto mb-2" />
              <p>Add a banner image to make your story stand out</p>
            </div>

            <div className="flex justify-center space-x-3">
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>

              <Dialog open={isPromptDialogOpen} onOpenChange={setIsPromptDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={isGenerating}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isGenerating ? "Generating..." : "Generate with AI"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Generate Banner with AI</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="banner-prompt" className="text-sm font-medium">
                        Describe your banner image:
                      </label>
                      <Input
                        id="banner-prompt"
                        value={bannerPrompt}
                        onChange={(e) => setBannerPrompt(e.target.value)}
                        placeholder="e.g., A modern office workspace with laptops and coffee"
                        className="w-full"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Describe what you want to see in your banner image. Be specific about colors, style, and elements.
                    </p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsPromptDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleGenerateBanner}
                      disabled={!bannerPrompt.trim() || isGenerating}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
    </div>
  )
}
