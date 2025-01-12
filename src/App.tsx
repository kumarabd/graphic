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
  return [{ 
    selector: "node",
    style: { 
      label: "data(label)",
    },
  }, {
    selector: 'edge',
    style: { 
      label: "data(label)",
      width: 5,
      targetArrowShape: 'triangle',
      curveStyle: 'bezier'
    },
  }];
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
                    width: "800px",
                    height: "500px",
                    border: "1px solid black",
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
