import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "./store"; // Import the AppDispatch type
import { fetchGraphDataThunk } from "./fetchGraphData"; // Importing the thunk action
import CytoscapeComponent from "react-cytoscapejs";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { JSONEditor } from "./JSONEditor";
import { layouts } from "./layouts";
import setupCy from "./setupCy";
import cytoscape, { Stylesheet } from "cytoscape";

// Setup Cytoscape if needed
setupCy();

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function getDefaultStylesheet() {
  return [
    { 
      selector: "node",
      style: { 
        label: "data(label)",
      },
      css: {
        'shape': 'rectangle',
        'content': 'data(id)',
        'text-valign': 'center',
        'text-halign': 'center'
      }
    }, 
    {
      selector: 'edge',
      style: { 
        label: "data(label)",
        width: 5,
        targetArrowShape: 'triangle',
        curveStyle: 'bezier'
      },
      css: {
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle'
      }
    },
    {
      selector: "node[parent]",
      style: { 
        'background-color': '#90caf9', // Parent node background color
        'border-color': '#1e88e5', // Parent node border color
        'border-width': '2px',
        'shape': 'round-rectangle',
      }
    },
  ];
}

export default function App() {
  const dispatch = useDispatch<AppDispatch>();  // Type the dispatch with AppDispatch
  const elements = useSelector((state: RootState) => state.graph.elements); // Access elements directly

  const [layout, setLayout] = useState(layouts.klay);
  const [stylesheet, setStylesheet] = useState<Stylesheet[]>(getDefaultStylesheet);

  // Fetch graph data when the component mounts
  useEffect(() => {
    dispatch(fetchGraphDataThunk()); // Dispatch the thunk to fetch data
  }, [dispatch]);

  return (
    <div className="App">
      <table>
        <tbody>
          <tr>
            <td className="c">
              <button onClick={() => dispatch(fetchGraphDataThunk())}>Sync</button>
              <br />
              Layout preset:
              <br />
              <select
                size={Object.keys(layouts).length}
                onChange={(e) => setLayout({ ...layouts[e.target.value] })}
              >
                {Object.keys(layouts).map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <br />
              Layout config:
              <br />
              <JSONEditor value={layout} onChange={setLayout} />
              <br />
              Stylesheet:
              <br />
              <JSONEditor value={stylesheet} onChange={setStylesheet} />
            </td>
            <td>
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <CytoscapeComponent
                  elements={elements} // Use the elements from the Redux store directly
                  style={{
                    width: "2000px",
                    height: "1000px",
                    border: "1px solid black",
                    margin: "10%"
                  }}
                  layout={layout}
                  stylesheet={stylesheet}
                />
              </ErrorBoundary>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
