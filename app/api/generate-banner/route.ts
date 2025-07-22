import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { title, content, prompt } = await request.json()

    // Create a comprehensive prompt for banner generation
    const fullPrompt = prompt
      ? `${prompt}. Professional blog banner style, high quality, modern design.`
      : `Create a professional banner image for a blog post titled "${title}". ${content ? `The article is about: ${content.substring(0, 200)}...` : ""} Make it visually appealing, modern, and suitable for a Medium-style publication.`

    // For demo purposes, return a placeholder image with the prompt
    // In a real implementation, you would call an AI image generation service like DALL-E, Midjourney, or Stable Diffusion
    const imageUrl = `/placeholder.svg?height=400&width=800&query=${encodeURIComponent(fullPrompt)}`

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error("Error generating banner:", error)
    return NextResponse.json({ error: "Failed to generate banner" }, { status: 500 })
  }
}
