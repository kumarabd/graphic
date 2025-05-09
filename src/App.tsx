import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ThemeProvider, createTheme, useMediaQuery } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { GraphView } from './components/GraphView';
import { RootState, AppDispatch } from './store';
import { Node, Edge, LayoutType } from './types';
import { Stylesheet } from 'cytoscape';
import { fetchGraphDataThunk } from './fetchGraphData';
import { GraphProvider } from './context/GraphContext';

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<'light' | 'dark'>(prefersDarkMode ? 'dark' : 'light');
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('elk_layered');
  const { loading } = useSelector((state: RootState) => state.graph);

  // Fetch data on initial render
  useEffect(() => {
    dispatch(fetchGraphDataThunk());
  }, [dispatch]);

  const toggleTheme = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  // Create theme with custom scrollbar styles
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'dark' ? '#90caf9' : '#1976d2',
          },
          background: {
            default: mode === 'dark' ? '#121212' : '#f5f5f5',
            paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
          },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              '*::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
              },
              '*::-webkit-scrollbar-thumb': {
                borderRadius: 8,
                backgroundColor: mode === 'dark' ? '#6b6b6b' : '#959595',
                minHeight: 24,
              },
              '*::-webkit-scrollbar-track': {
                backgroundColor: mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
              },
            },
          },
        },
      }),
    [mode],
  );

  // Get default stylesheet based on theme
  const stylesheet = useMemo(() => getDefaultStylesheet(mode === 'dark'), [mode]);

  const handleLayoutChange = (layout: LayoutType) => {
    setCurrentLayout(layout);
  };

  // Get nodes and edges from Redux store for initial state
  const nodes = useSelector((state: RootState) => state.graph.nodes);
  const edges = useSelector((state: RootState) => state.graph.edges);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}>
        <Header onToggleTheme={toggleTheme} />
        <GraphProvider 
          initialNodes={nodes} 
          initialEdges={edges} 
          initialLayout={currentLayout} 
          initialStylesheet={stylesheet}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            flexGrow: 1,
            gap: 2,
            p: 2,
          }}>
            <ControlPanel onLayoutChange={handleLayoutChange} />
            <Box sx={{ flexGrow: 1 }}>
              <GraphView stylesheet={stylesheet} selectedLayout={currentLayout} />
            </Box>
          </Box>
        </GraphProvider>
      </Box>
    </ThemeProvider>
  );
}

function getDefaultStylesheet(isDarkMode: boolean): Stylesheet[] {
  const colors = {
    background: isDarkMode ? '#1e1e1e' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#000000',
    entity: {
      subject: {
        bg: isDarkMode ? '#7c3aed' : '#8b5cf6', // Vibrant purple
        text: '#ffffff'
      },
      resource: {
        bg: isDarkMode ? '#059669' : '#10b981', // Fresh green
        text: '#ffffff'
      },
      subject_attribute: {
        bg: isDarkMode ? '#db2777' : '#ec4899', // Bright pink
        text: '#ffffff'
      },
      resource_attribute: {
        bg: isDarkMode ? '#0284c7' : '#0ea5e9', // Sky blue
        text: '#ffffff'
      },
      parent: {
        bg: isDarkMode ? 'rgba(71, 85, 105, 0.1)' : 'rgba(241, 245, 249, 0.8)',
        border: isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(71, 85, 105, 0.2)',
        text: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
      }
    },
    edge: {
      line: isDarkMode ? 'rgba(148, 163, 184, 0.5)' : 'rgba(71, 85, 105, 0.4)',
      text: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      highlight: isDarkMode ? '#60a5fa' : '#3b82f6'
    }
  };

  return [
    {
      selector: 'node',
      style: {
        'label': 'data(label)' as any,
        'text-valign': 'center' as any,
        'text-halign': 'center' as any,
        'font-size': '11px',
        'font-weight': '500',
        'font-family': 'system-ui, sans-serif',
        'width': '35px',
        'height': '35px',
        'padding': '5px',
        'background-color': colors.background,
        'color': colors.text,
        'text-wrap': 'wrap' as any,
        'text-max-width': '80px',
        'border-width': '1px',
        'border-color': 'transparent',
        'transition-property': 'background-color, border-color, border-width',
        'transition-duration': '0.2s',
      }
    },
    {
      selector: 'node[type = "parent"]',
      style: {
        'background-color': colors.entity.parent.bg,
        'border-color': colors.entity.parent.border,
        'border-width': '1px',
        'shape': 'roundrectangle' as any,
        'text-valign': 'top' as any,
        'text-halign': 'center' as any,
        'font-weight': '600',
        'font-size': '12px',
        'color': colors.entity.parent.text,
        'padding': '15px',
        'text-margin-y': '5px',
      }
    },
    {
      selector: 'node[type = "subject"]',
      style: {
        'background-color': colors.entity.subject.bg,
        'color': colors.entity.subject.text,
        'shape': 'ellipse' as any,
      }
    },
    {
      selector: 'node[type = "resource"]',
      style: {
        'background-color': colors.entity.resource.bg,
        'color': colors.entity.resource.text,
        'shape': 'round-rectangle' as any,
      }
    },
    {
      selector: 'node[type = "subject_attribute"]',
      style: {
        'background-color': colors.entity.subject_attribute.bg,
        'color': colors.entity.subject_attribute.text,
        'shape': 'diamond' as any,
      }
    },
    {
      selector: 'node[type = "resource_attribute"]',
      style: {
        'background-color': colors.entity.resource_attribute.bg,
        'color': colors.entity.resource_attribute.text,
        'shape': 'tag' as any,
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 1.5,
        'line-color': colors.edge.line,
        'target-arrow-color': colors.edge.line,
        'source-arrow-color': colors.edge.line,
        'target-arrow-shape': 'triangle' as any,
        'curve-style': 'bezier' as any,
        'label': 'data(label)' as any,
        'font-size': '10px',
        'font-family': 'system-ui, sans-serif',
        'font-weight': '500',
        'text-rotation': 'autorotate' as any,
        'text-margin-y': -8,
        'text-background-color': colors.background,
        'text-background-opacity': 0.85,
        'text-background-padding': '3px',
        'text-background-shape': 'roundrectangle' as any,
        'color': colors.edge.text,
        'arrow-scale': 1.2,
        'transition-property': 'line-color, target-arrow-color, source-arrow-color, width',
        'transition-duration': '0.2s',
      }
    },
    {
      selector: 'edge[type = "assignment"]',
      style: {
        'line-style': 'solid' as any,
        'width': 2,
      }
    },
    {
      selector: 'edge[type = "association"]',
      style: {
        'line-style': 'dashed' as any,
        'line-dash-pattern': [6, 3],
      }
    },
    // Hover states
    {
      selector: 'node:hover',
      style: {
        'border-color': colors.edge.highlight,
        'border-width': '2px',
      }
    },
    {
      selector: 'edge:hover',
      style: {
        'line-color': colors.edge.highlight,
        'target-arrow-color': colors.edge.highlight,
        'source-arrow-color': colors.edge.highlight,
        'width': 2.5,
        'z-index': 999,
      }
    },
    // Selected states
    {
      selector: 'node:selected',
      style: {
        'border-color': colors.edge.highlight,
        'border-width': '3px',
      }
    },
    {
      selector: 'edge:selected',
      style: {
        'line-color': colors.edge.highlight,
        'target-arrow-color': colors.edge.highlight,
        'source-arrow-color': colors.edge.highlight,
        'width': 3,
        'z-index': 999,
      }
    },
  ] as Stylesheet[];
}
