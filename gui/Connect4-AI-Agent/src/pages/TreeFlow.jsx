import { useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./TreeFlow.css";

// Custom node component
function CustomNode({ data }) {
  const getNodeStyle = () => {
    if (data.player === "MAX") {
      return {
        backgroundColor: "#ff4444",
        color: "#fff",
        borderColor: "#cc0000",
      };
    }
    if (data.player === "MIN") {
      return {
        backgroundColor: "#ffdd44",
        color: "#000",
        borderColor: "#ffbb00",
      };
    }
    if (data.player === "CHANCE") {
      return {
        backgroundColor: "#9c27b0",
        color: "#fff",
        borderColor: "#7b1fa2",
      };
    }
    return {
      backgroundColor: "#4caf50",
      color: "#fff",
      borderColor: "#388e3c",
    };
  };

  const style = getNodeStyle();

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0, top: 0 }}
      />
      <div
        className="custom-node"
        style={{
          backgroundColor: style.backgroundColor,
          color: style.color,
          borderColor: style.borderColor,
        }}
      >
        {data.player !== "LEAF" && (
          <div className="node-type">{data.player}</div>
        )}
        <div className="node-value">{data.value}</div>
        {data.probability && (
          <div className="node-prob">p={data.probability}</div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0, bottom: 0 }}
      />
    </>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

// Calculate tree layout with proper positioning
function calculateTreeLayout(tree, level = 0) {
  if (!tree.children || tree.children.length === 0) {
    return { width: 1, positions: [] };
  }

  // Recursively calculate layout for all children
  const childLayouts = tree.children.map((child) =>
    calculateTreeLayout(child, level + 1)
  );

  // Total width is sum of all children widths
  const totalWidth = childLayouts.reduce(
    (sum, layout) => sum + layout.width,
    0
  );

  return { width: totalWidth, childLayouts };
}

// Convert tree data to React Flow format with proper centering
function convertTreeToFlow(
  tree,
  isExpectiminimax,
  parentId = null,
  leftOffset = 0,
  y = 0,
  level = 0,
  nodeCounter = { count: 0 }
) {
  const nodes = [];
  const edges = [];
  const nodeId = `node-${nodeCounter.count++}`;

  const horizontalSpacing = 120; // Space between leaf nodes
  const verticalSpacing = 150; // Space between levels

  // Calculate layout for this subtree
  const layout = calculateTreeLayout(tree, level);

  // Position current node at the center of its subtree
  const myWidth = layout.width * horizontalSpacing;
  const x = leftOffset + myWidth / 2;

  // Add current node
  nodes.push({
    id: nodeId,
    type: "custom",
    position: { x: x, y: y },
    data: {
      player: tree.player,
      value:
        typeof tree.value === "number"
          ? tree.value.toFixed(tree.player === "LEAF" ? 0 : 1)
          : tree.value,
      probability: tree.probability,
    },
  });

  // Add edge from parent if this is not the root
  if (parentId) {
    edges.push({
      id: `edge-${parentId}-${nodeId}`,
      source: parentId,
      target: nodeId,
      type: "straight",
      animated: false,
      style: { stroke: "#fff", strokeWidth: 3 },
    });
  }

  // Process children
  if (tree.children && tree.children.length > 0) {
    let childLeftOffset = leftOffset;

    tree.children.forEach((child, index) => {
      const childLayout = layout.childLayouts[index];
      const childY = y + verticalSpacing;

      // Recursively convert children
      const { nodes: childNodes, edges: childEdges } = convertTreeToFlow(
        child,
        isExpectiminimax,
        nodeId,
        childLeftOffset,
        childY,
        level + 1,
        nodeCounter
      );

      nodes.push(...childNodes);
      edges.push(...childEdges);

      // Move offset for next child
      childLeftOffset += childLayout.width * horizontalSpacing;
    });
  }

  return { nodes, edges };
}

// Mock tree data
const mockMinimaxTree = {
  value: 5,
  player: "MAX",
  children: [
    {
      value: 3,
      player: "MIN",
      children: [
        {
          value: 3,
          player: "MAX",
          children: [
            { value: 3, player: "LEAF", children: [] },
            { value: 5, player: "LEAF", children: [] },
            { value: 1, player: "LEAF", children: [] },
          ],
        },
        {
          value: 5,
          player: "MAX",
          children: [
            { value: 2, player: "LEAF", children: [] },
            { value: 5, player: "LEAF", children: [] },
          ],
        },
      ],
    },
    {
      value: 5,
      player: "MIN",
      children: [
        {
          value: 4,
          player: "MAX",
          children: [
            { value: 4, player: "LEAF", children: [] },
            { value: 6, player: "LEAF", children: [] },
          ],
        },
        {
          value: 5,
          player: "MAX",
          children: [
            { value: 5, player: "LEAF", children: [] },
            { value: 7, player: "LEAF", children: [] },
            { value: 3, player: "LEAF", children: [] },
          ],
        },
      ],
    },
    {
      value: 9,
      player: "MIN",
      children: [
        {
          value: 8,
          player: "MAX",
          children: [
            { value: 8, player: "LEAF", children: [] },
            { value: 2, player: "LEAF", children: [] },
          ],
        },
        {
          value: 9,
          player: "MAX",
          children: [
            { value: 9, player: "LEAF", children: [] },
            { value: 6, player: "LEAF", children: [] },
          ],
        },
      ],
    },
  ],
};

