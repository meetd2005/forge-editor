import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Check if Freepik API key is configured
    if (!process.env.FREEPIK_API_KEY) {
      return NextResponse.json(
        { error: "Freepik API key not configured. Please add FREEPIK_API_KEY to your environment variables." },
        { status: 500 },
      )
    }

    // Get the base URL for webhook
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : request.headers.get("origin") || "http://localhost:3000"

    // Simplified request body - only essential fields
    const freepikRequestBody = {
      prompt: body.prompt,
      webhook_url: `${baseUrl}/api/webhook/freepik`,
      aspect_ratio: body.aspect_ratio || "square_1_1",
    }

    console.log("Sending simplified request to Freepik API:", {
      url: "https://api.freepik.com/v1/ai/mystic",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-freepik-api-key": process.env.FREEPIK_API_KEY ? "***configured***" : "missing",
      },
      body: JSON.stringify(freepikRequestBody, null, 2),
    })

    // Call Freepik MysticConvert API with minimal parameters
    const response = await fetch("https://api.freepik.com/v1/ai/mystic", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-freepik-api-key": process.env.FREEPIK_API_KEY,
      },
      body: JSON.stringify(freepikRequestBody),
    })

    const responseText = await response.text()
    console.log("Freepik API raw response:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText,
    })

    if (!response.ok) {
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { message: responseText }
      }

      console.error("Freepik API error:", response.status, errorData)

      return NextResponse.json(
        {
          error: `Freepik API error: ${response.status}. ${errorData.message || errorData.error || errorData.detail || "Validation error - check API parameters"}`,
          details: errorData,
          rawResponse: responseText,
          requestSent: freepikRequestBody,
        },
        { status: response.status },
      )
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Failed to parse Freepik response:", parseError)
      return NextResponse.json(
        {
          error: "Invalid JSON response from Freepik API",
          rawResponse: responseText,
        },
        { status: 500 },
      )
    }

    console.log("Parsed Freepik response:", JSON.stringify(data, null, 2))

    // Extract task ID from response
    let taskId = null
    let status = null

    if (data && typeof data === "object") {
      // Handle the actual Freepik response format
      if (data.data && data.data.task_id) {
        taskId = data.data.task_id
        status = data.data.status
      } else if (data.task_id) {
        taskId = data.task_id
        status = data.status || data.task_status
      } else if (data.data && data.data.id) {
        taskId = data.data.id
        status = data.data.status
      } else if (data.id) {
        taskId = data.id
        status = data.status
      }
    }

    console.log("Extracted task info:", { taskId, status, fullResponse: data })

    if (!taskId) {
      console.error("No task ID found in response:", data)
      return NextResponse.json(
        {
          error: "No task ID received from Freepik API",
          responseData: data,
          requestSent: freepikRequestBody,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Image generation started successfully",
      taskId: taskId,
      status: status || "pending",
      data: data,
      webhook_url: freepikRequestBody.webhook_url,
    })
  } catch (error) {
    console.error("Error calling Freepik API:", error)
    return NextResponse.json(
      {
        error: "Failed to generate image. Network or server error.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
