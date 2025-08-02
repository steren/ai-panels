import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import PuzzleGrid from '@/react-app/components/PuzzleGrid';
import { usePanels } from '@/react-app/hooks/usePanels';
import { Panel } from '@/shared/types';

export default function PuzzlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPanel, submitSolution, loading, error } = usePanels();
  
  const [panel, setPanel] = useState<Panel | null>(null);
  
  const [solutionStatus, setSolutionStatus] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [solveTime, setSolveTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    if (id) {
      const panelId = parseInt(id);
      if (!isNaN(panelId)) {
        getPanel(panelId).then(setPanel);
        setStartTime(Date.now());
      }
    }
  }, [id, getPanel]);

  const handleSolutionComplete = async (path: Array<{x: number, y: number}>) => {
    if (!panel?.id) return;
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    setSolveTime(duration);
    
    
    
    const isValid = await submitSolution({
      panelId: panel.id,
      path,
      solveTime: duration,
    });
    
    setSolutionStatus(isValid ? 'correct' : 'incorrect');
  };

  const handleReset = () => {
    setSolutionStatus('none');
    setStartTime(Date.now());
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !panel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Panel Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested panel could not be loaded.'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Gallery
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">
              {panel.name || `Panel #${panel.id}`}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>Difficulty: {panel.difficulty}/10</span>
              <span>Size: {panel.grid.width}×{panel.grid.height}</span>
              <span>Symbols: {panel.symbols.length}</span>
            </div>
          </div>
          
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* Puzzle Container */}
        <div className="flex flex-col items-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <PuzzleGrid
              grid={panel.grid}
              symbols={panel.symbols}
              onSolutionComplete={handleSolutionComplete}
            />
          </div>

          {/* Status Display */}
          {solutionStatus !== 'none' && (
            <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg ${
              solutionStatus === 'correct' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {solutionStatus === 'correct' ? (
                <>
                  <CheckCircle className="w-6 h-6" />
                  <div>
                    <div className="font-semibold">Puzzle Solved!</div>
                    <div className="text-sm">Completed in {formatTime(solveTime)}</div>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6" />
                  <div>
                    <div className="font-semibold">Incorrect Solution</div>
                    <div className="text-sm">Try a different path</div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 max-w-2xl text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">How to Play</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <strong className="text-gray-800">Drawing Lines:</strong><br />
                Click and drag from the green start circle to draw a path to the red end square.
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <strong className="text-gray-800">Rules:</strong><br />
                Your path must be continuous and cannot pass through gray walls.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
