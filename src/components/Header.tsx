import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  Tooltip,
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import GitHubIcon from '@mui/icons-material/GitHub';

interface HeaderProps {
  title?: string;
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = 'Graph Visualization', 
  onToggleTheme 
}) => {
  const theme = useTheme();

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar variant="dense">
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            color: 'text.primary',
            fontWeight: 500
          }}
        >
          {title}
        </Typography>
        {onToggleTheme && (
          <Tooltip title="Toggle theme">
            <IconButton onClick={onToggleTheme} sx={{ ml: 1 }}>
              {theme.palette.mode === 'dark' ? (
                <Brightness7Icon />
              ) : (
                <Brightness4Icon />
              )}
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="View on GitHub">
          <IconButton
            component="a"
            href="https://github.com/kumarabd/kube-auth-engine"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ ml: 1 }}
          >
            <GitHubIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};
