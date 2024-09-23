import { useReactFlow, getNodesBounds, getViewportForBounds, Node } from 'reactflow';
import { toSvg } from 'html-to-image';

function downloadImage(dataUrl: string) {
    const a = document.createElement('a');
    a.setAttribute('download', 'reactflow.svg');
    a.setAttribute('href', dataUrl);
    a.click();
}

function DownloadButton() {
    const { getNodes } = useReactFlow();
    
    const onClick = () => {
        const handles = document.querySelectorAll<HTMLElement>('.react-flow__handle');
        const resizeControls = document.querySelectorAll<HTMLElement>('.react-flow__resize-control');
        const edgePins = document.querySelectorAll<HTMLElement>('.custom_point');

        handles.forEach((item) => {
            item.style.visibility = 'hidden';
        });
        resizeControls.forEach((item) => {
            item.style.visibility = 'hidden';
        });
        edgePins.forEach((item) => {
            item.style.visibility = 'hidden';
        });

        const nodes: Node[] = getNodes();
        const nodesBounds = getNodesBounds(nodes);
        const transform = getViewportForBounds(
            nodesBounds,
            nodesBounds.width,
            nodesBounds.height,
            0.1, // padding
            2 // zoom level
        );

        const viewportElement = document.querySelector<HTMLElement>('.react-flow__viewport');
        if (viewportElement) {
            toSvg(viewportElement, {
                backgroundColor: '#ffffff',
                width: nodesBounds.width + transform.x,
                height: nodesBounds.height + transform.y,
                style: {
                    width: `${nodesBounds.width + transform.x}px`,
                    height: `${nodesBounds.height + transform.y}px`,
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
                },
            }).then(downloadImage);
        }

        setTimeout(() => {
            handles.forEach((item) => {
                item.style.visibility = 'visible';
            });
            resizeControls.forEach((item) => {
                item.style.visibility = 'visible';
            });
            edgePins.forEach((item) => {
                item.style.visibility = 'visible';
            });
        }, 2000);
    };

    return (
        <div style={{ margin: '20px' }}>
            <button className="download-btn" onClick={onClick}>
                <svg
                    className="w-6 h-6 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 15v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2m-8 1V4m0 12-4-4m4 4 4-4"
                    />
                </svg>
            </button>
        </div>
    );
}

export default DownloadButton;
