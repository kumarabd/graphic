import React, { useEffect, useState, useMemo } from "react";
import { Box, CssBaseline, ThemeProvider, createTheme, useMediaQuery } from '@mui/material';
import { useDispatch } from "react-redux";
import { AppDispatch } from "./store";
import { fetchGraphDataThunk } from "./fetchGraphData";
import { layouts } from "./layouts";
import setupCy from "./setupCy";
import { Stylesheet } from "cytoscape";
import { ControlPanel } from './components/ControlPanel';
import { GraphView } from './components/GraphView';
import { Header } from './components/Header';

// Setup Cytoscape if needed
setupCy();

export default function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  const dispatch = useDispatch<AppDispatch>();
  const [layout, setLayout] = useState(layouts.elk_layered);
  const [stylesheet, setStylesheet] = useState(() => getDefaultStylesheet(prefersDarkMode));

  useEffect(() => {
    dispatch(fetchGraphDataThunk());
  }, [dispatch]);

  useEffect(() => {
    setStylesheet(getDefaultStylesheet(prefersDarkMode));
  }, [prefersDarkMode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
          primary: {
            main: prefersDarkMode ? '#90caf9' : '#1976d2',
          },
          background: {
            default: prefersDarkMode ? '#121212' : '#f5f5f5',
            paper: prefersDarkMode ? '#1e1e1e' : '#ffffff',
          },
          text: {
            primary: prefersDarkMode ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
            secondary: prefersDarkMode ? '#e0e0e0' : 'rgba(0, 0, 0, 0.6)',
          },
        },
        typography: {
          fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
          ].join(','),
          h6: {
            fontWeight: prefersDarkMode ? 400 : 500,
            letterSpacing: '0.0075em',
            color: prefersDarkMode ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
          },
          body1: {
            fontSize: '1rem',
            fontWeight: prefersDarkMode ? 300 : 400,
            letterSpacing: '0.00938em',
            lineHeight: 1.5,
            color: prefersDarkMode ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
          },
          body2: {
            fontSize: '0.875rem',
            fontWeight: prefersDarkMode ? 300 : 400,
            letterSpacing: '0.01071em',
            lineHeight: 1.43,
            color: prefersDarkMode ? '#e0e0e0' : 'rgba(0, 0, 0, 0.6)',
          },
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundColor: prefersDarkMode ? '#1e1e1e' : '#ffffff',
                backgroundImage: 'none',
              },
            },
          },
          MuiSelect: {
            styleOverrides: {
              icon: {
                color: prefersDarkMode ? '#ffffff' : 'rgba(0, 0, 0, 0.54)',
              },
              select: {
                '&:focus': {
                  backgroundColor: 'transparent',
                },
              },
            },
          },
          MuiMenuItem: {
            styleOverrides: {
              root: {
                fontSize: '0.875rem',
                fontWeight: prefersDarkMode ? 300 : 400,
                letterSpacing: '0.01071em',
                color: prefersDarkMode ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
                '&:hover': {
                  backgroundColor: prefersDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                },
                '&.Mui-selected': {
                  backgroundColor: prefersDarkMode ? 'rgba(144, 202, 249, 0.16)' : 'rgba(25, 118, 210, 0.08)',
                  '&:hover': {
                    backgroundColor: prefersDarkMode ? 'rgba(144, 202, 249, 0.24)' : 'rgba(25, 118, 210, 0.12)',
                  },
                },
              },
            },
          },
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                scrollbarColor: prefersDarkMode ? '#6b6b6b transparent' : '#959595 transparent',
                '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                  width: '8px',
                  height: '8px',
                },
                '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                  borderRadius: 8,
                  backgroundColor: prefersDarkMode ? '#6b6b6b' : '#959595',
                  minHeight: 24,
                },
                '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
                  backgroundColor: prefersDarkMode ? '#1e1e1e' : '#f5f5f5',
                },
              },
            },
          },
        },
      }),
    [prefersDarkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        p: 0.5 // Reduced overall padding
      }}>
        <Header />
        <Box sx={{ 
          display: 'flex', 
          flexGrow: 1,
          gap: 0.5, // Reduced gap between panels
          px: 0.5, // Minimal horizontal padding
          pb: 0.5 // Bottom padding
        }}>
          <ControlPanel
            layout={layout}
            setLayout={setLayout}
            stylesheet={stylesheet}
            setStylesheet={setStylesheet}
          />
          <GraphView
            layout={layout}
            stylesheet={stylesheet}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

