import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get("taskId")

    if (!taskId) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 })
    }

    if (!process.env.FREEPIK_API_KEY) {
      return NextResponse.json({ error: "Freepik API key not configured" }, { status: 500 })
    }

    console.log(`Checking task status for: ${taskId}`)

    // Call Freepik API directly to check task status
    const response = await fetch(`https://api.freepik.com/v1/ai/mystic/${taskId}`, {
      method: "GET",
      headers: {
        "x-freepik-api-key": process.env.FREEPIK_API_KEY,
      },
    })

    const responseText = await response.text()
    console.log("Freepik task check response:", {
      status: response.status,
      body: responseText,
    })

    if (!response.ok) {
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { message: responseText }
      }

      return NextResponse.json(
        {
          error: `Freepik API error: ${response.status}`,
          details: errorData,
        },
        { status: response.status },
      )
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      return NextResponse.json(
        {
          error: "Invalid JSON response from Freepik API",
          rawResponse: responseText,
        },
        { status: 500 },
      )
    }

    console.log("Parsed task status:", JSON.stringify(data, null, 2))

    // Handle the response format
    let status = "pending"
    let imageUrl = null
    let taskStatus = null

    if (data.data) {
      status = data.data.status?.toLowerCase() || "pending"
      taskStatus = data.data.task_status || data.data.status

      // Check for completed image
      if (data.data.generated && data.data.generated.length > 0) {
        imageUrl = data.data.generated[0]
        status = "completed"
      }
    } else if (data.generated) {
      // Handle direct format
      if (data.generated.length > 0) {
        imageUrl = data.generated[0]
        status = "completed"
      } else {
        status = data.task_status?.toLowerCase() === "in_progress" ? "pending" : "pending"
      }
    }

    return NextResponse.json({
      status,
      taskId,
      taskStatus,
      imageUrl,
      data,
    })
  } catch (error) {
    console.error("Error checking task status:", error)
    return NextResponse.json(
      {
        error: "Failed to check task status",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
