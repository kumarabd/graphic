import React from 'react';
import {
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  FormGroup,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SyncIcon from '@mui/icons-material/Sync';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState, setFilters } from '../store';
import { fetchGraphDataThunk } from '../fetchGraphData';
import { layouts } from '../layouts';
import { Stylesheet } from 'cytoscape';
import { JSONEditor } from '../JSONEditor';

interface ControlPanelProps {
  layout: any;
  setLayout: (layout: any) => void;
  stylesheet: Stylesheet[];
  setStylesheet: (stylesheet: Stylesheet[]) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  layout,
  setLayout,
  stylesheet,
  setStylesheet,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector((state: RootState) => state.graph.filters);
  
  const handleLayoutChange = (event: SelectChangeEvent<string>) => {
    setLayout({ ...layouts[event.target.value as keyof typeof layouts] });
  };

  const handleFilterChange = (filterKey: keyof typeof filters) => {
    dispatch(setFilters({
      ...filters,
      [filterKey]: !filters[filterKey],
    }));
  };

  const currentLayoutName = Object.entries(layouts).find(
    ([_, value]) => JSON.stringify(value) === JSON.stringify(layout)
  )?.[0];

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 1,
        width: '280px', 
        maxWidth: '20vw', 
        height: 'calc(100vh - 80px)', 
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        mr: 0.5
      }}
    >
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        Graph Controls
      </Typography>

      <Button
        variant="contained"
        size="small"
        startIcon={<SyncIcon />}
        onClick={() => dispatch(fetchGraphDataThunk())}
        sx={{ mb: 0.5 }}
      >
        Sync
      </Button>

      <Accordion defaultExpanded sx={{ '& .MuiAccordionSummary-root': { minHeight: '40px' } }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="filter-content"
          id="filter-header"
        >
          <Typography variant="body2">Filters</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={filters.showSubjects}
                  onChange={() => handleFilterChange('showSubjects')}
                  size="small"
                />
              }
              label="Show Subjects"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={filters.showResources}
                  onChange={() => handleFilterChange('showResources')}
                  size="small"
                />
              }
              label="Show Resources"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={filters.showSubjectAttributes}
                  onChange={() => handleFilterChange('showSubjectAttributes')}
                  size="small"
                />
              }
              label="Show Subject Attributes"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={filters.showResourceAttributes}
                  onChange={() => handleFilterChange('showResourceAttributes')}
                  size="small"
                />
              }
              label="Show Resource Attributes"
            />
          </FormGroup>
        </AccordionDetails>
      </Accordion>
      
      <FormControl fullWidth size="small" sx={{ mb: 0.5 }}>
        <InputLabel id="layout-select-label">Layout</InputLabel>
        <Select
          labelId="layout-select-label"
          id="layout-select"
          value={currentLayoutName || ''}
          label="Layout"
          onChange={handleLayoutChange}
        >
          {Object.entries(layouts).map(([key]) => (
            <MenuItem key={key} value={key}>
              {key}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Accordion sx={{ '& .MuiAccordionSummary-root': { minHeight: '40px' } }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="additional-settings-content"
          id="additional-settings-header"
        >
          <Typography variant="body2">Additional Settings</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="subtitle2">
              Layout Configuration
            </Typography>
            <JSONEditor
              value={layout}
              onChange={(value) => setLayout(value)}
            />

            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              Stylesheet
            </Typography>
            <JSONEditor
              value={stylesheet}
              onChange={(value) => setStylesheet(value)}
            />
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};
