import React, { useCallback, useEffect, useRef, useState, ChangeEvent } from 'react';
import ReactFlow, {
  addEdge,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Position,
  Connection,
  ReactFlowProvider,
  NodeChange,
  OnConnect,
} from 'reactflow';
import dagre from 'dagre';
import CustomNode from './custom-nodes/CustomNodes';
import { initialNodes, initialEdges } from './nodes-edges';
import 'reactflow/dist/style.css';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 400; // Updated to match CustomNode width
const minDistance = 20;

const getNodeHeight = (fontSize: string, label: string): number => {
  const baseHeight = 36;
  const fontSizeNumber = parseInt(fontSize, 10);
  const lineHeight = baseHeight + (isNaN(fontSizeNumber) ? 0 : (fontSizeNumber - 14) * 1.2);
  const lines = label.split('\n').length;
  return lineHeight * lines;
};

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB', fontSize = '14px'): { nodes: Node[], edges: Edge[] } => {
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 180,  // spacing between nodes in the same rank
    ranksep: 190,  // spacing between nodes in different ranks
  });

  nodes.forEach((node) => {
    const nodeHeight = getNodeHeight(fontSize, node.data.label);
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Top;
    node.sourcePosition = Position.Bottom;

    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - (nodeWithPosition.height / 2),
    };

    node.height = nodeWithPosition.height;

    return node;
  });

  return { nodes, edges };
};

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);

const nodeTypes = { customNode: CustomNode };

const nodesOverlap = (node1: Node, node2: Node): boolean => {
  return !(
    node1.position.x + nodeWidth + minDistance < node2.position.x ||
    node1.position.x > node2.position.x + nodeWidth + minDistance ||
    node1.position.y + (node1.height || 0) + minDistance < node2.position.y ||
    node1.position.y > node2.position.y + (node2.height || 0) + minDistance
  );
};

const resolveOverlapsSmoothly = (nodes: Node[], iterations = 100, step = 5): Node[] => {
  const newNodes = [...nodes];
  let overlapsResolved = false;

  for (let iter = 0; iter < iterations; iter++) {
    overlapsResolved = true;

    for (let i = 0; i < newNodes.length; i++) {
      for (let j = i + 1; j < newNodes.length; j++) {
        if (nodesOverlap(newNodes[i], newNodes[j])) {
          overlapsResolved = false;

          const dx = newNodes[j].position.x - newNodes[i].position.x;
          const dy = newNodes[j].position.y - newNodes[i].position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDist = nodeWidth + minDistance;
          const moveDistance = step * (minDist - distance) / minDist;

          const angle = Math.atan2(dy, dx);
          const moveX = Math.cos(angle) * moveDistance;
          const moveY = Math.sin(angle) * moveDistance;

          // Move nodes apart smoothly
          newNodes[i].position.x -= moveX;
          newNodes[i].position.y -= moveY;
          newNodes[j].position.x += moveX;
          newNodes[j].position.y += moveY;

          // Additional step to avoid oscillation
          if (distance < minDist) {
            newNodes[i].position.x -= moveX;
            newNodes[i].position.y -= moveY;
            newNodes[j].position.x += moveX;
            newNodes[j].position.y += moveY;
          }
        }
      }
    }

    if (overlapsResolved) break;
  }

  return newNodes;
};

const getDescendants = (nodeId: string, nodes: Node[], edges: Edge[]): Node[] => {
  const children = edges.filter(edge => edge.source === nodeId).map(edge => edge.target);
  const descendants = nodes.filter(node => children.includes(node.id));
  children.forEach(childId => {
    descendants.push(...getDescendants(childId, nodes, edges));
  });
  return descendants;
};

