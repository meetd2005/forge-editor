"use client"

import { Clock, FileText } from "lucide-react"

interface WordCounterProps {
  content: string
}

export function WordCounter({ content }: WordCounterProps) {
  // Remove HTML tags and count words
  const plainText = content.replace(/<[^>]*>/g, "")
  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0

  // Estimate reading time (average 200 words per minute)
  const readingTime = Math.ceil(wordCount / 200)

  return (
    <div className="flex items-center space-x-4 text-sm text-gray-500">
      <div className="flex items-center space-x-1">
        <FileText className="w-4 h-4" />
        <span>{wordCount} words</span>
      </div>
      <div className="flex items-center space-x-1">
        <Clock className="w-4 h-4" />
        <span>{readingTime} min read</span>
      </div>
    </div>
  )
}
