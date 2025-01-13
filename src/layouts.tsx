export const layouts: Record<string, any> = {
    random: {
      name: "random",
      animate: true,
      nodeOverlap: 10,
      refresh: 20,
      fit: true,
      padding: 0,
      randomize: false,
      componentSpacing: 100,
      nodeRepulsion: 400000,
      nestingFactor: 5,
      gravity: 80,
      numIter: 1000,
      initialTemp: 200,
      coolingFactor: 0.95,
      minTemp: 1.0
    },
    grid: {
      name: "grid",
      animate: true,
      nodeOverlap: 10,
      refresh: 20,
      fit: true,
      padding: 0,
      randomize: false,
      componentSpacing: 100,
      nodeRepulsion: 400000,
      nestingFactor: 5,
      gravity: 80,
      numIter: 1000,
      initialTemp: 200,
      coolingFactor: 0.95,
      minTemp: 1.0
    },
    circle: {
      name: "circle",
      animate: true,
      nodeOverlap: 10,
      refresh: 20,
      fit: true,
      padding: 0,
      randomize: false,
      componentSpacing: 100,
      nodeRepulsion: 400000,
      nestingFactor: 5,
      gravity: 80,
      numIter: 1000,
      initialTemp: 200,
      coolingFactor: 0.95,
      minTemp: 1.0
    },
    breadthfirst: {
      name: "breadthfirst",
      animate: true,
      nodeOverlap: 10,
      refresh: 20,
      fit: true,
      padding: 0,
      randomize: false,
      componentSpacing: 100,
      nodeRepulsion: 400000,
      nestingFactor: 5,
      gravity: 80,
      numIter: 1000,
      initialTemp: 200,
      coolingFactor: 0.95,
      minTemp: 1.0
    },
    klay: {
      name: "klay",
      animate: true,
      padding: 4,
      nodeDimensionsIncludeLabels: true,
      klay: {
        spacing: 40,
        mergeEdges: false
      },
      nodeOverlap: 10,
      refresh: 20,
      fit: true,
      randomize: false,
      componentSpacing: 100,
      nodeRepulsion: 400000,
      nestingFactor: 5,
      gravity: 80,
      numIter: 1000,
      initialTemp: 200,
      coolingFactor: 0.95,
      minTemp: 1.0
    },
    fcose: {
      name: "fcose",
      animate: true,
      nodeOverlap: 10,
      refresh: 20,
      fit: true,
      padding: 0,
      randomize: false,
      componentSpacing: 100,
      nodeRepulsion: 400000,
      nestingFactor: 5,
      gravity: 80,
      numIter: 1000,
      initialTemp: 200,
      coolingFactor: 0.95,
      minTemp: 1.0
    },
    cose: {
      name: "cose",
      idealEdgeLength: 80,
      // edgeElasticity: edge => 16 + 220 * ((35 - edge.data().weight) / 35),
      nodeOverlap: 10,
      refresh: 20,
      fit: true,
      padding: 0,
      randomize: false,
      componentSpacing: 100,
      nodeRepulsion: 400000,
      nestingFactor: 5,
      gravity: 80,
      numIter: 1000,
      initialTemp: 200,
      coolingFactor: 0.95,
      minTemp: 1.0
    },
  
    cola: {
      name: "cola",
      animate: true,
      maxSimulationTime: 40000,
      nodeOverlap: 10,
      refresh: 20,
      fit: true,
      padding: 0,
      randomize: false,
      componentSpacing: 100,
      nodeRepulsion: 400000,
      nestingFactor: 5,
      gravity: 80,
      numIter: 1000,
      initialTemp: 200,
      coolingFactor: 0.95,
      minTemp: 1.0
    },
    dagre: {
      name: "dagre",
      animate: true,
      nodeOverlap: 10,
      refresh: 20,
      fit: true,
      padding: 0,
      randomize: false,
      componentSpacing: 100,
      nodeRepulsion: 400000,
      nestingFactor: 5,
      gravity: 80,
      numIter: 1000,
      initialTemp: 200,
      coolingFactor: 0.95,
      minTemp: 1.0
    }
  };
  
  ["box", "disco", "force", "layered", "mrtree", "random", "stress"].forEach(
    (elkAlgo) => {
      layouts[`elk_${elkAlgo}`] = {
        name: "elk",
        animate: true,
        elk: {
          algorithm: elkAlgo
        }
      };
    }
  );
  