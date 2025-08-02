import { Panel } from '@/shared/types';
import { Clock, Star, Grid3x3 } from 'lucide-react';

interface PanelCardProps {
  panel: Panel;
  onClick: () => void;
}

export default function PanelCard({ panel, onClick }: PanelCardProps) {
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'text-green-600 bg-green-100';
    if (difficulty <= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getDifficultyText = (difficulty: number) => {
    if (difficulty <= 3) return 'Easy';
    if (difficulty <= 6) return 'Medium';
    return 'Hard';
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-100 p-4 cursor-pointer transition-all duration-200 hover:scale-105 hover:border-blue-200"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-800 truncate flex-1">
          {panel.name || `Panel #${panel.id}`}
        </h3>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(panel.difficulty)}`}>
          {getDifficultyText(panel.difficulty)}
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-1">
          <Grid3x3 className="w-4 h-4" />
          <span>{panel.grid.width}×{panel.grid.height}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4" />
          <span>{panel.symbols.length} symbols</span>
        </div>
      </div>
      
      {/* Mini preview of the grid */}
      <div className="bg-gray-50 rounded-lg p-2 mb-3">
        <div className="grid gap-px" style={{ 
          gridTemplateColumns: `repeat(${panel.grid.width}, 1fr)`,
          aspectRatio: `${panel.grid.width} / ${panel.grid.height}`
        }}>
          {panel.grid.cells.flat().map((cell, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-sm ${
                cell === 'wall' ? 'bg-gray-400' :
                cell === 'start' ? 'bg-green-400' :
                cell === 'end' ? 'bg-red-400' :
                'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>Click to solve</span>
        </div>
        <div className="flex -space-x-1">
          {panel.symbols.slice(0, 3).map((symbol, index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 border-white ${
                symbol.color === 'red' ? 'bg-red-400' :
                symbol.color === 'blue' ? 'bg-blue-400' :
                symbol.color === 'yellow' ? 'bg-yellow-400' :
                symbol.color === 'green' ? 'bg-green-400' :
                symbol.color === 'black' ? 'bg-gray-800' :
                'bg-gray-200'
              }`}
            />
          ))}
          {panel.symbols.length > 3 && (
            <div className="w-4 h-4 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center">
              <span className="text-xs text-gray-600">+</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
