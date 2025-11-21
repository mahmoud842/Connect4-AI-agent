import { useNavigate, useLocation } from "react-router-dom";
import "./TreeVisualizationNew.css";

// Mock tree data for Minimax
const mockMinimaxTree = {
  value: 5,
  player: "MAX",
  depth: 0,
  move: null,
  edgeLabel: "L",
  children: [
    {
      value: 3,
      player: "MIN",
      depth: 1,
      move: 0,
      edgeLabel: "L",
      children: [
        {
          value: 3,
          player: "LEAF",
          depth: 2,
          move: 0,
          edgeLabel: "L",
          children: [],
        },
        {
          value: 5,
          player: "LEAF",
          depth: 2,
          move: 1,
          edgeLabel: "R",
          children: [],
        },
      ],
    },
    {
      value: 9,
      player: "MIN",
      depth: 1,
      move: 1,
      edgeLabel: "R",
      children: [
        {
          value: 2,
          player: "LEAF",
          depth: 2,
          move: 0,
          edgeLabel: "L",
          children: [],
        },
        {
          value: 9,
          player: "LEAF",
          depth: 2,
          move: 1,
          edgeLabel: "R",
          children: [],
        },
      ],
    },
  ],
};

// Mock tree data for Expectiminimax
const mockExpectiminimaxTree = {
  value: 4.8,
  player: "MAX",
  depth: 0,
  move: null,
  children: [
    {
      value: 4.5,
      player: "CHANCE",
      depth: 1,
      move: 0,
      probability: 0.5,
      children: [
        {
          value: 3.2,
          player: "LEAF",
          depth: 2,
          move: 0,
          probability: 0.7,
          children: [],
        },
        {
          value: 5.1,
          player: "LEAF",
          depth: 2,
          move: 1,
          probability: 0.3,
          children: [],
        },
      ],
    },
    {
      value: 4.8,
      player: "CHANCE",
      depth: 1,
      move: 1,
      probability: 0.3,
      children: [
        {
          value: 4.8,
          player: "LEAF",
          depth: 2,
          move: 0,
          probability: 0.5,
          children: [],
        },
        {
          value: 5.5,
          player: "LEAF",
          depth: 2,
          move: 1,
          probability: 0.5,
          children: [],
        },
      ],
    },
  ],
};

function TreeNode({ node, isExpectiminimax, isRoot = false }) {
  const getNodeStyle = (player) => {
    if (player === "MAX") {
      return { bg: "#fff", border: "#fff", color: "#000" };
    }
    if (player === "MIN") {
      return { bg: "#333", border: "#333", color: "#fff" };
    }
    if (player === "CHANCE") {
      return { bg: "#ff9800", border: "#ff9800", color: "#fff" };
    }
    if (player === "LEAF") {
      return { bg: "#4caf50", border: "#4caf50", color: "#fff" };
    }
    return { bg: "#9e9e9e", border: "#9e9e9e", color: "#fff" };
  };

  const style = getNodeStyle(node.player);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="tree-node-wrapper">
      <div className="tree-node-container">
        <div
          className="tree-circle"
          style={{
            backgroundColor: style.bg,
            border: `3px solid ${style.border}`,
          }}
        >
          {node.player !== "LEAF" && (
            <div className="node-label" style={{ color: style.color }}>
              {node.player}
            </div>
          )}
          <div className="node-value" style={{ color: style.color }}>
            {typeof node.value === "number"
              ? node.value.toFixed(node.player === "LEAF" ? 0 : 1)
              : node.value}
          </div>
          {isExpectiminimax && node.probability && (
            <div
              className="node-prob"
              style={{ color: style.color, opacity: 0.8 }}
            >
              p={node.probability}
            </div>
          )}
        </div>
      </div>

      {hasChildren && (
        <div className="tree-children-wrapper">
          <div className="children-row">
            {node.children.map((child, index) => (
              <div key={index} className="child-branch">
                <div className="branch-line-container">
                  <svg
                    className="branch-svg"
                    viewBox="0 0 100 60"
                    preserveAspectRatio="none"
                  >
                    <line
                      x1="50"
                      y1="0"
                      x2="50"
                      y2="60"
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth="2"
                    />
                  </svg>
                  {child.edgeLabel && (
                    <div className="edge-label">{child.edgeLabel}</div>
                  )}
                </div>
                <TreeNode node={child} isExpectiminimax={isExpectiminimax} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TreeVisualization() {
  const navigate = useNavigate();
  const location = useLocation();
  const config = location.state?.config || { algorithm: "minimax" };

  const isExpectiminimax = config.algorithm === "expectiminimax";
  const treeData = isExpectiminimax ? mockExpectiminimaxTree : mockMinimaxTree;

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="tree-visualization-container">
      <div className="tree-header">
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

      <div className="tree-content">
        <div className="tree-wrapper">
          <TreeNode
            node={treeData}
            isExpectiminimax={isExpectiminimax}
            isRoot={true}
          />
        </div>
      </div>

      <div className="tree-info">
        <div className="info-card">
          <h3>📖 How to Read This Tree</h3>
          <ul>
            <li>
              <strong>⚪ MAX nodes (white):</strong> AI tries to maximize the
              score
            </li>
            <li>
              <strong>⚫ MIN nodes (black):</strong> Opponent tries to minimize
              the score
            </li>
            {isExpectiminimax && (
              <li>
                <strong>🟠 CHANCE nodes (orange):</strong> Probabilistic
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
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TreeVisualization;
