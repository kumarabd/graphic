import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Paper, 
  Box, 
  Typography, 
  Autocomplete, 
  TextField, 
  Chip, 
  Divider, 
  FormControl, 
  InputLabel, 
  FormHelperText,
  Select, 
  SelectChangeEvent,
  MenuItem,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  useTheme,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { useFilter } from '../hooks/useFilter';
import { useCytoscape } from '../context/CytoscapeContext';
import { useNodeSelection } from '../hooks/useNodeSelection';
import { useEdgeSelection } from '../hooks/useEdgeSelection';
import { useLayoutSelection } from '../hooks/useLayout';
import { useLimits } from '../hooks/useLimits';
import { useFilterKeys } from '../hooks/useFilterKeys';
import { useFilterValues } from '../hooks/useFilterValues';
import { KVFilter, LayoutType } from '../types';
import SyncIcon from '@mui/icons-material/Sync';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import TuneIcon from '@mui/icons-material/Tune';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface ControlPanelProps {
  onLayoutChange: (layout: LayoutType) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ onLayoutChange }) => {
  const theme = useTheme();
  const { nodeElements, refreshNodes } = useNodeSelection();
  const { edgeElements, refreshEdges } = useEdgeSelection();
  const { selectedLayout, setSelectedLayout, layoutOptions } = useLayoutSelection();
  const { filterKeys, refreshFilterKeys } = useFilterKeys();
  const { getFilterValues } = useFilterValues();
  
  // State for pagination and search in the filter dropdown
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleItemCount, setVisibleItemCount] = useState(20);

  // Use our filter hook with Cytoscape's built-in filtering capabilities
  const {
    nodeFilters,
    edgeFilters,
    addFilter,
    removeFilter,
    filterFormVisible,
    setFilterFormVisible,
    newFilterKey,
    setNewFilterKey,
    selectedValues,
    setSelectedValues,
    pendingFilter,
    setPendingFilter,
    resetFilterForm,
    // Using the direct Cytoscape filtering methods
    applyCytoscapeFilter
  } = useFilter();
  // Limits hook - now with built-in change tracking
  const { limits, setLimits, hasLimitChanges, applyLimitChanges } = useLimits();
  // Handle limit validation errors
  const [limitErrors, setLimitErrors] = useState<{[key: string]: string}>({});
  
  const handleLimitChange = useCallback((type: 'node' | 'edge', value: string) => {
    // Clear any previous errors for this type
    setLimitErrors(prev => ({ ...prev, [type]: '' }));
    // Validate input is a number
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      setLimitErrors(prev => ({ ...prev, [type]: 'Must be a valid number' }));
      return;
    }
    // Validate input is positive
    if (numValue <= 0) {
      setLimitErrors(prev => ({ ...prev, [type]: 'Must be greater than 0' }));
      return;
    }
    
    // Update limits state - change tracking is handled by the hook
    setLimits({
      ...limits,
      [type === 'node' ? 'nodeLimit' : 'edgeLimit']: numValue
    });
  }, [limits, setLimits]);

  const handleSync = useCallback(async () => {
    console.log('Applying sync');
    // Refresh data from the API
    const nodesPromise = refreshNodes();
    const edgesPromise = refreshEdges();
    
    try {
      const [nodesResult, edgesResult] = await Promise.all([nodesPromise, edgesPromise]);
      
      if (nodesResult && edgesResult) {
        console.log('Graph data successfully refreshed');
      } else {
        console.error('Failed to refresh some graph data');
      }
    } catch (error) {
      console.error('Error during sync operation:', error);
    }
  }, [refreshNodes, refreshEdges]);

  const handleLayoutChange = (event: any) => {
    const newLayout = event.target.value as LayoutType;
    setSelectedLayout(newLayout);
    onLayoutChange(newLayout);
  };

  const handleKeyChange = (key: string) => {
    setNewFilterKey(key);
    
    // Check if there are existing filters for this key and populate selectedValues
    const existingFilter = nodeFilters.find(filter => filter.key === key);
    if (existingFilter) {
      setSelectedValues([...existingFilter.values]);
    } else {
      setSelectedValues([]);
    }
    
    setPendingFilter(true);
  };

  const handleApplyFilter = () => {
    if (newFilterKey && selectedValues.length > 0) {
      // Add the filter directly using the hook
      addFilter(newFilterKey, selectedValues, 'filterNodesByType');
    }
  };
  
  const handleRemoveFilter = (index: number) => {
    // Call the removeFilter function directly with the index
    removeFilter(index, 'filterNodesByType');
  };
  
  const handleCancelFilter = () => {
    resetFilterForm();
  };
  
  // Apply all current filters directly using Cytoscape
  const applyAllFilters = useCallback(() => {
    // Apply node filters
    applyCytoscapeFilter('node', nodeFilters);
    
    // Apply edge filters
    applyCytoscapeFilter('edge', edgeFilters);
  }, [applyCytoscapeFilter, nodeFilters, edgeFilters]);
  
  // Apply filters and fetch filter keys once on mount
  useEffect(() => {
    refreshFilterKeys();
    applyAllFilters();
  }, []);

  // Get available filter keys, either from Redux store or fallback to defaults
  const getAvailableKeys = (): string[] => {
    // If we have filter keys from the backend, use them
    if (filterKeys && filterKeys.length > 0) {
      return filterKeys;
    }
    // Otherwise, use default keys
    return ['type', 'label'];
  }
  
  // State to store the available values for the current filter key
  const [availableValues, setAvailableValues] = useState<string[]>([]);
  const [valuesLoading, setValuesLoading] = useState(false);
  
  // Fetch available values when filter key changes
  useEffect(() => {
    const fetchValues = async () => {
      if (!newFilterKey) {
        setAvailableValues([]);
        return;
      }
      
      setValuesLoading(true);
      try {
        let values: string[] = [];
        let key = newFilterKey;
        
        // Handle name/label mapping
        if (key === 'name') {
          key = 'label';
        }
        
        // For type, get values from node elements
        if (key === 'type') {
          const childNodes = nodeElements.filter(node => node.data.parent);
          values = childNodes
            .map(node => node.data[key])
            .filter(value => value !== undefined && value !== null)
            .map(value => String(value));
          
          // Remove duplicates
          values = Array.from(new Set(values));
        } else {
          // For other keys, fetch from API
          values = await getFilterValues(key);
        }
        
        setAvailableValues(values);
      } catch (error) {
        console.error('Error fetching filter values:', error);
        setAvailableValues([]);
      } finally {
        setValuesLoading(false);
      }
    };
    
    fetchValues();
  }, [newFilterKey, nodeElements, getFilterValues]);
  
  // Get available values based on selected key and search query
  const getAvailableValues = (): string[] => {
    // If no values are available yet, return empty array
    if (valuesLoading || availableValues.length === 0) {
      return [];
    }
    
    // Filter values based on search query if provided
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      return availableValues.filter(value => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(lowerQuery);
      });
    }
    
    return availableValues;
  };
  
  // Handle showing more items
  const handleShowMore = () => {
    setVisibleItemCount(prev => prev + 10);
  };
  
  // Reset pagination when filter type changes
  useEffect(() => {
    setVisibleItemCount(20);
    setSearchQuery('');
  }, [newFilterKey]);

  return (
    <Card 
      elevation={2}
      sx={{
        m: 2,
        overflow: 'visible',
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <CardHeader
        title={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Control Panel
            </Typography>
            <Tooltip title="Sync Graph Data">
              <IconButton 
                onClick={handleSync} 
                size="small"
                color="primary"
                sx={{ 
                  backgroundColor: theme.palette.primary.main + '10',
                  '&:hover': { backgroundColor: theme.palette.primary.main + '20' } 
                }}
              >
                <SyncIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
        sx={{ 
          pb: 0,
          '& .MuiCardHeader-content': { width: '100%' } 
        }}
      />
      <CardContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Filters Section */}
          <Box sx={{ flex: 4 }}>
            <Card variant="outlined" sx={{ mb: 2, borderRadius: 1, overflow: 'visible' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FilterListIcon fontSize="small" color="primary" />
                      <Typography variant="subtitle1">Node Filters</Typography>
                    </Box>
                    <Tooltip title="Add a new filter">
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => setFilterFormVisible(true)}
                        disabled={filterFormVisible || pendingFilter}
                        sx={{ 
                          backgroundColor: theme.palette.primary.main + '10',
                          '&:hover': { backgroundColor: theme.palette.primary.main + '20' }
                        }}
                      >
                        <FilterListIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
                sx={{ py: 1.5, px: 2 }}
              />
              <Divider />
              <CardContent sx={{ p: 2 }}>
                {/* Filter Categories */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.text.secondary, fontWeight: 500 }}>
                    Filter by:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    {getAvailableKeys().map((key) => (
                      <Chip 
                        key={key}
                        label={key.charAt(0).toUpperCase() + key.slice(1)} 
                        clickable
                        onClick={() => {
                          setNewFilterKey(key);
                          setFilterFormVisible(true);
                        }}
                        color={nodeFilters.some(f => f.key === key) ? 'primary' : 'default'}
                        size="small"
                        variant={nodeFilters.some(f => f.key === key) ? 'filled' : 'outlined'}
                        sx={{ borderRadius: '4px' }}
                      />
                    ))}
                  </Box>
                </Box>
                
                {/* Active Filters */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.text.secondary, fontWeight: 500 }}>
                    Active Filters:
                  </Typography>
                  {nodeFilters.length > 0 ? (
                    <Box sx={{ 
                      p: 1.5, 
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      backgroundColor: theme.palette.background.default
                    }}>
                      {nodeFilters.map((filter: KVFilter, index: number) => (
                        <Box key={index} sx={{ mb: index < nodeFilters.length - 1 ? 1 : 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" fontWeight={500} color="primary">
                              {filter.key}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => handleRemoveFilter(index)}
                              sx={{ p: 0.5 }}
                            >
                              <CloseIcon fontSize="small" color="error" />
                            </IconButton>
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {filter.values.map((value, valueIndex) => (
                              <Chip
                                key={valueIndex}
                                label={value}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ 
                                  borderRadius: '4px',
                                  '& .MuiChip-label': { fontWeight: 400 }
                                }}
                              />
                            ))}
                          </Box>
                          {index < nodeFilters.length - 1 && <Divider sx={{ my: 1 }} />}
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ 
                      p: 2, 
                      border: `1px dashed ${theme.palette.divider}`,
                      borderRadius: 1,
                      backgroundColor: theme.palette.background.default,
                      textAlign: 'center'
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        No filters applied. Click on a filter type above to add one.
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                {/* Filter Form */}
                {filterFormVisible && (
                  <Box sx={{ 
                    p: 2, 
                    border: `1px solid ${theme.palette.primary.main + '40'}`,
                    borderRadius: 1,
                    backgroundColor: theme.palette.background.default,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <Stack spacing={2}>
                      {!newFilterKey && (
                        <FormControl variant="outlined" size="small">
                          <InputLabel>Select Filter Type</InputLabel>
                          <Select
                            value={newFilterKey}
                            label="Select Filter Type"
                            onChange={(e) => handleKeyChange(e.target.value as string)}
                          >
                            {getAvailableKeys().map((key) => (
                              <MenuItem value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                      {newFilterKey && (
                        <Box>
                          {/* Search input */}
                          <TextField
                            fullWidth
                            size="small"
                            label={newFilterKey.charAt(0).toUpperCase() + newFilterKey.slice(1) + 's'}
                            placeholder="Start typing to search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon fontSize="small" />
                                </InputAdornment>
                              )
                            }}
                            helperText={`Select one or more node ${newFilterKey}s`}
                          />
                          
                          {/* Options list */}
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              mt: 1, 
                              maxHeight: '200px', 
                              overflow: 'auto',
                              border: `1px solid ${theme.palette.divider}`
                            }}
                          >
                            <List dense component="div" role="list">
                              {getAvailableValues()
                                .filter(Boolean)
                                .filter(option => {
                                  if (!searchQuery) return true;
                                  return option.toLowerCase().includes(searchQuery.toLowerCase());
                                })
                                .slice(0, visibleItemCount)
                                .map((option) => {
                                  const labelId = `checkbox-list-label-${option}`;
                                  const isSelected = selectedValues.includes(option);
                                  
                                  return (
                                    <ListItem
                                      key={option}
                                      dense
                                      onClick={() => {
                                        // Toggle selection
                                        if (isSelected) {
                                          setSelectedValues(selectedValues.filter(value => value !== option));
                                        } else {
                                          setSelectedValues([...selectedValues, option]);
                                        }
                                      }}
                                      sx={{
                                        cursor: 'pointer',
                                        bgcolor: isSelected ? theme.palette.action.selected : 'transparent',
                                        '&:hover': {
                                          bgcolor: theme.palette.action.hover
                                        }
                                      }}
                                    >
                                      <Checkbox
                                        edge="start"
                                        checked={isSelected}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{ 'aria-labelledby': labelId }}
                                        size="small"
                                      />
                                      <ListItemText id={labelId} primary={option} />
                                    </ListItem>
                                  );
                                })}
                                
                              {/* Show more button if needed */}
                              {getAvailableValues().filter(Boolean).length > visibleItemCount && (
                                <ListItem 
                                  onClick={handleShowMore}
                                  sx={{ 
                                    justifyContent: 'center',
                                    color: theme.palette.primary.main,
                                    borderTop: `1px dashed ${theme.palette.divider}`,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                    Show more <KeyboardArrowDownIcon fontSize="small" sx={{ ml: 0.5 }} />
                                  </Typography>
                                </ListItem>
                              )}
                            </List>
                          </Paper>
                        </Box>
                      )}
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="inherit"
                          onClick={handleCancelFilter}
                          startIcon={<CloseIcon />}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={handleApplyFilter}
                          disabled={!newFilterKey || selectedValues.length === 0}
                          startIcon={<CheckIcon />}
                        >
                          Apply Filter
                        </Button>
                      </Box>
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
          
          {/* Settings Section */}
          <Box sx={{ flex: 1 }}>
            <Card variant="outlined" sx={{ borderRadius: 1 }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SettingsIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle1">Graph Settings</Typography>
                  </Box>
                }
                sx={{ py: 1.5, px: 2 }}
              />
              <Divider />
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Layout Settings */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      color: theme.palette.text.secondary,
                      fontWeight: 500,
                      fontSize: '0.75rem'
                    }}>
                      <TuneIcon fontSize="small" />
                      Layout Settings
                    </Typography>
                    <FormControl fullWidth size="small">
                      <InputLabel id="layout-select-label">Graph Layout</InputLabel>
                      <Select
                        labelId="layout-select-label"
                        value={selectedLayout}
                        label="Graph Layout"
                        onChange={handleLayoutChange}
                        size="small"
                      >
                        {layoutOptions.map((layout) => (
                          <MenuItem key={layout} value={layout}>
                            {layout.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  
                  {/* Horizontal Divider */}
                  <Divider />
                  
                  {/* Query Limits */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      color: theme.palette.text.secondary,
                      fontWeight: 500,
                      fontSize: '0.875rem'
                    }}>
                      <TuneIcon fontSize="small" />
                      Query Limits
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <TextField
                        label="Node Limit"
                        type="number"
                        value={limits.nodeLimit}
                        onChange={(e) => handleLimitChange('node', e.target.value)}
                        placeholder="Default: 5000"
                        fullWidth
                        inputProps={{ min: 1 }}
                        size="small"
                        error={!!limitErrors.node}
                        helperText={limitErrors.node || ''}
                      />
                      <TextField
                        label="Edge Limit"
                        type="number"
                        value={limits.edgeLimit}
                        onChange={(e) => handleLimitChange('edge', e.target.value)}
                        placeholder="Default: 5000"
                        fullWidth
                        inputProps={{ min: 1 }}
                        size="small"
                        error={!!limitErrors.edge}
                        helperText={limitErrors.edge || ''}
                      />
                    </Box>
                  </Box>
                </Box>
                
                {/* Apply Limits Button */}
                {hasLimitChanges && (
                  <Button 
                    variant="contained" 
                    size="small" 
                    onClick={applyLimitChanges}
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    Apply Limits
                  </Button>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
