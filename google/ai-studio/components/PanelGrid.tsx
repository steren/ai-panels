
import React, { useState, useRef, useCallback } from 'react';
import type { PuzzleDefinition, Point } from '../types';
import { PuzzleElementType } from '../types';
import { PANEL_SIZE, NODE_RADIUS, PATH_WIDTH, END_NUB_SIZE } from '../constants';
import { BlackSquareIcon, WhiteSquareIcon, HexagonIcon } from './Icons';

interface PanelGridProps {
  puzzle: PuzzleDefinition;
  isSolved: boolean;
  onSolveAttempt: (path: Point[]) => void;
}

export const PanelGrid: React.FC<PanelGridProps> = ({ puzzle, isSolved, onSolveAttempt }) => {
  const { gridSize, start, end, elements } = puzzle;
  const [userPath, setUserPath] = useState<Point[]>([start]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const cellSize = PANEL_SIZE / (gridSize - 1);

  const pointToSvg = (p: Point) => ({
    x: p.x * cellSize,
    y: p.y * cellSize,
  });

  const svgToPoint = (svgX: number, svgY: number): Point => {
    const x = Math.round(svgX / cellSize);
    const y = Math.round(svgY / cellSize);
    return { x, y };
  };
  
  const getPathData = (path: Point[]) => {
    if (path.length === 0) return '';
    const startPoint = pointToSvg(path[0]);
    let data = `M ${startPoint.x} ${startPoint.y}`;
    for (let i = 1; i < path.length; i++) {
      const p = pointToSvg(path[i]);
      data += ` L ${p.x} ${p.y}`;
    }
    return data;
  };
  
  const resetPath = useCallback(() => {
    setUserPath([start]);
    setIsInvalid(false);
  }, [start]);

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isSolved) return;
    const svgPoint = svgRef.current?.createSVGPoint();
    if (!svgPoint) return;

    svgPoint.x = e.clientX;
    svgPoint.y = e.clientY;

    const cursorpt = svgPoint.matrixTransform(svgRef.current?.getScreenCTM()?.inverse());
    const nearestNode = svgToPoint(cursorpt.x, cursorpt.y);

    if (nearestNode.x === start.x && nearestNode.y === start.y) {
      resetPath();
      setIsDrawing(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || isSolved) return;
    const svgPoint = svgRef.current?.createSVGPoint();
     if (!svgPoint) return;
    svgPoint.x = e.clientX;
    svgPoint.y = e.clientY;
    const cursorpt = svgPoint.matrixTransform(svgRef.current?.getScreenCTM()?.inverse());
    
    const nearestNode = svgToPoint(cursorpt.x, cursorpt.y);
    const lastPoint = userPath[userPath.length - 1];

    if (nearestNode.x === lastPoint.x && nearestNode.y === lastPoint.y) return;

    const dx = Math.abs(nearestNode.x - lastPoint.x);
    const dy = Math.abs(nearestNode.y - lastPoint.y);

    if (dx + dy === 1) { // Is adjacent
      if (!userPath.some(p => p.x === nearestNode.x && p.y === nearestNode.y)) {
         setUserPath(prev => [...prev, nearestNode]);
      } else if (userPath.length > 1 && nearestNode.x === userPath[userPath.length-2].x && nearestNode.y === userPath[userPath.length-2].y){
        // allow moving back
        setUserPath(prev => prev.slice(0, -1));
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const lastPoint = userPath[userPath.length - 1];
    if (lastPoint.x === end.x && lastPoint.y === end.y) {
      onSolveAttempt(userPath);
    } else {
        setIsInvalid(true);
        setTimeout(() => resetPath(), 500);
    }
  };
  
  const startPos = pointToSvg(start);
  const endPos = pointToSvg(end);
  const pathData = getPathData(userPath);
  const pathHead = userPath.length > 0 ? pointToSvg(userPath[userPath.length - 1]) : startPos;

  return (
    <svg
      ref={svgRef}
      viewBox={`-${PANEL_SIZE * 0.1} -${PANEL_SIZE * 0.1} ${PANEL_SIZE * 1.2} ${PANEL_SIZE * 1.2}`}
      width="100%"
      height="100%"
      className="bg-slate-800 rounded-lg shadow-2xl cursor-pointer"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Grid Lines */}
      <g className="stroke-slate-600/50" strokeWidth="2">
        {Array.from({ length: gridSize }).map((_, i) => (
          <path key={`h-${i}`} d={`M 0 ${i * cellSize} H ${PANEL_SIZE}`} />
        ))}
        {Array.from({ length: gridSize }).map((_, i) => (
          <path key={`v-${i}`} d={`M ${i * cellSize} 0 V ${PANEL_SIZE}`} />
        ))}
      </g>
      
      {/* Puzzle Elements */}
      <g>
        {elements.map((el, i) => {
          if (el.type === PuzzleElementType.Hexagon) {
            const pos = pointToSvg(el.position);
            return <HexagonIcon key={i} cx={pos.x} cy={pos.y} cellSize={cellSize} />;
          }
          const cellPos = pointToSvg(el.position);
          const cx = cellPos.x + cellSize / 2;
          const cy = cellPos.y + cellSize / 2;
          if (el.type === PuzzleElementType.BlackSquare) {
            return <BlackSquareIcon key={i} cx={cx} cy={cy} cellSize={cellSize} />;
          }
          if (el.type === PuzzleElementType.WhiteSquare) {
            return <WhiteSquareIcon key={i} cx={cx} cy={cy} cellSize={cellSize} />;
          }
          return null;
        })}
      </g>
      
      {/* User Path Background */}
       <path d={pathData} className={`stroke-blue-900/50 ${isSolved ? 'opacity-0' : ''}`} strokeWidth={PATH_WIDTH + 8} strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* User Path */}
      <path
        d={pathData}
        className={`transition-all duration-300 ${isSolved ? 'stroke-yellow-400' : 'stroke-cyan-400'} ${isInvalid ? '!stroke-red-500' : ''}`}
        strokeWidth={PATH_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {isSolved && (
            <animate attributeName="stroke-width" values={`${PATH_WIDTH};${PATH_WIDTH+6};${PATH_WIDTH}`} dur="1s" repeatCount="indefinite" />
        )}
      </path>

      {/* Path Head */}
      {!isSolved && isDrawing && <circle cx={pathHead.x} cy={pathHead.y} r={PATH_WIDTH/2 + 2} className="fill-cyan-300" />}

      {/* Start and End points */}
      <circle cx={startPos.x} cy={startPos.y} r={NODE_RADIUS} className="fill-cyan-400" />
      <path
        d={`M ${endPos.x - END_NUB_SIZE / 2},${endPos.y} a ${END_NUB_SIZE/2},${END_NUB_SIZE/2} 0 0 1 ${END_NUB_SIZE},0`}
        stroke={isSolved ? 'yellow' : 'cyan'}
        strokeWidth="6"
        fill="none"
        transform={`rotate(${end.x === 0 ? -90 : end.x === gridSize - 1 ? 90 : end.y === 0 ? 0 : 180} ${endPos.x} ${endPos.y})`}
       />
    </svg>
  );
};
