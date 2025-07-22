"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react"

export function ResizableImage({ node, updateAttributes, selected }: NodeViewProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState({
    width: node.attrs.width || "auto",
    height: node.attrs.height || "auto",
  })
  const [isHovered, setIsHovered] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setResizeHandle(handle)

    const startX = e.clientX
    const startY = e.clientY
    const startWidth = imageRef.current?.offsetWidth || 0
    const startHeight = imageRef.current?.offsetHeight || 0
    const aspectRatio = startWidth / startHeight

    const handleMouseMove = (e: MouseEvent) => {
      if (!imageRef.current) return

      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY

      let newWidth = startWidth
      let newHeight = startHeight

      switch (handle) {
        case "se": // Southeast (bottom-right) - maintain aspect ratio
          newWidth = Math.max(100, startWidth + deltaX)
          newHeight = newWidth / aspectRatio
          break
        case "sw": // Southwest (bottom-left)
          newWidth = Math.max(100, startWidth - deltaX)
          newHeight = newWidth / aspectRatio
          break
        case "ne": // Northeast (top-right)
          newWidth = Math.max(100, startWidth + deltaX)
          newHeight = newWidth / aspectRatio
          break
        case "nw": // Northwest (top-left)
          newWidth = Math.max(100, startWidth - deltaX)
          newHeight = newWidth / aspectRatio
          break
        case "e": // East (right)
          newWidth = Math.max(100, startWidth + deltaX)
          break
        case "w": // West (left)
          newWidth = Math.max(100, startWidth - deltaX)
          break
        case "n": // North (top)
          newHeight = Math.max(60, startHeight - deltaY)
          break
        case "s": // South (bottom)
          newHeight = Math.max(60, startHeight + deltaY)
          break
      }

      setDimensions({
        width: `${Math.round(newWidth)}px`,
        height: `${Math.round(newHeight)}px`,
      })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setResizeHandle(null)

      // Update the node attributes
      updateAttributes({
        width: dimensions.width,
        height: dimensions.height,
      })

      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  // Reset dimensions when node changes
  useEffect(() => {
    setDimensions({
      width: node.attrs.width || "auto",
      height: node.attrs.height || "auto",
    })
  }, [node.attrs.width, node.attrs.height])

  const showHandles = selected || isHovered || isResizing

  return (
    <NodeViewWrapper className="relative inline-block">
      <div
        ref={containerRef}
        className="relative inline-block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: dimensions.width,
          height: dimensions.height,
        }}
      >
        {/* Selection border */}
        {selected && <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />}

        <img
          ref={imageRef}
          src={node.attrs.src || "/placeholder.svg"}
          alt={node.attrs.alt || ""}
          className="w-full h-full object-contain rounded-lg block"
          style={{
            width: dimensions.width,
            height: dimensions.height,
          }}
          draggable={false}
        />

        {/* Resize Handles */}
        {showHandles && (
          <>
            {/* Corner Handles */}
            <div
              className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-lg cursor-nw-resize z-10"
              style={{ top: -6, left: -6 }}
              onMouseDown={(e) => handleMouseDown(e, "nw")}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-lg cursor-ne-resize z-10"
              style={{ top: -6, right: -6 }}
              onMouseDown={(e) => handleMouseDown(e, "ne")}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-lg cursor-sw-resize z-10"
              style={{ bottom: -6, left: -6 }}
              onMouseDown={(e) => handleMouseDown(e, "sw")}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-lg cursor-se-resize z-10"
              style={{ bottom: -6, right: -6 }}
              onMouseDown={(e) => handleMouseDown(e, "se")}
            />

            {/* Edge Handles */}
            <div
              className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-lg cursor-n-resize z-10"
              style={{ top: -6, left: "50%", transform: "translateX(-50%)" }}
              onMouseDown={(e) => handleMouseDown(e, "n")}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-lg cursor-s-resize z-10"
              style={{ bottom: -6, left: "50%", transform: "translateX(-50%)" }}
              onMouseDown={(e) => handleMouseDown(e, "s")}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-lg cursor-w-resize z-10"
              style={{ left: -6, top: "50%", transform: "translateY(-50%)" }}
              onMouseDown={(e) => handleMouseDown(e, "w")}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-lg cursor-e-resize z-10"
              style={{ right: -6, top: "50%", transform: "translateY(-50%)" }}
              onMouseDown={(e) => handleMouseDown(e, "e")}
            />
          </>
        )}

        {/* Resize overlay during resizing */}
        {isResizing && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-20 border-2 border-blue-500 border-dashed rounded-lg pointer-events-none" />
        )}
      </div>

      {/* Size indicator during resize */}
      {isResizing && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded shadow-lg z-20">
          {Math.round(Number.parseFloat(dimensions.width as string))} ×{" "}
          {Math.round(Number.parseFloat(dimensions.height as string))}px
        </div>
      )}

      {/* Quick resize options */}
      {selected && !isResizing && (
        <div className="absolute -top-12 left-0 flex space-x-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1 z-20">
          <button
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            onClick={() => {
              updateAttributes({ width: "300px", height: "auto" })
              setDimensions({ width: "300px", height: "auto" })
            }}
          >
            Small
          </button>
          <button
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            onClick={() => {
              updateAttributes({ width: "500px", height: "auto" })
              setDimensions({ width: "500px", height: "auto" })
            }}
          >
            Medium
          </button>
          <button
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            onClick={() => {
              updateAttributes({ width: "100%", height: "auto" })
              setDimensions({ width: "100%", height: "auto" })
            }}
          >
            Full
          </button>
        </div>
      )}
    </NodeViewWrapper>
  )
}
