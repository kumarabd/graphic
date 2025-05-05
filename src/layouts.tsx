import cytoscape from 'cytoscape';
import { LayoutOptions } from 'cytoscape';

// Helper function to convert node function to string for serialization
const toNodeFn = (val: number) => (node: any) => val;
const toEdgeFn = (val: number) => (edge: any) => val;

// Extended layout options type that includes all possible layout properties
type ExtendedLayoutOptions = LayoutOptions & {
  [key: string]: any;
};

type LayoutConfig = {
  [key: string]: ExtendedLayoutOptions;
};

export const breadthfirstLayout: ExtendedLayoutOptions = {
  name: 'breadthfirst',
  fit: true,
  directed: true,
  padding: 50,
  spacingFactor: 1.2,
  animate: true,
  animationDuration: 1000,
} as const;

export const circleLayout: ExtendedLayoutOptions = {
  name: 'circle',
  fit: true,
  padding: 50,
  animate: true,
  animationDuration: 1000,
  radius: 500,
} as const;

export const concentricLayout: ExtendedLayoutOptions = {
  name: 'concentric',
  fit: true,
  padding: 50,
  animate: true,
  animationDuration: 1000,
  minNodeSpacing: 50,
  equidistant: false,
  levelWidth: () => 1,
} as const;

export const coseLayout: ExtendedLayoutOptions = {
  name: 'cose',
  animate: true,
  fit: true,
  padding: 50,
  nodeDimensionsIncludeLabels: true,
  randomize: true,
  componentSpacing: 100,
  nodeRepulsion: toNodeFn(400000),
  nodeOverlap: 10,
  idealEdgeLength: toEdgeFn(100),
  edgeElasticity: toEdgeFn(100),
  nestingFactor: 5,
  gravity: 80,
  numIter: 1000,
  initialTemp: 200,
  coolingFactor: 0.95,
  minTemp: 1.0,
} as const;

export const fcoseLayout: ExtendedLayoutOptions = {
  name: 'fcose',
  animate: true,
  fit: true,
  padding: 50,
  nodeDimensionsIncludeLabels: true,
  randomize: true,
  componentSpacing: 100,
  nodeRepulsion: toNodeFn(400000),
  nodeOverlap: 10,
  idealEdgeLength: toEdgeFn(100),
  edgeElasticity: toEdgeFn(100),
  nestingFactor: 5,
  gravity: 80,
  numIter: 1000,
  initialTemp: 200,
  coolingFactor: 0.95,
  minTemp: 1.0,
} as const;

export const gridLayout: ExtendedLayoutOptions = {
  name: 'grid',
  fit: true,
  padding: 50,
  animate: true,
  animationDuration: 1000,
  avoidOverlap: true,
  nodeDimensionsIncludeLabels: true,
} as const;

export const klayLayout: ExtendedLayoutOptions = {
  name: 'klay',
  animate: true,
  nodeDimensionsIncludeLabels: true,
  fit: true,
  padding: 50,
  klay: {
    direction: 'DOWN',
    spacing: 50,
    nodeLayering: 'NETWORK_SIMPLEX',
    nodePlacement: 'BRANDES_KOEPF',
    edgeRouting: 'ORTHOGONAL',
    aspectRatio: 1.6,
  },
} as const;

export const colaLayout: ExtendedLayoutOptions = {
  name: 'cola',
  animate: true,
  maxSimulationTime: 40000,
  nodeOverlap: 10,
  refresh: 20,
  fit: true,
  padding: 50,
  randomize: false,
  componentSpacing: 100,
  nodeRepulsion: toNodeFn(400000),
  nestingFactor: 5,
  gravity: 80,
  numIter: 1000,
  initialTemp: 200,
  coolingFactor: 0.95,
  minTemp: 1.0,
} as const;

export const dagreLayout: ExtendedLayoutOptions = {
  name: 'dagre',
  animate: true,
  fit: true,
  padding: 50,
  nodeDimensionsIncludeLabels: true,
  rankDir: 'TB',
  ranker: 'network-simplex',
  spacingFactor: 1.2,
} as const;

// ELK layouts with specific configurations
export const elkLayouts: Record<string, ExtendedLayoutOptions> = {
  elk_box: {
    name: 'elk',
    animate: true,
    fit: true,
    padding: 50,
    elk: {
      algorithm: 'box',
      'elk.direction': 'DOWN',
      'elk.spacing.nodeNode': '50',
      'elk.padding': '[top=50,left=50,bottom=50,right=50]',
    },
  } as const,
  elk_disco: {
    name: 'elk',
    animate: true,
    fit: true,
    padding: 50,
    elk: {
      algorithm: 'disco',
      'elk.direction': 'DOWN',
      'elk.spacing.nodeNode': '50',
      'elk.padding': '[top=50,left=50,bottom=50,right=50]',
    },
  } as const,
  elk_force: {
    name: 'elk',
    animate: true,
    fit: true,
    padding: 50,
    elk: {
      algorithm: 'force',
      'elk.direction': 'DOWN',
      'elk.spacing.nodeNode': '50',
      'elk.padding': '[top=50,left=50,bottom=50,right=50]',
    },
  } as const,
  elk_layered: {
    name: 'elk',
    animate: true,
    fit: true,
    padding: 50,
    elk: {
      algorithm: 'layered',
      'elk.direction': 'DOWN',
      'elk.spacing.nodeNode': '50',
      'elk.layered.spacing.nodeNodeBetweenLayers': '100',
      'elk.padding': '[top=50,left=50,bottom=50,right=50]',
    },
  } as const,
  elk_mrtree: {
    name: 'elk',
    animate: true,
    fit: true,
    padding: 50,
    elk: {
      algorithm: 'mrtree',
      'elk.direction': 'DOWN',
      'elk.spacing.nodeNode': '50',
      'elk.padding': '[top=50,left=50,bottom=50,right=50]',
    },
  } as const,
  elk_random: {
    name: 'elk',
    animate: true,
    fit: true,
    padding: 50,
    elk: {
      algorithm: 'random',
      'elk.direction': 'DOWN',
      'elk.spacing.nodeNode': '50',
      'elk.padding': '[top=50,left=50,bottom=50,right=50]',
    },
  } as const,
  elk_stress: {
    name: 'elk',
    animate: true,
    fit: true,
    padding: 50,
    elk: {
      algorithm: 'stress',
      'elk.direction': 'DOWN',
      'elk.spacing.nodeNode': '50',
      'elk.padding': '[top=50,left=50,bottom=50,right=50]',
    },
  } as const,
};

// Export all layouts in a single object
export const layouts: LayoutConfig = {
  breadthfirst: breadthfirstLayout,
  circle: circleLayout,
  concentric: concentricLayout,
  cose: coseLayout,
  fcose: fcoseLayout,
  grid: gridLayout,
  klay: klayLayout,
  cola: colaLayout,
  dagre: dagreLayout,
  ...elkLayouts,
};