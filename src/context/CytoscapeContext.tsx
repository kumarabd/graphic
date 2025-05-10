import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import cytoscape from 'cytoscape';

// Create a context for the Cytoscape instance with enhanced functionality
interface CytoscapeContextType {
  // Core instance
  cyInstance: cytoscape.Core | null;
  setCyInstance: (cy: cytoscape.Core) => void;
  
  // Utility functions
  resetView: () => void;
  applyLayout: (layoutName: string, layoutConfig?: any) => void;
  forceRender: () => void;
  isReady: boolean;
}

const CytoscapeContext = createContext<CytoscapeContextType>({
  cyInstance: null,
  setCyInstance: () => {},
  resetView: () => {},
  applyLayout: () => {},
  forceRender: () => {},
  isReady: false
});

// Provider component with enhanced functionality
export const CytoscapeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cyInstance, setCyInstance] = useState<cytoscape.Core | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  // Set up the Cytoscape instance and mark it as ready
  const handleSetCyInstance = useCallback((cy: cytoscape.Core) => {
    console.log('Cytoscape instance initialized in context');
    setCyInstance(cy);
    setIsReady(true);
  }, []);
  
  // Reset the view (center and fit)
  const resetView = useCallback(() => {
    if (!cyInstance) return;
    cyInstance.center();
    cyInstance.fit();
  }, [cyInstance]);
  
  // Apply a layout to the graph
  const applyLayout = useCallback((layoutName: string, layoutConfig: any = {}) => {
    if (!cyInstance) return;
    try {
      const layout = cyInstance.layout({
        name: layoutName,
        ...layoutConfig
      });
      layout.run();
    } catch (error) {
      console.error('Error applying layout:', error);
    }
  }, [cyInstance]);
  
  // Force a re-render of the graph
  const forceRender = useCallback(() => {
    if (!cyInstance) return;
    cyInstance.forceRender();
  }, [cyInstance]);
  
  // Clean up the Cytoscape instance when the provider is unmounted
  useEffect(() => {
    return () => {
      if (cyInstance) {
        console.log('Destroying Cytoscape instance');
        cyInstance.destroy();
      }
    };
  }, [cyInstance]);

  return (
    <CytoscapeContext.Provider value={{
      cyInstance,
      setCyInstance: handleSetCyInstance,
      resetView,
      applyLayout,
      forceRender,
      isReady
    }}>
      {children}
    </CytoscapeContext.Provider>
  );
};

// Custom hook to use the Cytoscape context
export const useCytoscape = () => useContext(CytoscapeContext);
