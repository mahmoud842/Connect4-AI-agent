import { useNavigate, useLocation } from "react-router-dom";
import "./TreeVisualization.css";

// Mock tree data for Minimax
const mockMinimaxTree = {
  value: 5,
  player: "MAX",
  depth: 0,
  move: null,
  children: [
    {
      value: 3,
      player: "MIN",
      depth: 1,
      move: 0,
      children: [
        {
          value: 3,
          player: "MAX",
          depth: 2,
          move: 0,
          children: [
            { value: 3, player: "MIN", depth: 3, move: 1, children: [] },
            { value: 5, player: "MIN", depth: 3, move: 2, children: [] },
          ],
        },
        {
          value: 7,
          player: "MAX",
          depth: 2,
          move: 1,
          children: [
            { value: 7, player: "MIN", depth: 3, move: 0, children: [] },
            { value: 8, player: "MIN", depth: 3, move: 3, children: [] },
          ],
        },
      ],
    },
    {
      value: 5,
      player: "MIN",
      depth: 1,
      move: 1,
      children: [
        {
          value: 5,
          player: "MAX",
          depth: 2,
          move: 2,
          children: [
            { value: 5, player: "MIN", depth: 3, move: 1, children: [] },
            { value: 6, player: "MIN", depth: 3, move: 4, children: [] },
          ],
        },
        {
          value: 9,
          player: "MAX",
          depth: 2,
          move: 3,
          children: [
            { value: 9, player: "MIN", depth: 3, move: 0, children: [] },
            { value: 4, player: "MIN", depth: 3, move: 5, children: [] },
          ],
        },
      ],
    },
    {
      value: 2,
      player: "MIN",
      depth: 1,
      move: 2,
      children: [
        {
          value: 2,
          player: "MAX",
          depth: 2,
          move: 4,
          children: [
            { value: 2, player: "MIN", depth: 3, move: 2, children: [] },
            { value: 1, player: "MIN", depth: 3, move: 6, children: [] },
          ],
        },
        {
          value: 6,
          player: "MAX",
          depth: 2,
          move: 5,
          children: [
            { value: 6, player: "MIN", depth: 3, move: 1, children: [] },
            { value: 3, player: "MIN", depth: 3, move: 3, children: [] },
          ],
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
          player: "MAX",
          depth: 2,
          move: 0,
          children: [
            {
              value: 3.2,
              player: "CHANCE",
              depth: 3,
              move: 1,
              probability: 0.7,
              children: [],
            },
            {
              value: 5.1,
              player: "CHANCE",
              depth: 3,
              move: 2,
              probability: 0.3,
              children: [],
            },
          ],
        },
        {
          value: 6.8,
          player: "MAX",
          depth: 2,
          move: 1,
          children: [
            {
              value: 6.8,
              player: "CHANCE",
              depth: 3,
              move: 0,
              probability: 0.6,
              children: [],
            },
            {
              value: 7.2,
              player: "CHANCE",
              depth: 3,
              move: 3,
              probability: 0.4,
              children: [],
            },
          ],
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
          player: "MAX",
          depth: 2,
          move: 2,
          children: [
            {
              value: 4.8,
              player: "CHANCE",
              depth: 3,
              move: 1,
              probability: 0.5,
              children: [],
            },
            {
              value: 5.5,
              player: "CHANCE",
              depth: 3,
              move: 4,
              probability: 0.5,
              children: [],
            },
          ],
        },
        {
          value: 8.1,
          player: "MAX",
          depth: 2,
          move: 3,
          children: [
            {
              value: 8.1,
              player: "CHANCE",
              depth: 3,
              move: 0,
              probability: 0.8,
              children: [],
            },
            {
              value: 3.9,
              player: "CHANCE",
              depth: 3,
              move: 5,
              probability: 0.2,
              children: [],
            },
          ],
        },
      ],
    },
    {
      value: 3.1,
      player: "CHANCE",
      depth: 1,
      move: 2,
      probability: 0.2,
      children: [
        {
          value: 3.1,
          player: "MAX",
          depth: 2,
          move: 4,
          children: [
            {
              value: 3.1,
              player: "CHANCE",
              depth: 3,
              move: 2,
              probability: 0.6,
              children: [],
            },
            {
              value: 2.5,
              player: "CHANCE",
              depth: 3,
              move: 6,
              probability: 0.4,
              children: [],
            },
          ],
        },
        {
          value: 5.7,
          player: "MAX",
          depth: 2,
          move: 5,
          children: [
            {
              value: 5.7,
              player: "CHANCE",
              depth: 3,
              move: 1,
              probability: 0.7,
              children: [],
            },
            {
              value: 4.2,
              player: "CHANCE",
              depth: 3,
              move: 3,
              probability: 0.3,
              children: [],
            },
          ],
        },
      ],
    },
  ],
};

function TreeNode({ node, isExpectiminimax }) {
  const getNodeColor = (player) => {
    if (player === "MAX") return "#4caf50";
    if (player === "MIN") return "#f44336";
    if (player === "CHANCE") return "#ff9800";
    return "#9e9e9e";
  };

  return (
    <div className="tree-node-container">
      <div
        className={`tree-node ${node.player.toLowerCase()}`}
        style={{ borderColor: getNodeColor(node.player) }}
      >
        <div className="node-header">
          <span className="node-player">{node.player}</span>
          {node.move !== null && (
            <span className="node-move">Col: {node.move}</span>
          )}
        </div>
        <div className="node-value">
          {typeof node.value === "number" ? node.value.toFixed(1) : node.value}
        </div>
        {isExpectiminimax && node.probability && (
          <div className="node-probability">
            p={node.probability.toFixed(2)}
          </div>
        )}
      </div>

      {node.children && node.children.length > 0 && (
        <div className="tree-children">
          <div className="tree-line"></div>
          <div className="children-container">
            {node.children.map((child, index) => (
              <div key={index} className="child-wrapper">
                <div className="child-line"></div>
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
            <div className="legend-color max"></div>
            <span>MAX</span>
          </div>
          <div className="legend-item">
            <div className="legend-color min"></div>
            <span>MIN</span>
          </div>
          {isExpectiminimax && (
            <div className="legend-item">
              <div className="legend-color chance"></div>
              <span>CHANCE</span>
            </div>
          )}
        </div>
      </div>

      <div className="tree-content">
        <div className="tree-wrapper">
          <TreeNode node={treeData} isExpectiminimax={isExpectiminimax} />
        </div>
      </div>

      <div className="tree-info">
        <div className="info-card">
          <h3>How to Read This Tree</h3>
          <ul>
            <li>
              <strong>MAX nodes (green):</strong> AI tries to maximize the score
            </li>
            <li>
              <strong>MIN nodes (red):</strong> Opponent tries to minimize the
              score
            </li>
            {isExpectiminimax && (
              <li>
                <strong>CHANCE nodes (orange):</strong> Probabilistic outcomes
              </li>
            )}
            <li>
              <strong>Values:</strong> Evaluation scores at each state
            </li>
            <li>
              <strong>Column:</strong> The column where the move was made
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TreeVisualization;