const mockExpectiminimaxTree = {
  value: 4.8,
  player: "MAX",
  children: [
    {
      value: 4.5,
      player: "CHANCE",
      children: [
        {
          value: 3.2,
          player: "MIN",
          children: [
            { value: 3.2, player: "LEAF", children: [] },
            { value: 4.1, player: "LEAF", children: [] },
          ],
        },
        {
          value: 5.1,
          player: "MIN",
          children: [
            { value: 5.1, player: "LEAF", children: [] },
            { value: 6.2, player: "LEAF", children: [] },
            { value: 4.8, player: "LEAF", children: [] },
          ],
        },
      ],
    },
    {
      value: 4.8,
      player: "CHANCE",
      children: [
        {
          value: 4.8,
          player: "MIN",
          children: [
            { value: 4.8, player: "LEAF", children: [] },
            { value: 3.9, player: "LEAF", children: [] },
          ],
        },
        {
          value: 5.5,
          player: "MIN",
          children: [
            { value: 5.5, player: "LEAF", children: [] },
            { value: 7.2, player: "LEAF", children: [] },
          ],
        },
      ],
    },
    {
      value: 5.2,
      player: "CHANCE",
      children: [
        {
          value: 5.2,
          player: "MIN",
          children: [
            { value: 5.2, player: "LEAF", children: [] },
            { value: 6.1, player: "LEAF", children: [] },
          ],
        },
        {
          value: 4.9,
          player: "MIN",
          children: [
            { value: 4.9, player: "LEAF", children: [] },
            { value: 5.8, player: "LEAF", children: [] },
            { value: 3.7, player: "LEAF", children: [] },
          ],
        },
      ],
    },
  ],
};

function TreeFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const config = location.state?.config || { algorithm: "minimax" };

  const isExpectiminimax = config.algorithm === "expectiminimax";
  const treeData = isExpectiminimax ? mockExpectiminimaxTree : mockMinimaxTree;

  // Convert tree to flow format
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const result = convertTreeToFlow(
      treeData,
      isExpectiminimax,
      null,
      0,
      50,
      0,
      { count: 0 }
    );
    console.log("Generated nodes:", result.nodes);
    console.log("Generated edges:", result.edges);
    return result;
  }, [treeData, isExpectiminimax]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  console.log(
    "Rendering TreeFlow with",
    nodes.length,
    "nodes and",
    edges.length,
    "edges"
  );

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <ReactFlowProvider>
      <div className="tree-flow-container">
        <div className="tree-flow-header">
          <button className="back-button" onClick={handleBack}>
            ← Back to Game
          </button>
          <div className="tree-title">
            <h1>{isExpectiminimax ? "Expectiminimax" : "Minimax"} Tree</h1>
            <p className="tree-subtitle">
              {config.useAlphaBeta && "⚡ Alpha-Beta Pruning Enabled"}
            </p>
          </div>
          <div className="tree-legend">
            <div className="legend-item">
              <div className="legend-circle max"></div>
              <span>MAX</span>
            </div>
            <div className="legend-item">
              <div className="legend-circle min"></div>
              <span>MIN</span>
            </div>
            {isExpectiminimax && (
              <div className="legend-item">
                <div className="legend-circle chance"></div>
                <span>CHANCE</span>
              </div>
            )}
            <div className="legend-item">
              <div className="legend-circle leaf"></div>
              <span>LEAF</span>
            </div>
          </div>
        </div>

        <div className="tree-flow-wrapper">
          {nodes.length > 0 ? (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              panOnDrag={true}
              zoomOnScroll={true}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.1}
              maxZoom={2}
            >
              <Background color="#555" gap={16} />
              <Controls />
              <MiniMap
                nodeColor={(node) => {
                  if (node.data.player === "MAX") return "#ff4444";
                  if (node.data.player === "MIN") return "#ffdd44";
                  if (node.data.player === "CHANCE") return "#9c27b0";
                  return "#4caf50";
                }}
                maskColor="rgba(0, 0, 0, 0.6)"
              />
            </ReactFlow>
          ) : (
            <div
              style={{ color: "white", padding: "20px", textAlign: "center" }}
            >
              Loading tree...
            </div>
          )}
        </div>

        <div className="tree-info">
          <div className="info-card">
            <h3>📖 How to Read This Tree</h3>
            <ul>
              <li>
                <strong>🔴 MAX nodes (red):</strong> AI tries to maximize the
                score
              </li>
              <li>
                <strong>🟡 MIN nodes (yellow):</strong> Opponent tries to
                minimize the score
              </li>
              {isExpectiminimax && (
                <li>
                  <strong>🟣 CHANCE nodes (purple):</strong> Probabilistic
                  outcomes
                </li>
              )}
              <li>
                <strong>🟢 LEAF nodes (green):</strong> Terminal states with
                evaluation scores
              </li>
              <li>
                <strong>Values:</strong> Evaluation scores at each state
              </li>
              {!isExpectiminimax && (
                <li>
                  <strong>L/R labels:</strong> Left and Right branches
                </li>
              )}
              <li>
                <strong>Pan:</strong> Click and drag to move around
              </li>
              <li>
                <strong>Zoom:</strong> Use mouse wheel or controls
              </li>
            </ul>
          </div>
        </div>
      </div>
    </ReactFlowProvider>
  );
}

export default TreeFlow;
