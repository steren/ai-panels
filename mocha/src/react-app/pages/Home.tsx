import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Grid3x3, Sparkles, Play, Plus } from 'lucide-react';
import PanelGenerator from '@/react-app/components/PanelGenerator';
import PanelCard from '@/react-app/components/PanelCard';
import { usePanels } from '@/react-app/hooks/usePanels';

export default function Home() {
  const navigate = useNavigate();
  const { panels, loading, error, createPanel } = usePanels();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePanel = async (request: any) => {
    setIsGenerating(true);
    try {
      const newPanel = await createPanel(request);
      if (newPanel && newPanel.id) {
        navigate(`/puzzle/${newPanel.id}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPanel = (panel: any) => {
    navigate(`/puzzle/${panel.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Grid3x3 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              GridTrace
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Generate and solve beautiful Witness-style line puzzles. Draw continuous paths through grids filled with mysterious symbols.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Panel Generator */}
          <div className="lg:col-span-1">
            <PanelGenerator 
              onGenerate={handleGeneratePanel}
              isGenerating={isGenerating}
            />
          </div>

          {/* Panel Gallery */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Puzzle Gallery</h2>
              </div>

              {loading && panels.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-500 mb-2">Failed to load panels</div>
                  <div className="text-sm text-gray-500">{error}</div>
                </div>
              ) : panels.length === 0 ? (
                <div className="text-center py-12">
                  <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Panels Yet</h3>
                  <p className="text-gray-500 mb-4">Generate your first puzzle to get started!</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {panels.map((panel) => (
                    <PanelCard
                      key={panel.id}
                      panel={panel}
                      onClick={() => handlePlayPanel(panel)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-4">
              <Grid3x3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Procedural Generation</h3>
            <p className="text-gray-600">Create infinite unique puzzles with customizable difficulty and grid sizes.</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-4">
              <Play className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Interactive Solving</h3>
            <p className="text-gray-600">Draw paths with your mouse and get instant feedback on your solutions.</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-3 bg-pink-100 rounded-lg w-fit mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Beautiful Design</h3>
            <p className="text-gray-600">Enjoy clean, modern aesthetics inspired by The Witness game.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
