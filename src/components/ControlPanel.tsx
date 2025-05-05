import React from 'react';
import { Paper, Box, Typography, Autocomplete, TextField, Chip, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { fetchGraphDataThunk } from '../fetchGraphData';
import { useNodeSelection } from '../hooks/useNodeSelection';
import { useLayoutSelection, LayoutType } from '../hooks/useLayoutSelection';
import SyncIcon from '@mui/icons-material/Sync';
import { IconButton, Tooltip } from '@mui/material';

interface ControlPanelProps {
  onLayoutChange: (layout: LayoutType) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ onLayoutChange }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { nodesByType, selections, updateSelections } = useNodeSelection();
  const { selectedLayout, setSelectedLayout, layoutOptions } = useLayoutSelection();

  const handleSync = () => {
    dispatch(fetchGraphDataThunk());
  };

  const handleLayoutChange = (event: any) => {
    const newLayout = event.target.value as LayoutType;
    setSelectedLayout(newLayout);
    onLayoutChange(newLayout);
  };

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
          value={nodesByType.subjects.filter(node => selections.subjects.includes(node.id))}
          getOptionLabel={(option) => option.label}
          onChange={(_, newValue) => updateSelections('subjects', newValue.map(v => v.id))}
          renderInput={(params) => (
            <TextField {...params} label="Subjects" variant="outlined" />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip label={option.label} {...getTagProps({ index })} />
            ))
          }
        />

        {/* Resources Filter */}
        <Autocomplete
          multiple
          id="resources-select"
          options={nodesByType.resources}
          value={nodesByType.resources.filter(node => selections.resources.includes(node.id))}
          getOptionLabel={(option) => option.label}
          onChange={(_, newValue) => updateSelections('resources', newValue.map(v => v.id))}
          renderInput={(params) => (
            <TextField {...params} label="Resources" variant="outlined" />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip label={option.label} {...getTagProps({ index })} />
            ))
          }
        />

        {/* Resource Attributes Filter */}
        <Autocomplete
          multiple
          id="resource-attributes-select"
          options={nodesByType.resourceAttributes}
          value={nodesByType.resourceAttributes.filter(node => selections.resourceAttributes.includes(node.id))}
          getOptionLabel={(option) => option.label}
          onChange={(_, newValue) => updateSelections('resourceAttributes', newValue.map(v => v.id))}
          renderInput={(params) => (
            <TextField {...params} label="Resource Attributes" variant="outlined" />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip label={option.label} {...getTagProps({ index })} />
            ))
          }
        />

        {/* Subject Attributes Filter */}
        <Autocomplete
          multiple
          id="subject-attributes-select"
          options={nodesByType.subjectAttributes}
          value={nodesByType.subjectAttributes.filter(node => selections.subjectAttributes.includes(node.id))}
          getOptionLabel={(option) => option.label}
          onChange={(_, newValue) => updateSelections('subjectAttributes', newValue.map(v => v.id))}
          renderInput={(params) => (
            <TextField {...params} label="Subject Attributes" variant="outlined" />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip label={option.label} {...getTagProps({ index })} />
            ))
          }
        />
      </Box>
    </Paper>
  );
};
