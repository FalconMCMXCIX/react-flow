declare module 'react-resizable' {
    import * as React from 'react';

    export interface ResizableProps {
        className?: string;
        width: number;
        height: number;
        minConstraints?: [number, number];
        maxConstraints?: [number, number];
        onResizeStop?: (e: React.SyntheticEvent, data: ResizeCallbackData) => void;
        onResizeStart?: (e: React.SyntheticEvent, data: ResizeCallbackData) => void;
        onResize?: (e: React.SyntheticEvent, data: ResizeCallbackData) => void;
        resizeHandles?: Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'>;
        lockAspectRatio?: boolean;
        handleSize?: [number, number];
        axis?: 'both' | 'x' | 'y' | 'none';
    }

    export interface ResizeCallbackData {
        node: HTMLElement;
        size: {
            width: number;
            height: number;
        };
        handle: 's' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne';
    }

    export class Resizable extends React.Component<ResizableProps> { }

    export class ResizableBox extends React.Component<ResizableProps> { }
}
