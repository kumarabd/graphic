import cytoscape from "cytoscape"; // Default import
import klay from "cytoscape-klay";
import fcose from "cytoscape-fcose";
import cola from "cytoscape-cola";
import elk from "cytoscape-elk";
import dagre from "cytoscape-dagre";

let extensionsRegistered = false;

// Setup function to register Cytoscape extensions
export default function setupCy() {
  try {
    // Register extensions if they haven't been registered yet
    if (!extensionsRegistered) {
      cytoscape.use(klay);
      cytoscape.use(fcose);
      cytoscape.use(cola);
      cytoscape.use(elk);
      cytoscape.use(dagre);
      extensionsRegistered = true;
    }
  } catch (error) {
    console.error("Error initializing Cytoscape extensions:", error);
  }
}
