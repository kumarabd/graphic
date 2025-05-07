import React, { useState, useEffect } from 'react';
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
  Select, 
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
  ListItemText
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState, setFilters } from '../store';
import { fetchGraphDataThunk } from '../fetchGraphData';
import { useNodeSelection } from '../hooks/useNodeSelection';
import { useEdgeSelection } from '../hooks/useEdgeSelection';
import { useLayoutSelection, LayoutType } from '../hooks/useLayoutSelection';
import SyncIcon from '@mui/icons-material/Sync';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface ControlPanelProps {
  onLayoutChange: (layout: LayoutType) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ onLayoutChange }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { nodesByType, filters, updateFilters } = useNodeSelection();
  const { 
    edgesByType, 
    filters: edgeFilters, 
    updateEdgeTypeFilter 
  } = useEdgeSelection();
  const { selectedLayout, setSelectedLayout, layoutOptions } = useLayoutSelection();
  const currentFilters = useSelector((state: RootState) => state.graph.filters);

  // Track input values separately from state
  const [entityLimit, setEntityLimit] = useState(currentFilters.entityLimit);
  const [relationshipLimit, setRelationshipLimit] = useState(currentFilters.relationshipLimit);

  // Update local state when Redux state changes
  useEffect(() => {
    setEntityLimit(currentFilters.entityLimit);
    setRelationshipLimit(currentFilters.relationshipLimit);
  }, [currentFilters.entityLimit, currentFilters.relationshipLimit]);

  const handleSync = () => {
    const newFilters = {
      ...currentFilters,
      entityLimit,
      relationshipLimit
    };
    dispatch(setFilters(newFilters));
    dispatch(fetchGraphDataThunk());
  };

  const handleLayoutChange = (event: any) => {
    const newLayout = event.target.value as LayoutType;
    setSelectedLayout(newLayout);
    onLayoutChange(newLayout);
  };

  const handleLimitChange = (type: 'entity' | 'relationship', value: string) => {
    const numValue = value === '' ? 100 : parseInt(value);
    if (type === 'entity') {
      setEntityLimit(numValue);
    } else {
      setRelationshipLimit(numValue);
    }
  };

  const hasLimitChanges = 
    entityLimit !== currentFilters.entityLimit || 
    relationshipLimit !== currentFilters.relationshipLimit;

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2,
        width: '300px',
        height: 'calc(100vh - 80px)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Control Panel
        </Typography>
        <Tooltip title="Sync Graph Data">
          <IconButton onClick={handleSync} size="small">
            <SyncIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Layout Selection */}
      <FormControl fullWidth>
        <InputLabel id="layout-select-label">Layout</InputLabel>
        <Select
          labelId="layout-select-label"
          id="layout-select"
          value={selectedLayout}
          label="Layout"
          onChange={handleLayoutChange}
        >
          {layoutOptions.map((layout) => (
            <MenuItem key={layout} value={layout}>
              {layout.charAt(0).toUpperCase() + layout.slice(1).replace(/_/g, ' ')}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Divider sx={{ my: 1 }} />

      {/* Node Filters */}
      <Typography variant="subtitle1" gutterBottom>
        Node Filters
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Subjects Filter */}
        <Autocomplete
          multiple
          id="subjects-select"
          options={nodesByType.subjects}
          value={nodesByType.subjects.filter(node => filters.nodeFilters.subjects.includes(node.id))}
          getOptionLabel={(option) => option.label}
          onChange={(_, newValue) => updateFilters('subjects', newValue.map(v => v.id))}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => (
            <TextField {...params} label="Subjects" variant="outlined" />
          )}
          renderValue={(value, getTagProps) =>
            value.map((option, index) => {
              const { key, ...chipProps } = getTagProps({ index });
              return (
                <Chip 
                  key={key}
                  label={option.label}
                  {...chipProps}
                />
              );
            })
          }
        />

        {/* Resources Filter */}
        <Autocomplete
          multiple
          id="resources-select"
          options={nodesByType.resources}
          value={nodesByType.resources.filter(node => filters.nodeFilters.resources.includes(node.id))}
          getOptionLabel={(option) => option.label}
          onChange={(_, newValue) => updateFilters('resources', newValue.map(v => v.id))}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => (
            <TextField {...params} label="Resources" variant="outlined" />
          )}
          renderValue={(value, getTagProps) =>
            value.map((option, index) => {
              const { key, ...chipProps } = getTagProps({ index });
              return (
                <Chip 
                  key={key}
                  label={option.label}
                  {...chipProps}
                />
              );
            })
          }
        />

        {/* Resource Attributes Filter */}
        <Autocomplete
          multiple
          id="resource-attributes-select"
          options={nodesByType.resourceAttributes}
          value={nodesByType.resourceAttributes.filter(node => filters.nodeFilters.resourceAttributes.includes(node.id))}
          getOptionLabel={(option) => option.label}
          onChange={(_, newValue) => updateFilters('resourceAttributes', newValue.map(v => v.id))}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => (
            <TextField {...params} label="Resource Attributes" variant="outlined" />
          )}
          renderValue={(value, getTagProps) =>
            value.map((option, index) => {
              const { key, ...chipProps } = getTagProps({ index });
              return (
                <Chip 
                  key={key}
                  label={option.label}
                  {...chipProps}
                />
              );
            })
          }
        />

        {/* Subject Attributes Filter */}
        <Autocomplete
          multiple
          id="subject-attributes-select"
          options={nodesByType.subjectAttributes}
          value={nodesByType.subjectAttributes.filter(node => filters.nodeFilters.subjectAttributes.includes(node.id))}
          getOptionLabel={(option) => option.label}
          onChange={(_, newValue) => updateFilters('subjectAttributes', newValue.map(v => v.id))}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => (
            <TextField {...params} label="Subject Attributes" variant="outlined" />
          )}
          renderValue={(value, getTagProps) =>
            value.map((option, index) => {
              const { key, ...chipProps } = getTagProps({ index });
              return (
                <Chip 
                  key={key}
                  label={option.label}
                  {...chipProps}
                />
              );
            })
          }
        />
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Edge Filters */}
      <Typography variant="subtitle1" gutterBottom>
        Edge Filters
      </Typography>
      <Box>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={edgeFilters.assignment}
                onChange={(e) => updateEdgeTypeFilter('assignment', e.target.checked)}
              />
            }
            label={`Assignments`}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={edgeFilters.association}
                onChange={(e) => updateEdgeTypeFilter('association', e.target.checked)}
              />
            }
            label={`Associations`}
          />
        </FormGroup>
        
        {/* Edge Details */}
        <List dense>
          {edgeFilters.assignment && edgesByType.assignment.length > 0 && (
            <ListItem>
              <ListItemText 
                primary="Visible Assignment Edges"
                secondary={`${edgesByType.assignment.length} of ${edgesByType.assignment.length} edges`}
              />
            </ListItem>
          )}
          {edgeFilters.association && edgesByType.association.length > 0 && (
            <ListItem>
              <ListItemText 
                primary="Visible Association Edges"
                secondary={`${edgesByType.association.length} of ${edgesByType.association.length} edges`}
              />
            </ListItem>
          )}
        </List>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Query Settings */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Advanced Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Entity Limit"
              type="number"
              value={entityLimit}
              onChange={(e) => handleLimitChange('entity', e.target.value)}
              placeholder="Default: 100"
              fullWidth
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Relationship Limit"
              type="number"
              value={relationshipLimit}
              onChange={(e) => handleLimitChange('relationship', e.target.value)}
              placeholder="Default: 100"
              fullWidth
              inputProps={{ min: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleSync}
              disabled={!hasLimitChanges}
              fullWidth
            >
              Apply
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};
