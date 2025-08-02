"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Shuffle, RotateCcw, Check } from "lucide-react"

type CellType = "empty" | "dot" | "square" | "star" | "triangle" | "start" | "end"
type LineDirection = "horizontal" | "vertical"

interface Cell {
  type: CellType
  color?: string
}

interface Line {
  row: number
  col: number
  direction: LineDirection
  active: boolean
}

export default function Component() {
  const [gridSize, setGridSize] = useState(4)
  const [grid, setGrid] = useState<Cell[][]>([])
  const [lines, setLines] = useState<Line[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<{ row: number; col: number }[]>([])
  const [selectedTool, setSelectedTool] = useState<CellType>("dot")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3"]

  useEffect(() => {
    initializeGrid()
  }, [gridSize])

  useEffect(() => {
    drawCanvas()
  }, [grid, lines, currentPath])

  const initializeGrid = () => {
    const newGrid: Cell[][] = []
    const newLines: Line[] = []

    for (let i = 0; i <= gridSize; i++) {
      newGrid[i] = []
      for (let j = 0; j <= gridSize; j++) {
        newGrid[i][j] = { type: "empty" }
      }
    }

    // Add start and end points
    newGrid[0][0] = { type: "start" }
    newGrid[gridSize][gridSize] = { type: "end" }

    // Initialize lines
    for (let i = 0; i <= gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        newLines.push({ row: i, col: j, direction: "horizontal", active: false })
      }
    }
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j <= gridSize; j++) {
        newLines.push({ row: i, col: j, direction: "vertical", active: false })
      }
    }

    setGrid(newGrid)
    setLines(newLines)
    setCurrentPath([])
  }

  const generateRandomPuzzle = () => {
    const newGrid = [...grid]

    // Clear existing symbols except start/end
    for (let i = 0; i <= gridSize; i++) {
      for (let j = 0; j <= gridSize; j++) {
        if (newGrid[i][j].type !== "start" && newGrid[i][j].type !== "end") {
          newGrid[i][j] = { type: "empty" }
        }
      }
    }

    // Add random symbols
    const symbolTypes: CellType[] = ["dot", "square", "star", "triangle"]
    const numSymbols = Math.floor(Math.random() * 8) + 3

    for (let i = 0; i < numSymbols; i++) {
      let row, col
      do {
        row = Math.floor(Math.random() * (gridSize + 1))
        col = Math.floor(Math.random() * (gridSize + 1))
      } while (newGrid[row][col].type !== "empty")

      const symbolType = symbolTypes[Math.floor(Math.random() * symbolTypes.length)]
      const color = colors[Math.floor(Math.random() * colors.length)]

      newGrid[row][col] = { type: symbolType, color }
    }

    setGrid(newGrid)
    clearLines()
  }

  const clearLines = () => {
    setLines(lines.map((line) => ({ ...line, active: false })))
    setCurrentPath([])
  }

  const drawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const cellSize = 60
    const padding = 30

    canvas.width = gridSize * cellSize + padding * 2
    canvas.height = gridSize * cellSize + padding * 2

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid dots
    ctx.fillStyle = "#666"
    for (let i = 0; i <= gridSize; i++) {
      for (let j = 0; j <= gridSize; j++) {
        const x = padding + j * cellSize
        const y = padding + i * cellSize

        ctx.beginPath()
        ctx.arc(x, y, 3, 0, 2 * Math.PI)
        ctx.fill()
      }
    }

    // Draw symbols
    for (let i = 0; i <= gridSize; i++) {
      for (let j = 0; j <= gridSize; j++) {
        const cell = grid[i]?.[j]
        if (!cell || cell.type === "empty") continue

        const x = padding + j * cellSize
        const y = padding + i * cellSize

        ctx.fillStyle = cell.color || "#333"

        switch (cell.type) {
          case "start":
            ctx.fillStyle = "#4ade80"
            ctx.beginPath()
            ctx.arc(x, y, 8, 0, 2 * Math.PI)
            ctx.fill()
            break
          case "end":
            ctx.fillStyle = "#ef4444"
            ctx.beginPath()
            ctx.arc(x, y, 8, 0, 2 * Math.PI)
            ctx.fill()
            break
          case "dot":
            ctx.beginPath()
            ctx.arc(x, y, 6, 0, 2 * Math.PI)
            ctx.fill()
            break
          case "square":
            ctx.fillRect(x - 8, y - 8, 16, 16)
            break
          case "star":
            drawStar(ctx, x, y, 5, 10, 5)
            break
          case "triangle":
            drawTriangle(ctx, x, y, 12)
            break
        }
      }
    }

    // Draw active lines
    ctx.strokeStyle = "#fbbf24"
    ctx.lineWidth = 4
    ctx.lineCap = "round"

    lines.forEach((line) => {
      if (!line.active) return

      const startX = padding + line.col * cellSize
      const startY = padding + line.row * cellSize

      ctx.beginPath()
      if (line.direction === "horizontal") {
        ctx.moveTo(startX, startY)
        ctx.lineTo(startX + cellSize, startY)
      } else {
        ctx.moveTo(startX, startY)
        ctx.lineTo(startX, startY + cellSize)
      }
      ctx.stroke()
    })

    // Draw current path
    if (currentPath.length > 1) {
      ctx.strokeStyle = "#fbbf24"
      ctx.lineWidth = 4
      ctx.beginPath()

      for (let i = 0; i < currentPath.length; i++) {
        const point = currentPath[i]
        const x = padding + point.col * cellSize
        const y = padding + point.row * cellSize

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()
    }
  }

  const drawStar = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number,
  ) => {
    let rot = (Math.PI / 2) * 3
    const step = Math.PI / spikes

    ctx.beginPath()
    ctx.moveTo(x, y - outerRadius)

    for (let i = 0; i < spikes; i++) {
      const xOuter = x + Math.cos(rot) * outerRadius
      const yOuter = y + Math.sin(rot) * outerRadius
      ctx.lineTo(xOuter, yOuter)
      rot += step

      const xInner = x + Math.cos(rot) * innerRadius
      const yInner = y + Math.sin(rot) * innerRadius
      ctx.lineTo(xInner, yInner)
      rot += step
    }

    ctx.lineTo(x, y - outerRadius)
    ctx.closePath()
    ctx.fill()
  }

  const drawTriangle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath()
    ctx.moveTo(x, y - size)
    ctx.lineTo(x - size, y + size)
    ctx.lineTo(x + size, y + size)
    ctx.closePath()
    ctx.fill()
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const cellSize = 60
    const padding = 30

    const col = Math.round((x - padding) / cellSize)
    const row = Math.round((y - padding) / cellSize)

    if (row < 0 || row > gridSize || col < 0 || col > gridSize) return

    if (selectedTool !== "empty") {
      // Place symbol
      const newGrid = [...grid]
      if (newGrid[row][col].type === "start" || newGrid[row][col].type === "end") return

      const color =
        selectedTool === "dot" || selectedTool === "empty"
          ? undefined
          : colors[Math.floor(Math.random() * colors.length)]
      newGrid[row][col] = { type: selectedTool, color }
      setGrid(newGrid)
    } else {
      // Drawing mode - start or continue path
      if (!isDrawing) {
        setIsDrawing(true)
        setCurrentPath([{ row, col }])
      } else {
        const newPath = [...currentPath, { row, col }]
        setCurrentPath(newPath)
      }
    }
  }

  const finishPath = () => {
    if (currentPath.length < 2) {
      setIsDrawing(false)
      setCurrentPath([])
      return
    }

    // Convert path to lines
    const newLines = [...lines]

    for (let i = 0; i < currentPath.length - 1; i++) {
      const current = currentPath[i]
      const next = currentPath[i + 1]

      if (current.row === next.row) {
        // Horizontal line
        const minCol = Math.min(current.col, next.col)
        const lineIndex = newLines.findIndex(
          (line) => line.row === current.row && line.col === minCol && line.direction === "horizontal",
        )
        if (lineIndex !== -1) {
          newLines[lineIndex].active = true
        }
      } else if (current.col === next.col) {
        // Vertical line
        const minRow = Math.min(current.row, next.row)
        const lineIndex = newLines.findIndex(
          (line) => line.row === minRow && line.col === current.col && line.direction === "vertical",
        )
        if (lineIndex !== -1) {
          newLines[lineIndex].active = true
        }
      }
    }

    setLines(newLines)
    setIsDrawing(false)
    setCurrentPath([])
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            The Witness Panel Generator
            <Badge variant="secondary">Interactive</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Grid Size:</label>
              <Select value={gridSize.toString()} onValueChange={(value) => setGridSize(Number.parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3×3</SelectItem>
                  <SelectItem value="4">4×4</SelectItem>
                  <SelectItem value="5">5×5</SelectItem>
                  <SelectItem value="6">6×6</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Tool:</label>
              <Select value={selectedTool} onValueChange={(value) => setSelectedTool(value as CellType)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="empty">Draw Line</SelectItem>
                  <SelectItem value="dot">Dot</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="star">Star</SelectItem>
                  <SelectItem value="triangle">Triangle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={generateRandomPuzzle} variant="outline" size="sm">
              <Shuffle className="w-4 h-4 mr-2" />
              Random Puzzle
            </Button>

            <Button onClick={clearLines} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear Lines
            </Button>

            {isDrawing && (
              <Button onClick={finishPath} size="sm">
                <Check className="w-4 h-4 mr-2" />
                Finish Path
              </Button>
            )}
          </div>

          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="border border-gray-300 rounded-lg cursor-crosshair bg-white"
              style={{ imageRendering: "pixelated" }}
            />
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Instructions:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Select "Draw Line" tool and click on grid points to draw a path from start (green) to end (red)</li>
              <li>Use other tools to place puzzle symbols on the grid</li>
              <li>Generate random puzzles with the shuffle button</li>
              <li>
                In The Witness, different symbols have different rules (dots must be collected, squares group by color,
                etc.)
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
