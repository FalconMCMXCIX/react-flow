import React, { memo, useState, useEffect, useRef } from 'react';
import { Handle, Position } from 'reactflow';

interface CustomNodeProps {
    data: {
        label: string;
        onChange: (id: string, value: string) => void;
        id: string;
        fontSize: string;
    };
}

const CustomNode: React.FC<CustomNodeProps> = ({ data }) => {
    const [editableLabel, setEditableLabel] = useState(data.label);
    const [fontSize, setFontSize] = useState(data.fontSize);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setFontSize(data.fontSize);
    }, [data.fontSize]);

    useEffect(() => {
        setEditableLabel(data.label);
    }, [data.label]);

    const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditableLabel(event.target.value);
    };

    const handleBlur = () => {
        data.onChange(data.id, editableLabel);
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [editableLabel, fontSize]);

    return (
        <div style={{
            padding: 10,
            border: '1px solid #ddd',
            borderRadius: 2,
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            width: '400px',
            maxWidth: '800px',
            fontSize
        }}>
            <textarea
                ref={textareaRef}
                value={editableLabel}
                onChange={onChange}
                onBlur={handleBlur}
                style={{
                    width: '100%',
                    fontSize,
                    resize: 'none',
                    overflow: 'hidden',
                    minHeight: '50px',
                    height: 'auto',
                }}
                rows={4}
            />
            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}

export default memo(CustomNode);
