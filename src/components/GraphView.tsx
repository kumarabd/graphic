import React, { useEffect, useRef } from 'react';
import { Paper, Typography, Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState, Node, Edge, NodeData, EdgeData } from '../store';
import CytoscapeComponent from 'react-cytoscapejs';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Stylesheet } from 'cytoscape';
import cytoscape from 'cytoscape';
import setupCy from '../setupCy';

interface GraphViewProps {
  layout: any;
  stylesheet: Stylesheet[];
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

export const GraphView: React.FC<GraphViewProps> = ({ layout, stylesheet }) => {
  const allElements = useSelector((state: RootState) => state.graph.elements);
  const filters = useSelector((state: RootState) => state.graph.filters);
  const cyRef = useRef<cytoscape.Core | null>(null);

  // Initialize Cytoscape extensions
  useEffect(() => {
    setupCy();
  }, []);

  // Apply filters to elements
  const elements = allElements.filter(element => {
    if ('source' in element.data) {
      // For edges, check if both source and target nodes are visible
      const sourceNode = allElements.find(e => !('source' in e.data) && e.data.id === (element.data as EdgeData).source) as Node | undefined;
      const targetNode = allElements.find(e => !('source' in e.data) && e.data.id === (element.data as EdgeData).target) as Node | undefined;
      
      if (!sourceNode || !targetNode) return false;
      
      const sourceType = (sourceNode.data as NodeData).entity_type;
      const targetType = (targetNode.data as NodeData).entity_type;
      
      const isSourceVisible = (
        (sourceType === 'subject' && filters.showSubjects) ||
        (sourceType === 'resource' && filters.showResources) ||
        (sourceType === 'subject_attribute' && filters.showSubjectAttributes) ||
        (sourceType === 'resource_attribute' && filters.showResourceAttributes)
      );
      
      const isTargetVisible = (
        (targetType === 'subject' && filters.showSubjects) ||
        (targetType === 'resource' && filters.showResources) ||
        (targetType === 'subject_attribute' && filters.showSubjectAttributes) ||
        (targetType === 'resource_attribute' && filters.showResourceAttributes)
      );
      
      return isSourceVisible && isTargetVisible;
    } else {
      // For nodes
      const nodeData = element.data as NodeData;
      const entityType = nodeData.entity_type;
      if (!entityType) return true; // Keep parent nodes
      
      return (
        (entityType === 'subject' && filters.showSubjects) ||
        (entityType === 'resource' && filters.showResources) ||
        (entityType === 'subject_attribute' && filters.showSubjectAttributes) ||
        (entityType === 'resource_attribute' && filters.showResourceAttributes)
      );
    }
  });

  useEffect(() => {
    if (cyRef.current && elements.length > 0) {
      const cy = cyRef.current;
      try {
        cy.layout(layout).run();
        cy.center();
        cy.fit();
        // Set initial zoom level for better readability
        const centerPos = (cy.center() as unknown) as { x: number; y: number };
        cy.zoom({
          level: 1.2, // Slightly zoomed in for better readability
          position: centerPos
        });
      } catch (error) {
        console.error("Error in Cytoscape layout:", error);
      }
    }
  }, [elements, layout]);

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

  if (!elements || elements.length === 0) {
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
          elements={elements}
          style={{
            width: '100%',
            height: '100%',
          }}
          layout={layout}
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