const LayoutFlow: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  const [fontSize, setFontSize] = useState<string>('14px');
  const [jobTitleFontSize, setJobTitleFontSize] = useState<string>('14px');
  const [numberFontSize, setnumberFontSize] = useState<string>('14px');
  const resolveOverlapsRef = useRef<() => void>(() => resolveOverlapsSmoothly(nodes));

  useEffect(() => {
    resolveOverlapsRef.current = () => setNodes((nds) => resolveOverlapsSmoothly(nds));
  }, [nodes, setNodes]);

  const onConnect: OnConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) =>
        addEdge({ ...params, type: ConnectionLineType.SmoothStep, animated: true, sourceHandle: 'a', targetHandle: 'b' }, eds)
      ),
    [setEdges]
  );

  const onLayout = useCallback(
    (direction: string | undefined) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, direction, fontSize);
      setNodes(resolveOverlapsSmoothly(layoutedNodes));
      setEdges([...layoutedEdges]);
    },
    [nodes, edges, fontSize, setNodes, setEdges]
  );

  const onChange = useCallback(
    (id: string, label: string) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            node.data = {
              ...node.data,
              label,
            };
            node.height = getNodeHeight(fontSize, label); // update node height based on new label
          }
          return node;
        })
      );
    },
    [setNodes, fontSize]
  );

  const handleNodesChange = (changes: NodeChange[]) => {
    onNodesChange(changes);
    resolveOverlapsRef.current();
  };

  const handleNodeDragStop = (_: any, node: Node) => {
    setNodes((nds) => {
      const dx = node.position.x - nds.find((n) => n.id === node.id)!.position.x;
      const dy = node.position.y - nds.find((n) => n.id === node.id)!.position.y;

      const descendants = getDescendants(node.id, nds, edges);
      const updatedNodes = nds.map((n) => {
        if (descendants.includes(n)) {
          return {
            ...n,
            position: {
              x: n.position.x + dx,
              y: n.position.y + dy,
            },
          };
        }
        return n.id === node.id ? node : n;
      });

      return resolveOverlapsSmoothly(updatedNodes);
    });
  };

  const handleNodeDrag = (_: any, node: Node) => {
    setNodes((nds) => {
      const dx = node.position.x - nds.find((n) => n.id === node.id)!.position.x;
      const dy = node.position.y - nds.find((n) => n.id === node.id)!.position.y;

      const descendants = getDescendants(node.id, nds, edges);
      const updatedNodes = nds.map((n) => {
        if (descendants.includes(n)) {
          return {
            ...n,
            position: {
              x: n.position.x + dx,
              y: n.position.y + dy,
            },
          };
        }
        return n.id === node.id ? node : n;
      });

      return updatedNodes;
    });
  };

  const handleTitleFontSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    let newFontSize = event.target.value;
    if (parseInt(newFontSize, 10) > 18) {
      newFontSize = '18px';
    } else if (parseInt(newFontSize, 10) < 1) {
      newFontSize = '1px'; // Ensure a minimum font size of 1px
    }

    setFontSize(newFontSize);

    const updatedNodes = nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        fontSize: newFontSize,
      },
      height: getNodeHeight(newFontSize, node.data.label)
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(updatedNodes, edges, 'TB', newFontSize);
    setNodes(resolveOverlapsSmoothly(layoutedNodes));
    setEdges([...layoutedEdges]);
  };

  const handleJobTitleFontSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    let newFontSize = event.target.value;
    if (parseInt(newFontSize, 10) > 18) {
      newFontSize = '18px';
    } else if (parseInt(newFontSize, 10) < 1) {
      newFontSize = '1px'; // Ensure a minimum font size of 1px
    }

    setJobTitleFontSize(newFontSize);

    const updatedNodes = nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        jobTitleFontSize: newFontSize,
      }
    }));

    setNodes(resolveOverlapsSmoothly(updatedNodes));
  };

  const handleNumberFontSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    let newFontSize = event.target.value;
    if (parseInt(newFontSize, 10) > 18) {
      newFontSize = '18px';
    } else if (parseInt(newFontSize, 10) < 1) {
      newFontSize = '1px'; // Ensure a minimum font size of 1px
    }

    setnumberFontSize(newFontSize);

    const updatedNodes = nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        numberFontSize: newFontSize,
      }
    }));

    setNodes(resolveOverlapsSmoothly(updatedNodes));
  };

  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, 'TB', fontSize);
    setNodes(resolveOverlapsSmoothly(layoutedNodes));
    setEdges([...layoutedEdges]);
  }, [fontSize]);

  return (
    <>
      <div style={{width: '50%', display: 'flex', flexDirection: "column", justifyContent: 'flex-start',  gap: '15px' }}>
        <table>
          <tbody>
            <tr>
              <th style={{ textAlign: 'start' }}><label htmlFor="fontSize">Bo'linmalar shrift hajmi (min 1px, max 18px)</label></th>
              <td >
                <input
                  style={{ width: '100%', height: '100%', border: "none", background: 'inherit', outline: 'none' }}
                  placeholder="add here font size"
                  id="fontSize"
                  name="fontSize"
                  value={fontSize}
                  onChange={handleTitleFontSizeChange}
                />
              </td>
            </tr>
            <tr>
              <th style={{ textAlign: 'start' }}><label htmlFor="jobTitleFontSize">Lavozimlar shrift hajmi (min 1px, max 18px)</label></th>
              <td>
                <input
                  style={{ width: '100%', height: '100%', border: "none", background: 'inherit', outline: 'none' }}
                  placeholder="add here job title font size"
                  id="jobTitleFontSize"
                  name="jobTitleFontSize"
                  value={jobTitleFontSize}
                  onChange={handleJobTitleFontSizeChange}
                />
              </td>
            </tr>
            <tr>
              <th style={{ textAlign: 'start' }}><label htmlFor="number">Sonlar shrift hajmi (min 1px, max 18px)</label></th>
              <td >
                <input
                  style={{ width: '100%', height: '100%', border: "none", background: 'inherit', outline: 'none' }}
                  placeholder="add here number font size"
                  id="number"
                  name="number"
                  value={numberFontSize}
                  onChange={handleNumberFontSizeChange}
                />
              </td>
            </tr>
          </tbody>
        </table>
        
      </div>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes.map((node) => ({ ...node, data: { ...node.data, onChange, fontSize, jobTitleFontSize, numberFontSize } }))}
          edges={edges}
          onNodesChange={handleNodesChange}
          onNodeDragStop={handleNodeDragStop}
          onNodeDrag={handleNodeDrag}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
        >
          <Panel position="top-left">
            <button className='btn-gray' style={{marginRight: 1}} onClick={() => onLayout('TB')}>Vertical ko'rinish</button>
            <button className='btn-gray' onClick={() => onLayout('LR')}>Horizontal ko'rinish</button>
          </Panel>
        </ReactFlow>
      </ReactFlowProvider>
    </>
  );
};

export default LayoutFlow;
