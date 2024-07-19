import  {
    Node,
    Edge,
    Position,
} from 'reactflow';
import dagre from 'dagre';
import CustomNode from '../custom-nodes/CustomNodes';
import { initialNodes, initialEdges } from '../nodes-edges';
import 'reactflow/dist/style.css';
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 400; 
const minDistance = 20;


export const getNodeHeight = (fontSize: any, label: string): number => {
    const baseHeight = 36;
    const fontSizeNumber = parseInt(fontSize, 10);
    const lineHeight = baseHeight + (isNaN(fontSizeNumber) ? 0 : ((fontSizeNumber) - 14) * 1.2);
    const lines = label.split('\n').length;
    return lineHeight * lines;
};

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB', fontSize?: any): { nodes: Node[], edges: Edge[] } => {
    dagreGraph.setGraph({
        rankdir: direction,
        nodesep: 180, 
        ranksep: 190,  
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

export const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);

export const nodeTypes = { customNode: CustomNode };

export const nodesOverlap = (node1: Node, node2: Node): boolean => {
    return !(
        node1.position.x + nodeWidth + minDistance < node2.position.x ||
        node1.position.x > node2.position.x + nodeWidth + minDistance ||
        node1.position.y + (node1.height || 0) + minDistance < node2.position.y ||
        node1.position.y > node2.position.y + (node2.height || 0) + minDistance
    );
};


export const resolveOverlapsSmoothly = (nodes: Node[], iterations = 100, step = 5): Node[] => {
    const newNodes = [...nodes];

    for (let iter = 0; iter < iterations; iter++) {
        let overlapsResolved = true;

        for (let i = 0; i < newNodes.length; i++) {
            for (let j = i + 1; j < newNodes.length; j++) {
                
                if (newNodes[i].data.isNew || newNodes[j].data.isNew) {
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

export const getDescendants = (nodeId: string, nodes: Node[], edges: Edge[]): string[] => {
    const children = edges.filter(edge => edge.source === nodeId).map(edge => edge.target);
    let descendants: string[] = [...children];

    children.forEach(childId => {
        descendants = [...descendants, ...getDescendants(childId, nodes, edges)];
    });

    return descendants;
};
