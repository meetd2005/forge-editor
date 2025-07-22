"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Wand2, CheckCircle, Clock, AlertCircle, Info, Copy } from "lucide-react"

interface AIImageModalProps {
  isOpen: boolean
  onClose: () => void
  onEmbed: (url: string, alt?: string) => void
}

export function AIImageModal({ isOpen, onClose, onEmbed }: AIImageModalProps) {
  const [prompt, setPrompt] = useState("")
  const [aspectRatio, setAspectRatio] = useState("square_1_1")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState("")
  const [error, setError] = useState("")
  const [taskId, setTaskId] = useState("")
  const [generationStatus, setGenerationStatus] = useState<"idle" | "pending" | "completed" | "failed">("idle")
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [pollCount, setPollCount] = useState(0)

  const aspectRatios = [
    { value: "square_1_1", label: "Square (1:1)" },
    { value: "classic_4_3", label: "Classic (4:3)" },
    { value: "traditional_3_4", label: "Traditional (3:4)" },
    { value: "widescreen_16_9", label: "Widescreen (16:9)" },
    { value: "social_story_9_16", label: "Social Story (9:16)" },
    { value: "smartphone_horizontal_20_9", label: "Phone Horizontal (20:9)" },
    { value: "smartphone_vertical_9_20", label: "Phone Vertical (9:20)" },
    { value: "standard_3_2", label: "Standard (3:2)" },
    { value: "portrait_2_3", label: "Portrait (2:3)" },
    { value: "horizontal_2_1", label: "Horizontal (2:1)" },
    { value: "vertical_1_2", label: "Vertical (1:2)" },
    { value: "social_5_4", label: "Social (5:4)" },
    { value: "social_post_4_5", label: "Social Post (4:5)" },
  ]

  // Poll Freepik API directly for task completion
  useEffect(() => {
    let pollInterval: NodeJS.Timeout

    if (taskId && generationStatus === "pending") {
      console.log(`Starting direct API polling for task ID: ${taskId}`)
      setPollCount(0)

      pollInterval = setInterval(async () => {
        try {
          setPollCount((prev) => prev + 1)
          console.log(`Polling attempt ${pollCount + 1} for task ${taskId}...`)

          const response = await fetch(`/api/check-task?taskId=${taskId}`)
          const data = await response.json()

          console.log("Direct API polling response:", data)

          if (data.status === "completed" && data.imageUrl) {
            console.log("Image generation completed!", data.imageUrl)
            setGeneratedImage(data.imageUrl)
            setGenerationStatus("completed")
            setIsGenerating(false)
            clearInterval(pollInterval)
          } else if (data.status === "failed") {
            console.log("Image generation failed")
            setError("Image generation failed")
            setGenerationStatus("failed")
            setIsGenerating(false)
            clearInterval(pollInterval)
          } else {
            console.log(`Still pending... Status: ${data.taskStatus || data.status}`)
          }
        } catch (error) {
          console.error("Polling error:", error)
          // Don't fail immediately, keep trying
        }
      }, 5000)

      // Stop polling after 5 minutes (60 attempts)
      setTimeout(() => {
        if (pollInterval) {
          clearInterval(pollInterval)
          if (generationStatus === "pending") {
            setError("Generation timeout - please try again")
            setGenerationStatus("failed")
            setIsGenerating(false)
          }
        }
      }, 300000) // 5 minutes
    }

    return () => {
      if (pollInterval) {
        console.log(`Stopping polling for task ${taskId}`)
        clearInterval(pollInterval)
      }
    }
  }, [taskId, generationStatus, pollCount])

  const generateCurlCommand = () => {
    const requestBody = {
      prompt: prompt.trim(),
      aspect_ratio: aspectRatio,
    }

    return `// Generate image
fetch("https://api.freepik.com/v1/ai/mystic", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "x-freepik-api-key": "YOUR_API_KEY"
  },
  body: JSON.stringify(${JSON.stringify(requestBody, null, 2)})
}).then(response => response.json()).then(data => {
  console.log("Generation started:", data);
  // Then check status with:
  // fetch(\`https://api.freepik.com/v1/ai/mystic/\${data.data.task_id}\`, {
  //   method: "GET",
  //   headers: { "x-freepik-api-key": "YOUR_API_KEY" }
  // }).then(r => r.json()).then(status => console.log(status));
});`
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a description for your image")
      return
    }

    setIsGenerating(true)
    setError("")
    setGenerationStatus("pending")
    setGeneratedImage("")
    setDebugInfo(null)
    setPollCount(0)

    try {
      const requestBody = {
        prompt: prompt.trim(),
        aspect_ratio: aspectRatio,
      }

      console.log("Sending generation request:", requestBody)

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()
      console.log("Generation response:", data)

      setDebugInfo(data)

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.taskId) {
        setTaskId(data.taskId)
        // Polling will start automatically via useEffect
      } else {
        console.error("No task ID in response:", data)
        throw new Error("No task ID received from API. Check the debug info below.")
      }
    } catch (error) {
      console.error("Error generating image:", error)
      setError(error instanceof Error ? error.message : "Failed to generate image. Please try again.")
      setGenerationStatus("failed")
      setIsGenerating(false)
    }
  }

  const handleEmbed = () => {
    if (generatedImage) {
      onEmbed(generatedImage, prompt)
      handleClose()
    }
  }

  const handleClose = () => {
    setPrompt("")
    setAspectRatio("square_1_1")
    setGeneratedImage("")
    setError("")
    setIsGenerating(false)
    setTaskId("")
    setGenerationStatus("idle")
    setDebugInfo(null)
    setPollCount(0)
    onClose()
  }

  const getStatusIcon = () => {
    switch (generationStatus) {
      case "pending":
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusMessage = () => {
    switch (generationStatus) {
      case "pending":
        return `Generating your image... (Check ${pollCount}/60)`
      case "completed":
        return "Image generated successfully!"
      case "failed":
        return "Generation failed. Please try again."
      default:
        return ""
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>Generate Image with AI - MysticConvert</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="image-prompt">Describe your image *</Label>
            <Textarea
              id="image-prompt"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value)
                setError("")
              }}
              placeholder="A futuristic transparent dome structure atop a tall cylindrical skyscraper, elegantly lit from within by warm ambient lighting..."
              className={`min-h-[120px] ${error ? "border-red-500" : ""}`}
              rows={5}
              disabled={isGenerating}
            />
            {error && (
              <div className="space-y-2">
                <p className="text-sm text-red-500">{error}</p>
                {debugInfo && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                      <Info className="w-3 h-3 inline mr-1" />
                      Debug Information
                    </summary>
                    <div className="mt-2 space-y-2">
                      <pre className="p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(debugInfo, null, 2)}
                      </pre>
                      {prompt && (
                        <div>
                          <p className="text-xs font-medium mb-1">Test with this JavaScript code:</p>
                          <div className="relative">
                            <pre className="p-2 bg-gray-900 text-green-400 rounded text-xs overflow-auto max-h-32">
                              {generateCurlCommand()}
                            </pre>
                            <Button
                              size="sm"
                              variant="outline"
                              className="absolute top-1 right-1 h-6 w-6 p-0 bg-transparent"
                              onClick={() => copyToClipboard(generateCurlCommand())}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            )}
            <p className="text-xs text-gray-500">
              Describe what you want to see in your image. Be specific about colors, style, and elements.
            </p>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-2">
            <Label>Aspect Ratio</Label>
            <Select value={aspectRatio} onValueChange={setAspectRatio} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {aspectRatios.map((ratio) => (
                  <SelectItem key={ratio.value} value={ratio.value}>
                    {ratio.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12"
          >
            {isGenerating ? (
              <>
                <Wand2 className="w-5 h-5 mr-2 animate-spin" />
                Generating with MysticConvert...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Image
              </>
            )}
          </Button>

          {/* Enhanced Status Display */}
          {generationStatus !== "idle" && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                {getStatusIcon()}
                <span className="text-sm font-medium">{getStatusMessage()}</span>
              </div>

              {/* Progress indicator */}
              {generationStatus === "pending" && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(90, (pollCount / 60) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Polling Freepik API directly every 5 seconds. Usually takes 30-60 seconds.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Task ID Display */}
          {taskId && (
            <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
              <strong>Task ID:</strong> {taskId}
              {taskId && (
                <div className="mt-1">
                  <strong>Direct check URL:</strong>
                  <code className="ml-1 text-xs bg-gray-200 px-1 rounded">
                    GET https://api.freepik.com/v1/ai/mystic/{taskId}
                  </code>
                </div>
              )}
            </div>
          )}

          {/* Generated Image Preview */}
          {generatedImage && (
            <div className="space-y-3">
              <Label>Generated Image</Label>
              <div className="border rounded-lg p-4 bg-gray-50">
                <img
                  src={generatedImage || "/placeholder.svg"}
                  alt={prompt}
                  className="w-full h-auto max-h-96 object-contain mx-auto rounded"
                />
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">💡 Tips for better results:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Be specific about colors, lighting, and composition</li>
              <li>• Mention the mood or atmosphere you want</li>
              <li>• Include details about the setting or background</li>
              <li>• Use descriptive adjectives (elegant, modern, vibrant, etc.)</li>
            </ul>
          </div>

          {/* API Status */}
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>✅ Now using direct API polling:</strong>
            </p>
            <ul className="text-xs text-green-700 mt-1 space-y-1">
              <li>• Polls Freepik API directly every 5 seconds</li>
              <li>• No dependency on webhooks</li>
              <li>• Should reliably detect completion</li>
              <li>• Timeout after 5 minutes if no response</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleEmbed}
            disabled={!generatedImage || generationStatus !== "completed"}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Add to Article
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
