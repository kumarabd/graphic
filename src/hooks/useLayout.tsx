import { useState, useCallback } from 'react';
import { LayoutOptions } from 'cytoscape';
import { LayoutType } from '../types';
import { 
  breadthfirstLayout, 
  circleLayout, 
  concentricLayout, 
  coseLayout, 
  fcoseLayout, 
  gridLayout,
  klayLayout,
  colaLayout,
  dagreLayout,
  layouts as allLayouts 
} from '../layouts';

// Using LayoutType from types directory

const layouts: Record<LayoutType, LayoutOptions> = {
  breadthfirst: breadthfirstLayout,
  circle: circleLayout,
  concentric: concentricLayout,
  cose: coseLayout,
  fcose: fcoseLayout,
  grid: gridLayout,
  klay: klayLayout,
  cola: colaLayout,
  dagre: dagreLayout,
  elk_box: allLayouts.elk_box,
  elk_disco: allLayouts.elk_disco,
  elk_force: allLayouts.elk_force,
  elk_layered: allLayouts.elk_layered,
  elk_mrtree: allLayouts.elk_mrtree,
  elk_random: allLayouts.elk_random,
  elk_stress: allLayouts.elk_stress
};

export const useLayoutSelection = () => {
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('elk_layered');

  const layoutOptions = Object.keys(layouts) as LayoutType[];

  const getLayoutConfig = useCallback((layoutType: LayoutType) => {
    return layouts[layoutType];
  }, []);

  return {
    selectedLayout,
    setSelectedLayout,
    layoutOptions,
    getLayoutConfig,
  };
};
