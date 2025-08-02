import { useState, useEffect } from 'react';
import { Panel, CreatePanelRequest, SolutionRequest } from '@/shared/types';

export function usePanels() {
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPanels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/panels');
      
      if (!response.ok) {
        throw new Error('Failed to fetch panels');
      }
      
      const data = await response.json();
      setPanels(data.panels);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createPanel = async (request: CreatePanelRequest): Promise<Panel | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/panels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create panel');
      }
      
      const data = await response.json();
      await fetchPanels(); // Refresh the list
      return data.panel;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getPanel = async (id: number): Promise<Panel | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/panels/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch panel');
      }
      
      const data = await response.json();
      return data.panel;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const submitSolution = async (solution: SolutionRequest): Promise<boolean> => {
    try {
      setError(null);
      const response = await fetch('/api/solutions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(solution),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit solution');
      }
      
      const data = await response.json();
      return data.valid;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  };

  useEffect(() => {
    fetchPanels();
  }, []);

  return {
    panels,
    loading,
    error,
    fetchPanels,
    createPanel,
    getPanel,
    submitSolution,
  };
}
