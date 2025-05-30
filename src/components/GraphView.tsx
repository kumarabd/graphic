import React, { useEffect, useRef, useCallback, memo } from 'react';
import { Paper, Typography, Button } from '@mui/material';
import CytoscapeComponent from 'react-cytoscapejs';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Stylesheet } from 'cytoscape';
import cytoscape from 'cytoscape';
import setupCy from '../setupCy';
import { useLayoutSelection } from '../hooks/useLayout';
import { useNodeSelection } from '../hooks/useNodeSelection';
import { useEdgeSelection } from '../hooks/useEdgeSelection';
import { useFilterKeys } from '../hooks/useFilterKeys';
import { useCytoscape } from '../context/CytoscapeContext';
import { GraphViewProps, LayoutType } from '../types';
// Using GraphViewProps from types

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <Paper 
      role="alert" 
      sx={{ 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 2 
      }}
    >
      <Typography variant="h6" color="error">Something went wrong:</Typography>
      <pre>{error.message}</pre>
      <Button variant="contained" onClick={resetErrorBoundary}>
        Try again
      </Button>
    </Paper>
  );
}

export const GraphView: React.FC<GraphViewProps> = memo(({ stylesheet, selectedLayout }) => {
  // Use the node and edge selection hooks instead of useGraphData
  const { nodeElements, hasElements, refreshNodes } = useNodeSelection();
  const { edgeElements, refreshEdges } = useEdgeSelection();
  const { setCyInstance, cyInstance, applyLayout, resetView } = useCytoscape();
  const prevElementsRef = useRef<any[]>([]);
  const { getLayoutConfig } = useLayoutSelection();
  
  // Fetch initial data when component mounts
  useEffect(() => {
    refreshNodes();
    refreshEdges();
  }, [refreshNodes, refreshEdges]);
  
  // Initialize Cytoscape extensions
  useEffect(() => {
    setupCy();
  }, []);

  // Handle layout and viewport updates
  const updateLayout = useCallback(() => {
    if (!cyInstance || (nodeElements.length === 0 && edgeElements.length === 0)) return;

    try {
      // Get the current layout configuration
      const layoutConfig = getLayoutConfig(selectedLayout);
      
      // Use the layout function from context
      cyInstance.layout(layoutConfig).run();
      cyInstance.center();
      cyInstance.fit();
      prevElementsRef.current = [...nodeElements, ...edgeElements];
    } catch (error) {
      console.error("Error in Cytoscape layout:", error);
    }
  }, [nodeElements, edgeElements, selectedLayout, getLayoutConfig, cyInstance]);

  // Apply layout when nodes, edges, or layout changes
  useEffect(() => {
    // Update the layout
    updateLayout();
  }, [nodeElements, edgeElements, selectedLayout, updateLayout]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (cyInstance) {
        cyInstance.resize();
        cyInstance.fit();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [cyInstance]);

  if (!hasElements) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading graph data...</Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        height: 'calc(100vh - 80px)', 
        flex: 1,
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'stretch',
        p: 0.5, 
        position: 'relative',
        minWidth: 0, 
        ml: 0.5 
      }}
    >
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <CytoscapeComponent
          elements={[...nodeElements,...edgeElements]}
          style={{
            width: '100%',
            height: '100%',
          }}
          layout={getLayoutConfig(selectedLayout)}
          stylesheet={stylesheet}
          cy={(cy) => { 
            // Pass the Cytoscape instance to the context
            // This will make it available to all components that use the context
            setCyInstance(cy);
          }}
          wheelSensitivity={0.2}
          minZoom={0.3}
          maxZoom={3}
        />
      </ErrorBoundary>
    </Paper>
  );
});
