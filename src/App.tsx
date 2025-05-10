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
import { CytoscapeProvider } from './context/CytoscapeContext';
import { getDefaultStylesheet } from './styles/graphStyles';

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
        <CytoscapeProvider>
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
        </CytoscapeProvider>
      </Box>
    </ThemeProvider>
  );
}
