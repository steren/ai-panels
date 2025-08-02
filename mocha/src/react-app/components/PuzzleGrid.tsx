import { useState, useRef, useEffect } from 'react';
import { Grid, Symbol } from '@/shared/types';

interface PuzzleGridProps {
  grid: Grid;
  symbols: Symbol[];
  onSolutionComplete?: (path: Array<{x: number, y: number}>) => void;
  showSolution?: boolean;
  solutionPath?: Array<{x: number, y: number}>;
}

export default function PuzzleGrid({ 
  grid, 
  symbols, 
  onSolutionComplete, 
  showSolution = false, 
  solutionPath = [] 
}: PuzzleGridProps) {
  const [currentPath, setCurrentPath] = useState<Array<{x: number, y: number}>>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const cellSize = 40;
  const padding = 20;
  const svgWidth = grid.width * cellSize + padding * 2;
  const svgHeight = grid.height * cellSize + padding * 2;

  // Get cell center coordinates
  const getCellCenter = (x: number, y: number) => ({
    x: padding + x * cellSize + cellSize / 2,
    y: padding + y * cellSize + cellSize / 2,
  });

  // Check if coordinates are close to a grid point
  const getGridPoint = (clientX: number, clientY: number) => {
    if (!svgRef.current) return null;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const gridX = Math.round((x - padding) / cellSize);
    const gridY = Math.round((y - padding) / cellSize);
    
    if (gridX >= 0 && gridX < grid.width && gridY >= 0 && gridY < grid.height) {
      const center = getCellCenter(gridX, gridY);
      const distance = Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2);
      
      if (distance < cellSize / 3) {
        return { x: gridX, y: gridY };
      }
    }
    
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const point = getGridPoint(e.clientX, e.clientY);
    if (point && point.x === grid.startX && point.y === grid.startY) {
      setIsDrawing(true);
      setCurrentPath([point]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    
    const point = getGridPoint(e.clientX, e.clientY);
    if (point && currentPath.length > 0) {
      const lastPoint = currentPath[currentPath.length - 1];
      
      // Check if the new point is adjacent to the last point
      const dx = Math.abs(point.x - lastPoint.x);
      const dy = Math.abs(point.y - lastPoint.y);
      
      if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        // Check if the cell is not a wall
        if (grid.cells[point.y][point.x] !== 'wall') {
          // Avoid duplicates
          if (!currentPath.some(p => p.x === point.x && p.y === point.y)) {
            setCurrentPath(prev => [...prev, point]);
          }
        }
      }
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentPath.length > 1) {
      const lastPoint = currentPath[currentPath.length - 1];
      
      // Check if we reached the end point
      if (lastPoint.x === grid.endX && lastPoint.y === grid.endY) {
        onSolutionComplete?.(currentPath);
      }
    }
    
    setIsDrawing(false);
  };

  // Reset path when grid changes
  useEffect(() => {
    setCurrentPath([]);
    setIsDrawing(false);
  }, [grid]);

  // Render symbol component
  const renderSymbol = (symbol: Symbol, key: number) => {
    const center = getCellCenter(symbol.x, symbol.y);
    const symbolSize = cellSize * 0.6;
    
    const getSymbolColor = (color: string) => {
      const colors = {
        white: '#ffffff',
        black: '#000000',
        red: '#ef4444',
        blue: '#3b82f6',
        yellow: '#eab308',
        green: '#22c55e',
        orange: '#f97316',
        purple: '#a855f7',
      };
      return colors[color as keyof typeof colors] || '#64748b';
    };

    switch (symbol.type) {
      case 'dot':
        return (
          <circle
            key={key}
            cx={center.x}
            cy={center.y}
            r={symbolSize / 6}
            fill={getSymbolColor(symbol.color || 'white')}
            stroke="#1f2937"
            strokeWidth="1"
          />
        );
      
      case 'square':
        return (
          <rect
            key={key}
            x={center.x - symbolSize / 4}
            y={center.y - symbolSize / 4}
            width={symbolSize / 2}
            height={symbolSize / 2}
            fill={getSymbolColor(symbol.color || 'white')}
            stroke="#1f2937"
            strokeWidth="1"
          />
        );
      
      case 'hexagon':
        const hexPoints = [];
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const x = center.x + (symbolSize / 4) * Math.cos(angle);
          const y = center.y + (symbolSize / 4) * Math.sin(angle);
          hexPoints.push(`${x},${y}`);
        }
        return (
          <polygon
            key={key}
            points={hexPoints.join(' ')}
            fill={getSymbolColor(symbol.color || 'white')}
            stroke="#1f2937"
            strokeWidth="1"
          />
        );
      
      default:
        return null;
    }
  };

  // Render path line
  const renderPath = (path: Array<{x: number, y: number}>, isCurrentPath = false) => {
    if (path.length < 2) return null;
    
    const pathData = path.map((point, index) => {
      const center = getCellCenter(point.x, point.y);
      return `${index === 0 ? 'M' : 'L'} ${center.x} ${center.y}`;
    }).join(' ');

    return (
      <path
        d={pathData}
        stroke={isCurrentPath ? '#3b82f6' : '#22c55e'}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  };

  return (
    <div className="flex flex-col items-center">
      <svg
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        className="border border-gray-300 rounded-lg bg-gray-50 cursor-crosshair select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid background */}
        <defs>
          <pattern id="grid" width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
            <path d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`} fill="none" stroke="#e5e7eb" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Grid cells */}
        {grid.cells.map((row, y) =>
          row.map((cell, x) => {
            const center = getCellCenter(x, y);
            
            if (cell === 'wall') {
              return (
                <rect
                  key={`${x}-${y}`}
                  x={padding + x * cellSize + 2}
                  y={padding + y * cellSize + 2}
                  width={cellSize - 4}
                  height={cellSize - 4}
                  fill="#374151"
                  rx="2"
                />
              );
            }
            
            if (cell === 'start') {
              return (
                <circle
                  key={`${x}-${y}`}
                  cx={center.x}
                  cy={center.y}
                  r="8"
                  fill="#22c55e"
                  stroke="#166534"
                  strokeWidth="2"
                />
              );
            }
            
            if (cell === 'end') {
              return (
                <rect
                  key={`${x}-${y}`}
                  x={center.x - 8}
                  y={center.y - 8}
                  width="16"
                  height="16"
                  fill="#ef4444"
                  stroke="#991b1b"
                  strokeWidth="2"
                  rx="2"
                />
              );
            }
            
            return null;
          })
        )}
        
        {/* Symbols */}
        {symbols.map((symbol, index) => renderSymbol(symbol, index))}
        
        {/* Solution path (if showing solution) */}
        {showSolution && solutionPath.length > 0 && renderPath(solutionPath, false)}
        
        {/* Current drawing path */}
        {renderPath(currentPath, true)}
      </svg>
      
      <div className="mt-4 text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
            <span>End</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-600 rounded-sm"></div>
            <span>Wall</span>
          </div>
        </div>
      </div>
    </div>
  );
}
