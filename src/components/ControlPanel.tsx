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
import { useNodeSelection } from '../hooks/useNode';
import { useEdgeSelection } from '../hooks/useEdge';
import { useLayoutSelection } from '../hooks/useLayout';
import { useLimits } from '../hooks/useLimits';
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
  const { nodesByType, nodeElements, refreshNodes } = useNodeSelection();
  const { edgesByType, edgeElements, refreshEdges } = useEdgeSelection();
  const { selectedLayout, setSelectedLayout, layoutOptions } = useLayoutSelection();
  
  // State for pagination and search in the filter dropdown
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleItemCount, setVisibleItemCount] = useState(20);
  // Use our filter hook with all the filter functionality
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
    applyFilter
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
  const allNodeNames = useMemo(() => Object.values(nodesByType).flat().map(node => node.label), [nodesByType]);

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
      // Add the filter using our hook
      addFilter(newFilterKey, selectedValues, 'filterNodesByType');
    }
    
    // Reset form for next filter
    setFilterFormVisible(false);
    setNewFilterKey('');
    setSelectedValues([]);
    setPendingFilter(false);
    handleSync();
  };
  
  const handleRemoveFilter = (index: number) => {
    // Get the filter key from the nodeFilters array
    const filterKey = nodeFilters[index]?.key;
    if (filterKey) {
      // Remove the filter using our hook
      removeFilter(filterKey, 'filterNodesByType');
    }
    handleSync();
  };
  
  const handleCancelFilter = () => {
    resetFilterForm();
  };

  // Get available values based on selected key
  const getAvailableValues = (): string[] => {
    let values: string[] = [];
    if (newFilterKey === 'type') {
      values = ['subject', 'resource', 'subject_attribute', 'resource_attribute'];
    } else if (newFilterKey === 'name') {
      values = allNodeNames;
    }
    
    // Filter values based on search query if provided
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      values = values.filter(value => 
        value.toLowerCase().includes(lowerQuery)
      );
    }

    // Remove duplicates
    const uniquevalues: string[] = Array.from(new Set(values));
    
    return uniquevalues;
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
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip 
                      label="Type" 
                      clickable
                      onClick={() => {
                        setNewFilterKey('type');
                        setFilterFormVisible(true);
                      }}
                      color={nodeFilters.some(f => f.key === 'type') ? 'primary' : 'default'}
                      size="small"
                      variant={nodeFilters.some(f => f.key === 'type') ? 'filled' : 'outlined'}
                      sx={{ borderRadius: '4px' }}
                    />
                    <Chip 
                      label="Name" 
                      clickable
                      onClick={() => {
                        setNewFilterKey('name');
                        setFilterFormVisible(true);
                      }}
                      color={nodeFilters.some(f => f.key === 'name') ? 'primary' : 'default'}
                      size="small"
                      variant={nodeFilters.some(f => f.key === 'name') ? 'filled' : 'outlined'}
                      sx={{ borderRadius: '4px' }}
                    />
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
                            <MenuItem value="type">Node Type</MenuItem>
                            <MenuItem value="name">Node Name</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                      
                      {newFilterKey && (
                        <Autocomplete
                          multiple
                          size="small"
                          options={getAvailableValues()}
                          value={selectedValues}
                          onChange={(event, newValue) => {
                            setSelectedValues(newValue);
                          }}
                          inputValue={searchQuery}
                          onInputChange={(event, newInputValue) => {
                            setSearchQuery(newInputValue);
                          }}
                          disableCloseOnSelect
                          renderInput={(params) => (
                            <TextField 
                              {...params} 
                              label={newFilterKey === 'type' ? 'Types' : 'Names'}
                              placeholder={newFilterKey === 'type' ? 'start typing to search...' : 'start typing to search...'}
                              helperText={newFilterKey === 'type' ? 'Select one or more node types' : 'Select one or more node names'}
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <>
                                    <InputAdornment position="start">
                                      <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                    {params.InputProps.startAdornment}
                                  </>
                                )
                              }}
                            />
                          )}
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                              <Chip
                                {...getTagProps({ index })}
                                key={option}
                                label={option}
                                size="small"
                              />
                            ))
                          }
                          ListboxProps={{
                            style: {
                              maxHeight: '300px'
                            }
                          }}
                          filterOptions={(options, state) => {
                            // First filter by the search query
                            const filtered = options.filter(option => 
                              option.toLowerCase().includes(state.inputValue.toLowerCase())
                            );
                            
                            // Then limit to visible count
                            const limitedOptions = filtered.slice(0, visibleItemCount);
                            
                            // Add a "show more" option if there are more results
                            if (filtered.length > visibleItemCount) {
                              limitedOptions.push(`Show more (${filtered.length - visibleItemCount} more)`);
                            }
                            
                            return limitedOptions;
                          }}
                          isOptionEqualToValue={(option, value) => {
                            // Skip comparison for "Show more" option
                            if (option.startsWith('Show more')) {
                              return false;
                            }
                            // Simple string comparison
                            return option === value;
                          }}
                          getOptionDisabled={(option) => option.startsWith('Show more')}
                          onClose={() => setVisibleItemCount(20)} // Reset pagination when closing
                          onOpen={() => setVisibleItemCount(20)} // Reset pagination when opening
                          getOptionLabel={(option) => option}
                          openOnFocus
                          componentsProps={{
                            paper: {
                              sx: {
                                '& .MuiAutocomplete-listbox': {
                                  maxHeight: '300px',
                                }
                              }
                            }
                          }}
                          renderOption={(props, option) => {
                            // Handle "Show more" option
                            if (option.startsWith('Show more')) {
                              return (
                                <Box 
                                  component="li"
                                  {...props}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleShowMore();
                                  }}
                                  sx={{ 
                                    justifyContent: 'center',
                                    color: theme.palette.primary.main,
                                    borderTop: `1px dashed ${theme.palette.divider}`,
                                    cursor: 'pointer',
                                    py: 1
                                  }}
                                >
                                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                    {option} <KeyboardArrowDownIcon fontSize="small" sx={{ ml: 0.5 }} />
                                  </Typography>
                                </Box>
                              );
                            }
                            
                            // Regular option with correct selected state check
                            return (
                              <li {...props}>
                                <Checkbox
                                  icon={<CheckIcon style={{ visibility: 'hidden' }} />}
                                  checkedIcon={<CheckIcon />}
                                  style={{ marginRight: 8 }}
                                  checked={selectedValues.includes(option)}
                                />
                                {option}
                              </li>
                            );
                          }}
                        />
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
