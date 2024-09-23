import React, { useCallback, useEffect, useRef, useState, ChangeEvent } from 'react';
import ReactFlow, {
  addEdge,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  ReactFlowProvider,
  NodeChange,
  OnConnect, 
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  layoutedNodes,
  layoutedEdges,
  getNodeHeight,
  getLayoutedElements,
  nodeTypes,
} from './outer-actions'
import ManageTable from './manage-table';
import DownloadButton from './DownloadButton';



const nodeWidth = 400;
const minDistance = 20;


const LayoutFlow: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  const [fontSize, setFontSize] = useState<string | number>('14');
  const [jobTitleFontSize, setJobTitleFontSize] = useState<string | number>('14');
  const [jobTitleNumberFontSize, setJobTitleNumberFontSize] = useState<string | number>('14');
  const [numberFontSize, setnumberFontSize] = useState<string | number>('14');
  const resolveOverlapsRef = useRef<() => void>(() => resolveOverlapsSmoothly(nodes));
  const [jobTitleNumber, setJobTitleNumber] = useState<number>(1);
  const [divisionNumber, setDivisionNumber] = useState<number>(3);
  const [nodeDragStartPos, setNodeDragStartPos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  
  useEffect(() => {
    resolveOverlapsRef.current = () => setNodes((nds) => resolveOverlapsSmoothly(nds));
  }, [nodes, setNodes]);

  const onConnect: OnConnect = useCallback(
    (params: Edge | Connection) => {
      setEdges((eds) =>
        addEdge({
          ...params,
          type: ConnectionLineType.SmoothStep,
          animated: true,
          sourceHandle: 'a',
          targetHandle: 'b',
          style: { strokeDasharray: '0' } 
        }, eds)
      );
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === params.source || node.id === params.target) {
            return { ...node, data: { ...node.data, isNew: false } };
          }
          return node;
        })
      );
    },
    [setEdges, setNodes]
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
            node.height = getNodeHeight(fontSize, label); 
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


  const onNodeDragStart = (_: any, node: Node) => {
    setNodeDragStartPos({ x: node.position.x, y: node.position.y });
  };

  const handleNodeDragStop = (_: any, node: Node) => {
    const deltaX = node.position.x - nodeDragStartPos.x;
    const deltaY = node.position.y - nodeDragStartPos.y;

    if (isParentNode(node)) {
      updateDescendantPositions(node.id, deltaX, deltaY);
    }

    setNodes(nds => resolveOverlapsSmoothly(nds));
  };

  const handleNodeDrag = (_: any, node: Node) => {
    setNodes((nds) => {
      const dx = node.position.x - nds.find((n) => n.id === node.id)!.position.x;
      const dy = node.position.y - nds.find((n) => n.id === node.id)!.position.y;

      if (isParentNode(node)) {
        const updatedNodes = nds.map((n) => {
          if (n.id === node.id || isDescendant(node.id, n.id)) {
            return {
              ...n,
              position: {
                x: n.position.x + dx,
                y: n.position.y + dy,
              },
            };
          }
          return n;
        });
        return updatedNodes;
      } else {
        const updatedNodes = nds.map((n) => {
          return n.id === node.id
            ? {
              ...n,
              position: {
                x: node.position.x,
                y: node.position.y,
              },
            }
            : n;
        });
        return updatedNodes;
      }
    });
  };

  const updateDescendantPositions = (nodeId: string, deltaX: number, deltaY: number) => {
    const connectedEdges = edges.filter(edge => edge.source === nodeId);
    connectedEdges.forEach(edge => {
      setNodes(nds => nds.map(n => {
        if (n.id === edge.target) {
          const newX = n.position.x + deltaX;
          const newY = n.position.y + deltaY;
          return {
            ...n,
            position: {
              x: newX,
              y: newY,
            },
          };
        }
        return n;
      }));
      updateDescendantPositions(edge.target, deltaX, deltaY);
    });
  };

  const isParentNode = (node: Node) => {
    return edges.some((edge) => edge.source === node.id);
  };

  const isDescendant = (parentId: string, nodeId: string) => {
    const descendants = new Set<string>();
    const findDescendants = (id: string) => {
      edges.filter(edge => edge.source === id).forEach(edge => {
        descendants.add(edge.target);
        findDescendants(edge.target);
      });
    };
    findDescendants(parentId);
    return descendants.has(nodeId);
  };

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

    for (let iter = 0; iter < iterations; iter++) {
      let overlapsResolved = true;

      for (let i = 0; i < newNodes.length; i++) {
        for (let j = i + 1; j < newNodes.length; j++) {
          if (newNodes[i].data.isNew || newNodes[j].data.isNew) {
            continue;
          }

        
          if (isParentNode(newNodes[i]) || isParentNode(newNodes[j])) {
            continue;
          }

          if (nodesOverlap(newNodes[i], newNodes[j])) {
            overlapsResolved = false;

            const dx = newNodes[j].position.x - newNodes[i].position.x;
            const dy = newNodes[j].position.y - newNodes[i].position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistX = nodeWidth + minDistance;
            const minDistY = (newNodes[i].height || 0) + (newNodes[j].height || 0) + minDistance;

            const minDist = Math.sqrt(minDistX * minDistX + minDistY * minDistY);

            if (distance < minDist) {
              const moveDistance = step * (minDist - distance) / minDist;

              const angle = Math.atan2(dy, dx);
              const moveX = Math.cos(angle) * moveDistance;
              const moveY = Math.sin(angle) * moveDistance;

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

  const handleTitleFontSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    let newFontSize = event.target.value;
    if (parseInt(newFontSize, 10) > 36) {
      newFontSize = '36';
    } else if (parseInt(newFontSize, 10) < 1) {
      newFontSize = '1'; 
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
    if (parseInt(newFontSize, 10) > 36) {
      newFontSize = '36';
    } else if (parseInt(newFontSize, 10) < 1) {
      newFontSize = '1'; 
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

    const handleJobTitleNumberFontSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    let newFontSize = event.target.value;
    if (parseInt(newFontSize, 10) > 36) {
      newFontSize = '36';
    } else if (parseInt(newFontSize, 10) < 1) {
      newFontSize = '1'; 
    }

    setJobTitleNumberFontSize(newFontSize);

    const updatedNodes = nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        jobTitleNumberFontSize: newFontSize,
      }
    }));

    setNodes(resolveOverlapsSmoothly(updatedNodes));
  };



  const handleNumberFontSizeChange = (event: ChangeEvent<HTMLInputElement>,) => {
    let newFontSize = event.target.value;
    if (parseInt(newFontSize, 10) > 36) {
      newFontSize = '36';
    } else if (parseInt(newFontSize, 10) < 1) {
      newFontSize = '1';
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

  const handleJobTitleNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    setJobTitleNumber(Number(event.target.value));
  };

  const handleDivisionNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDivisionNumber(Number(event.target.value));
  };


  const addNode = useCallback(() => {
    const jobTitles = Array.from({ length: jobTitleNumber }, (_, i) => `Job Title ${i + 1}`);
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      data: {
        label: `New Node`,
        jobTitles: jobTitles,
        divisionNumber: divisionNumber,
        isNew: true 
      },
      position: { x: Math.random() * 100, y: Math.random() * 100 },
      type: 'customNode',
    };
    setNodes((nds) => resolveOverlapsSmoothly([...nds, newNode]));
    setDivisionNumber(1);
    setJobTitleNumber(1);
  }, [divisionNumber, jobTitleNumber]);


  
  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, 'TB', fontSize);
    setNodes(resolveOverlapsSmoothly(layoutedNodes));
    
    setEdges([...layoutedEdges]);
  }, [fontSize]);


  return (
    <>
      <ManageTable
        fontSize={fontSize}
        handleTitleFontSizeChange={handleTitleFontSizeChange}
        jobTitleFontSize={jobTitleFontSize}
        jobTitleNumberFontSize={jobTitleNumberFontSize}
        handleJobTitleFontSizeChange={handleJobTitleFontSizeChange}
        numberFontSize={numberFontSize}
        handleNumberFontSizeChange={handleNumberFontSizeChange}
        divisionNumber={divisionNumber}
        handleDivisionNumberChange={handleDivisionNumberChange}
        jobTitleNumber={jobTitleNumber}
        handleJobTitleNumberChange={handleJobTitleNumberChange} 
        handleJobTitleNumberFontSizeChange={handleJobTitleNumberFontSizeChange}
        addNode={addNode}
      />
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes.map((node) => ({ ...node, data: { ...node.data, onChange, fontSize, jobTitleFontSize, jobTitleNumberFontSize, numberFontSize } }))}
          edges={edges.map((edge) => ({
            ...edge,
            type: ConnectionLineType.Step,
            animated: false, 
          }))}
          onNodeDragStart={onNodeDragStart}
          onNodesChange={handleNodesChange}
          onNodeDragStop={handleNodeDragStop}
          onNodeDrag={handleNodeDrag}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.Step}
          defaultViewport={{
            x: 300, y: 300, zoom: 1
          }}
          minZoom={0.1}
          fitView
        >
          <Panel position="top-left">
            <button className='btn-gray' style={{marginRight: 1}} onClick={() => onLayout('TB')}>Vertical ko'rinish</button>
            <button className='btn-gray' onClick={() => onLayout('LR')}>Horizontal ko'rinish</button>
            <DownloadButton/>
          </Panel>
        </ReactFlow>
        
      </ReactFlowProvider>
    </>
  );
};

export default LayoutFlow;
