"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, ExternalLink } from "lucide-react"

interface LinkEmbedModalProps {
  isOpen: boolean
  onClose: () => void
  onEmbed: (url: string, text?: string) => void
}

export function LinkEmbedModal({ isOpen, onClose, onEmbed }: LinkEmbedModalProps) {
  const [url, setUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const [error, setError] = useState("")

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleEmbed = () => {
    if (!url.trim()) {
      setError("Please enter a URL")
      return
    }

    let finalUrl = url.trim()
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl
    }

    if (!isValidUrl(finalUrl)) {
      setError("Please enter a valid URL")
      return
    }

    onEmbed(finalUrl, linkText.trim() || finalUrl)
    handleClose()
  }

  const handleClose = () => {
    setUrl("")
    setLinkText("")
    setError("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Link className="w-5 h-5 text-blue-600" />
            <span>Add Link</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setError("")
              }}
              placeholder="https://example.com"
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {/* Link Text Input */}
          <div className="space-y-2">
            <Label htmlFor="link-text">Link Text (optional)</Label>
            <Input
              id="link-text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Click here to visit"
            />
            <p className="text-sm text-gray-500">If left empty, the URL will be used as the link text</p>
          </div>

          {/* Preview */}
          {url && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-2">
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-600 underline">{linkText.trim() || url || "Your link text"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> You can add links to websites, documents, or any online resource. The link will open
              in a new tab when clicked.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleEmbed} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link className="w-4 h-4 mr-2" />
            Add Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
