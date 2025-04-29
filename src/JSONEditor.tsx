import React from "react";
import { Box, useTheme } from '@mui/material';

interface JSONEditorProps {
  value: any;
  onChange: (value: any) => void;
}

export const JSONEditor: React.FC<JSONEditorProps> = ({ value, onChange }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box sx={{ 
      width: '100%',
      '& textarea': {
        width: '100%',
        minHeight: '100px',
        padding: '8px',
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        fontSize: '13px',
        fontWeight: isDarkMode ? 300 : 400,
        lineHeight: 1.5,
        letterSpacing: '0.00938em',
        border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'}`,
        borderRadius: '4px',
        backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
        color: isDarkMode ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
        resize: 'vertical',
        '&:hover': {
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
        },
        '&:focus': {
          outline: 'none',
          borderColor: theme.palette.primary.main,
          boxShadow: `0 0 0 2px ${theme.palette.primary.main}25`,
        },
      }
    }}>
      <textarea
        value={JSON.stringify(value, null, 2)}
        onChange={(e) => {
          try {
            onChange(JSON.parse(e.target.value));
          } catch (error) {
            // If JSON is invalid, don't update the value
            console.error("Invalid JSON:", error);
          }
        }}
        spellCheck={false}
      />
    </Box>
  );
};
