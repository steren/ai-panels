
import React, { useState, useEffect, useCallback } from 'react';
import type { PuzzleDefinition, Point, GridSize } from './types';
import { PuzzleElementType } from './types';
import { generatePuzzle } from './services/geminiService';
import { PanelGrid } from './components/PanelGrid';

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center w-full h-full">
        <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

const App: React.FC = () => {
    const [puzzle, setPuzzle] = useState<PuzzleDefinition | null>(null);
    const [isSolved, setIsSolved] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [gridSize, setGridSize] = useState<GridSize>(5);
    const [error, setError] = useState<string | null>(null);

    const fetchPuzzle = useCallback(async (size: GridSize) => {
        setIsLoading(true);
        setIsSolved(false);
        setError(null);
        setPuzzle(null);
        try {
            const newPuzzle = await generatePuzzle(size);
            setPuzzle(newPuzzle);
        } catch (err) {
            setError('Failed to generate a puzzle. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPuzzle(gridSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gridSize]);

    const validateSolution = (path: Point[], puzzleDef: PuzzleDefinition): boolean => {
        const { elements } = puzzleDef;
        const size = puzzleDef.gridSize;

        // 1. Hexagon Rule: path must visit all hexagons
        const hexagons = elements.filter(el => el.type === PuzzleElementType.Hexagon);
        for (const hex of hexagons) {
            if (!path.some(p => p.x === hex.position.x && p.y === hex.position.y)) {
                return false;
            }
        }

        // 2. Separation Rule: path must separate black and white squares
        const squares = elements.filter(el => el.type !== PuzzleElementType.Hexagon);
        if (squares.length === 0) return true; // No squares to separate

        const walls = new Set<string>();
        for (let i = 0; i < path.length - 1; i++) {
            const p1 = path[i];
            const p2 = path[i+1];
            const key = [p1.x, p1.y, p2.x, p2.y].sort().join(',');
            walls.add(key);
        }

        const regions: Map<string, number> = new Map();
        let regionId = 1;

        for (let y = 0; y < size - 1; y++) {
            for (let x = 0; x < size - 1; x++) {
                const cellKey = `${x},${y}`;
                if (regions.has(cellKey)) continue;

                const q: Point[] = [{x, y}];
                regions.set(cellKey, regionId);

                while(q.length > 0) {
                    const curr = q.shift()!;
                    
                    // Neighbors: up, down, left, right
                    const neighbors = [
                        { p: { x: curr.x, y: curr.y - 1 }, wall: [[curr.x, curr.y], [curr.x+1, curr.y]] }, // up
                        { p: { x: curr.x, y: curr.y + 1 }, wall: [[curr.x, curr.y+1], [curr.x+1, curr.y+1]] }, // down
                        { p: { x: curr.x - 1, y: curr.y }, wall: [[curr.x, curr.y], [curr.x, curr.y+1]] }, // left
                        { p: { x: curr.x + 1, y: curr.y }, wall: [[curr.x+1, curr.y], [curr.x+1, curr.y+1]] }, // right
                    ];

                    for (const { p, wall } of neighbors) {
                        if (p.x >= 0 && p.x < size - 1 && p.y >= 0 && p.y < size - 1) {
                            const neighborKey = `${p.x},${p.y}`;
                            if (!regions.has(neighborKey)) {
                                const wallKey = [wall[0][0], wall[0][1], wall[1][0], wall[1][1]].sort().join(',');
                                if (!walls.has(wallKey)) {
                                    regions.set(neighborKey, regionId);
                                    q.push(p);
                                }
                            }
                        }
                    }
                }
                regionId++;
            }
        }

        const regionColors: Map<number, Set<PuzzleElementType>> = new Map();
        for(const square of squares) {
            const key = `${square.position.x},${square.position.y}`;
            const rId = regions.get(key);
            if(rId) {
                if(!regionColors.has(rId)) regionColors.set(rId, new Set());
                regionColors.get(rId)!.add(square.type);
            }
        }
        
        for (const colors of regionColors.values()) {
            if (colors.has(PuzzleElementType.BlackSquare) && colors.has(PuzzleElementType.WhiteSquare)) {
                return false;
            }
        }
        
        return true;
    };
    
    const handleSolveAttempt = (path: Point[]) => {
        if (!puzzle) return;
        const isValid = validateSolution(path, puzzle);
        setIsSolved(isValid);
        if(!isValid) {
          // The PanelGrid component will handle temporary error display
        }
    };
    
    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans">
            <header className="text-center mb-6">
                <h1 className="text-4xl md:text-5xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                    The Witness Panel Generator
                </h1>
                <p className="text-slate-400 mt-2">AI-powered puzzle generation.</p>
            </header>

            <div className="w-full max-w-2xl aspect-square mb-6">
                {isLoading && <div className="bg-slate-800 rounded-lg shadow-2xl w-full h-full flex items-center justify-center"><LoadingSpinner /></div>}
                {error && <div className="bg-red-900/50 border border-red-500 rounded-lg w-full h-full flex items-center justify-center p-4"><p>{error}</p></div>}
                {puzzle && !isLoading && (
                   <PanelGrid puzzle={puzzle} isSolved={isSolved} onSolveAttempt={handleSolveAttempt} />
                )}
            </div>

            <footer className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-slate-300">Grid Size:</span>
                    {[5, 7].map(size => (
                        <button key={size} onClick={() => setGridSize(size as GridSize)} 
                            className={`px-4 py-2 rounded-md transition-colors duration-200 ${gridSize === size ? 'bg-cyan-500 text-white font-bold' : 'bg-slate-700 hover:bg-slate-600'}`}
                            disabled={isLoading}>
                            {size}x{size}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => fetchPuzzle(gridSize)}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-md text-lg font-semibold transition-transform duration-200 active:scale-95 shadow-lg"
                >
                    {isLoading ? 'Generating...' : 'New Puzzle'}
                </button>
            </footer>
        </div>
    );
};

export default App;
