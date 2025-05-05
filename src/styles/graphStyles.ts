import { Stylesheet } from 'cytoscape';

type StyleValue = string | number;

export const getDefaultStylesheet = (isDarkMode: boolean): Stylesheet[] => {
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
        'font-size': '11px' as any,
        'font-weight': '500' as any,
        'font-family': 'system-ui, sans-serif',
        'width': '35px' as any,
        'height': '35px' as any,
        'background-color': colors.background,
        'color': colors.text,
        'text-wrap': 'wrap' as any,
        'text-max-width': '80px' as any,
        'border-width': '1px' as any,
        'border-color': 'transparent',
        'transition-property': 'background-color, border-color, border-width',
        'transition-duration': '200ms' as any,
      }
    },
    {
      selector: 'node[type = "parent"]',
      style: {
        'background-color': colors.entity.parent.bg,
        'border-color': colors.entity.parent.border,
        'border-width': '1px' as any,
        'shape': 'roundrectangle' as any,
        'text-valign': 'top' as any,
        'text-halign': 'center' as any,
        'font-weight': '600' as any,
        'font-size': '12px' as any,
        'color': colors.entity.parent.text,
        'text-margin-y': '5px' as any,
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
        'width': '1.5px' as any,
        'line-color': colors.edge.line,
        'target-arrow-color': colors.edge.line,
        'source-arrow-color': colors.edge.line,
        'target-arrow-shape': 'triangle' as any,
        'curve-style': 'bezier' as any,
        'label': 'data(label)' as any,
        'font-size': '10px' as any,
        'font-family': 'system-ui, sans-serif',
        'font-weight': '500' as any,
        'text-rotation': 'autorotate' as any,
        'text-margin-y': '-8px' as any,
        'text-background-color': colors.background,
        'text-background-opacity': 0.85,
        'text-background-padding': '3px' as any,
        'text-background-shape': 'roundrectangle' as any,
        'color': colors.edge.text,
        'arrow-scale': '1.2' as any,
        'transition-property': 'line-color, target-arrow-color, source-arrow-color, width',
        'transition-duration': '200ms' as any,
      }
    },
    {
      selector: 'edge[type = "assignment"]',
      style: {
        'line-style': 'solid' as any,
        'width': '2px' as any,
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
        'border-width': '2px' as any,
      }
    },
    {
      selector: 'edge:hover',
      style: {
        'line-color': colors.edge.highlight,
        'target-arrow-color': colors.edge.highlight,
        'source-arrow-color': colors.edge.highlight,
        'width': '2.5px' as any,
        'z-index': 999,
      }
    },
    // Selected states
    {
      selector: 'node:selected',
      style: {
        'border-color': colors.edge.highlight,
        'border-width': '3px' as any,
      }
    },
    {
      selector: 'edge:selected',
      style: {
        'line-color': colors.edge.highlight,
        'target-arrow-color': colors.edge.highlight,
        'source-arrow-color': colors.edge.highlight,
        'width': '3px' as any,
        'z-index': 999,
      }
    },
  ];
};