function getDefaultStylesheet(isDarkMode: boolean) {
  // Theme-aware colors
  const colors = {
    background: isDarkMode ? '#1e1e1e' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#000000',
    subject: {
      bg: isDarkMode ? '#ff6b6b' : '#ff4757',
      text: isDarkMode ? '#ffffff' : '#000000'
    },
    resource: {
      bg: isDarkMode ? '#4ecdc4' : '#00b894',
      text: isDarkMode ? '#ffffff' : '#000000'
    },
    subject_attribute: {
      bg: isDarkMode ? '#ffd93d' : '#ffa502',
      text: isDarkMode ? '#ffffff' : '#000000'
    },
    resource_attribute: {
      bg: isDarkMode ? '#6c5ce7' : '#5f27cd',
      text: isDarkMode ? '#ffffff' : '#000000'
    },
    parent: {
      bg: isDarkMode ? '#2d2d2d' : '#f5f5f5',
      border: isDarkMode ? '#404040' : '#e0e0e0',
      text: isDarkMode ? '#ffffff' : '#000000'
    },
    edge: {
      line: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      text: isDarkMode ? '#ffffff' : '#000000',
      arrow: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'
    }
  };

  const stylesheet: Stylesheet[] = [
    { 
      selector: "node",
      style: {
        'label': "data(label)" as any,
        'color': colors.text,
        'font-size': '14px',
        'font-weight': isDarkMode ? 300 : 400,
        'text-valign': 'center',
        'text-halign': 'center',
        'text-outline-color': colors.background,
        'text-outline-width': 2,
        'text-outline-opacity': 1,
        'border-width': 1,
        'border-opacity': 0.8,
        'background-color': colors.background,
        'width': 'label',
        'height': 'label',
        'padding': 10,
        'shape': 'round-rectangle',
      } as any
    },
    {
      selector: 'node[type="subject"]',
      style: {
        'background-color': colors.subject.bg,
        'color': colors.subject.text,
        'border-color': colors.subject.bg,
        'border-width': 2,
        'shape': 'round-rectangle',
      } as any
    },
    {
      selector: 'node[type="resource"]',
      style: {
        'background-color': colors.resource.bg,
        'color': colors.resource.text,
        'border-color': colors.resource.bg,
        'border-width': 2,
        'shape': 'round-rectangle',
      } as any
    },
    {
      selector: 'node[type="subject_attribute"]',
      style: {
        'background-color': colors.subject_attribute.bg,
        'color': colors.subject_attribute.text,
        'border-color': colors.subject_attribute.bg,
        'border-width': 2,
        'shape': 'round-diamond',
      } as any
    },
    {
      selector: 'node[type="resource_attribute"]',
      style: {
        'background-color': colors.resource_attribute.bg,
        'color': colors.resource_attribute.text,
        'border-color': colors.resource_attribute.bg,
        'border-width': 2,
        'shape': 'diamond',
      } as any
    },
    {
      selector: 'node[type="parent"]',
      style: {
        'background-color': colors.parent.bg,
        'border-color': colors.parent.border,
        'color': colors.parent.text,
        'border-width': 1,
        'shape': 'round-rectangle',
        'padding': 20,
      } as any
    },
    {
      selector: 'edge',
      style: { 
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 1.5,
        'line-color': colors.edge.line,
        'target-arrow-color': colors.edge.arrow,
        'source-endpoint': '50% 50%',
        'target-endpoint': '50% 50%',
        'width': 2,
        'label': "data(label)" as any,
        'font-size': '12px',
        'font-weight': isDarkMode ? 300 : 400,
        'text-rotation': 'autorotate',
        'text-margin-y': -10,
        'color': colors.edge.text,
        'text-outline-color': colors.background,
        'text-outline-width': 2,
        'text-outline-opacity': 1,
      } as any
    },
    {
      selector: 'edge[type="association"]',
      style: {
        'line-style': 'dashed',
        'target-arrow-shape': 'none',
        'line-color': colors.edge.line,
        'line-dash-pattern': [6, 3],
      } as any
    },
    {
      selector: 'node:selected',
      style: {
        'border-width': 3,
        'border-color': isDarkMode ? '#90caf9' : '#1976d2',
        'border-opacity': 1,
      } as any
    },
    {
      selector: 'edge:selected',
      style: {
        'line-color': isDarkMode ? '#90caf9' : '#1976d2',
        'target-arrow-color': isDarkMode ? '#90caf9' : '#1976d2',
        'width': 3,
      } as any
    },
    {
      selector: 'node:active',
      style: {
        'overlay-color': isDarkMode ? '#90caf9' : '#1976d2',
        'overlay-padding': 10,
        'overlay-opacity': 0.2,
      } as any
    },
  ];

  return stylesheet;
}
