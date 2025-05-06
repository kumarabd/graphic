import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { Paper, Typography, Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState, selectFilteredElements, Node, Edge, NodeData, EdgeData } from '../store';
import CytoscapeComponent from 'react-cytoscapejs';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Stylesheet, ElementDefinition, NodeDataDefinition, EdgeDataDefinition } from 'cytoscape';
import cytoscape from 'cytoscape';
import setupCy from '../setupCy';
import { useLayoutSelection, LayoutType } from '../hooks/useLayoutSelection';

interface GraphViewProps {
  stylesheet: Stylesheet[];
  selectedLayout: LayoutType;
}

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

export const GraphView: React.FC<GraphViewProps> = ({ stylesheet, selectedLayout }) => {
  const allElements = useSelector(selectFilteredElements);
  const filters = useSelector((state: RootState) => state.graph.filters);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const prevElementsRef = useRef<typeof allElements>([]);
  const { getLayoutConfig } = useLayoutSelection();

  // Initialize Cytoscape extensions
  useEffect(() => {
    setupCy();
  }, []);

  // Convert filtered elements to Cytoscape format
  const cytoscapeElements = useMemo(() => {
    return allElements.map(element => {
      if ('source' in element.data) {
        // It's an edge
        const edgeData = element.data as EdgeData;
        return {
          group: 'edges' as const,
          data: {
            id: edgeData.id,
            source: edgeData.source,
            target: edgeData.target,
            type: edgeData.type,
            label: edgeData.label
          }
        };
      } else {
        // It's a node
        const nodeData = element.data as NodeData;
        return {
          group: 'nodes' as const,
          data: nodeData
        };
      }
    }) as ElementDefinition[];
  }, [allElements]);

  // Handle layout and viewport updates
  const updateLayout = useCallback(() => {
    if (!cyRef.current || allElements.length === 0) return;

    const cy = cyRef.current;
    try {
      // Get the current layout configuration
      const layoutConfig = getLayoutConfig(selectedLayout);
      
      cy.layout(layoutConfig).run();
      cy.center();
      cy.fit();
      prevElementsRef.current = allElements;
    } catch (error) {
      console.error("Error in Cytoscape layout:", error);
    }
  }, [allElements, selectedLayout, getLayoutConfig]);

  // Apply layout when elements, filters, or layout changes
  useEffect(() => {
    updateLayout();
  }, [allElements, filters, selectedLayout, updateLayout]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (cyRef.current) {
        cyRef.current.resize();
        cyRef.current.fit();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!allElements || allElements.length === 0) {
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
          elements={cytoscapeElements}
          style={{
            width: '100%',
            height: '100%',
          }}
          layout={getLayoutConfig(selectedLayout)}
          stylesheet={stylesheet}
          cy={(cy) => { cyRef.current = cy; }}
          wheelSensitivity={0.2}
          minZoom={0.3}
          maxZoom={3}
        />
      </ErrorBoundary>
    </Paper>
  );
};
