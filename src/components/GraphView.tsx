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
  const filters = useSelector((state: RootState) => state.graph.selections);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const prevElementsRef = useRef<typeof allElements>([]);
  const { getLayoutConfig } = useLayoutSelection();

  // Initialize Cytoscape extensions
  useEffect(() => {
    setupCy();
  }, []);

  // Filter elements based on selections
  const elements = allElements.filter(element => {
    if ('source' in element.data) {
      // For edges, show only if both source and target nodes are visible
      const sourceNode = allElements.find(el => !('source' in el.data) && el.data.id === (element.data as EdgeData).source);
      const targetNode = allElements.find(el => !('source' in el.data) && el.data.id === (element.data as EdgeData).target);
      
      if (!sourceNode || !targetNode) return false;
      
      const sourceType = (sourceNode.data as NodeData).type;
      const targetType = (targetNode.data as NodeData).type;

      // Check if source node is visible
      const isSourceVisible = 
        sourceType === 'parent' ||
        (sourceType === 'subject' && (filters.subjects.length === 0 || filters.subjects.includes((element.data as EdgeData).source))) ||
        (sourceType === 'resource' && (filters.resources.length === 0 || filters.resources.includes((element.data as EdgeData).source))) ||
        (sourceType === 'subject_attribute' && (filters.subjectAttributes.length === 0 || filters.subjectAttributes.includes((element.data as EdgeData).source))) ||
        (sourceType === 'resource_attribute' && (filters.resourceAttributes.length === 0 || filters.resourceAttributes.includes((element.data as EdgeData).source)));

      // Check if target node is visible
      const isTargetVisible = 
        targetType === 'parent' ||
        (targetType === 'subject' && (filters.subjects.length === 0 || filters.subjects.includes((element.data as EdgeData).target))) ||
        (targetType === 'resource' && (filters.resources.length === 0 || filters.resources.includes((element.data as EdgeData).target))) ||
        (targetType === 'subject_attribute' && (filters.subjectAttributes.length === 0 || filters.subjectAttributes.includes((element.data as EdgeData).target))) ||
        (targetType === 'resource_attribute' && (filters.resourceAttributes.length === 0 || filters.resourceAttributes.includes((element.data as EdgeData).target)));

      // Only show edge if both nodes are visible
      return isSourceVisible && isTargetVisible;
    } else {
      // For nodes
      const nodeData = element.data as NodeData;
      const entityType = nodeData.type;

      // Always show parent nodes
      if (entityType === 'parent') return true;
      
      // Show all nodes of a type if no selections are made for that type
      return (
        (entityType === 'subject' && (filters.subjects.length === 0 || filters.subjects.includes(nodeData.id))) ||
        (entityType === 'resource' && (filters.resources.length === 0 || filters.resources.includes(nodeData.id))) ||
        (entityType === 'subject_attribute' && (filters.subjectAttributes.length === 0 || filters.subjectAttributes.includes(nodeData.id))) ||
        (entityType === 'resource_attribute' && (filters.resourceAttributes.length === 0 || filters.resourceAttributes.includes(nodeData.id)))
      );
    }
  });

  // Convert filtered elements to Cytoscape format
  const cytoscapeElements = useMemo(() => {
    return elements.map(element => {
      if ('source' in element.data) {
        // It's an edge
        return {
          group: 'edges' as const,
          data: element.data as EdgeDataDefinition
        };
      } else {
        // It's a node
        return {
          group: 'nodes' as const,
          data: element.data as NodeDataDefinition
        };
      }
    }) as ElementDefinition[];
  }, [elements]);

  // Handle layout and viewport updates
  const updateLayout = useCallback(() => {
    if (!cyRef.current || elements.length === 0) return;

    const cy = cyRef.current;
    try {
      // Get the current layout configuration
      const layoutConfig = getLayoutConfig(selectedLayout);
      
      cy.layout(layoutConfig).run();
      cy.center();
      cy.fit();
      prevElementsRef.current = elements;
    } catch (error) {
      console.error("Error in Cytoscape layout:", error);
    }
  }, [elements, selectedLayout, getLayoutConfig]);

  // Apply layout when elements, filters, or layout changes
  useEffect(() => {
    updateLayout();
  }, [elements, filters, selectedLayout, updateLayout]);

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
