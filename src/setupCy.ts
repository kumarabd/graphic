import cytoscape from "cytoscape"; // Default import
import klay from "cytoscape-klay";
import fcose from "cytoscape-fcose";
import cola from "cytoscape-cola";
import elk from "cytoscape-elk";
import dagre from "cytoscape-dagre";

// Setup function to register Cytoscape extensions
export default function setupCy() {
  try {
    if (!cytoscape.prototype.hasInitialised) {
      cytoscape.use(klay);
      cytoscape.use(fcose);
      cytoscape.use(cola);
      cytoscape.use(elk);
      cytoscape.use(dagre);
      cytoscape.prototype.hasInitialised = true;
    }
  } catch (error) {
    console.error("Error initializing Cytoscape extensions:", error);
  }
}
