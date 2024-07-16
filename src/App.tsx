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
  OnConnect
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  layoutedNodes,
  layoutedEdges,
  resolveOverlapsSmoothly,
  getNodeHeight,
  getLayoutedElements,
  nodeTypes,
} from './outer-actions'
import ManageTable from './manage-table';


const LayoutFlow: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  const [fontSize, setFontSize] = useState<string>('14px');
  const [jobTitleFontSize, setJobTitleFontSize] = useState<string>('14px');
  const [numberFontSize, setnumberFontSize] = useState<string>('14px');
  const resolveOverlapsRef = useRef<() => void>(() => resolveOverlapsSmoothly(nodes));
  const [jobTitleNumber, setJobTitleNumber] = useState<number>(1);
  const [divisionNumber, setDivisionNumber] = useState<number>(1);
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
    updateDescendantPositions(node.id, deltaX, deltaY);
    setNodes(nds => resolveOverlapsSmoothly(nds));
  };



  const handleNodeDrag = (_: any, node: Node) => {
    
    setNodes((nds) => {
      const dx = node.position.x - nds.find((n) => n.id === node.id)!.position.x;
      const dy = node.position.y - nds.find((n) => n.id === node.id)!.position.y;
      const updatedNodes = nds.map((n) => ({
        ...n,
        position: {
          x: n.position.x + dx,
          y: n.position.y + dy,
        },
      }));
     
     
      return updatedNodes
    });
  };

  const handleTitleFontSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    let newFontSize = event.target.value;
    if (parseInt(newFontSize, 10) > 36) {
      newFontSize = '18px';
    } else if (parseInt(newFontSize, 10) < 1) {
      newFontSize = '1px'; 
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
      newFontSize = '18px';
    } else if (parseInt(newFontSize, 10) < 1) {
      newFontSize = '1px'; 
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

  const handleNumberFontSizeChange = (event: ChangeEvent<HTMLInputElement>,) => {
    let newFontSize = event.target.value;
    if (parseInt(newFontSize, 10) > 36) {
      newFontSize = '18px';
    } else if (parseInt(newFontSize, 10) < 1) {
      newFontSize = '1px';
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
    setDivisionNumber(0);
    setJobTitleNumber(0);
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
        handleJobTitleFontSizeChange={handleJobTitleFontSizeChange}
        numberFontSize={numberFontSize}
        handleNumberFontSizeChange={handleNumberFontSizeChange}
        divisionNumber={divisionNumber}
        handleDivisionNumberChange={handleDivisionNumberChange}
        jobTitleNumber={jobTitleNumber}
        handleJobTitleNumberChange={handleJobTitleNumberChange}
        addNode={addNode}
      />
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes.map((node) => ({ ...node, data: { ...node.data, onChange, fontSize, jobTitleFontSize, numberFontSize } }))}
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
          </Panel>
        </ReactFlow>
      </ReactFlowProvider>
    </>
  );
};

export default LayoutFlow;
