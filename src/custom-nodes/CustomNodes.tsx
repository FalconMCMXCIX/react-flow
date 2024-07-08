import React, { memo, useState, useEffect, useRef } from 'react';
import { Handle, Position } from 'reactflow';

interface CustomNodeProps {
    data: {
        label: string;
        onChange: (id: string, value: string) => void;
        id: string;
        fontSize: string;
        jobTitleFontSize: string;
        numberFontSize: string;
    };
}

const CustomNode: React.FC<CustomNodeProps> = ({ data }) => {
    const [editableLabel, setEditableLabel] = useState(data.label);
    const [fontSize, setFontSize] = useState(data.fontSize);
    const [jobTitleFontSize, setJobTitleFontSize] = useState(data.jobTitleFontSize);
    const [numberFontSize, setNumberFontSize] = useState(data.numberFontSize);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setFontSize(data.fontSize);
    }, [data.fontSize]);

    useEffect(() => {
        setJobTitleFontSize(data.jobTitleFontSize);
    }, [data.jobTitleFontSize]);

    useEffect(() => {
        setNumberFontSize(data.numberFontSize);
    }, [data.numberFontSize]);

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
                style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '2px',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    width: '400px',
                    maxWidth: '800px',
                    fontSize
                }}
            >
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
                <input
                    style={{
                        width: '100%',
                        border: 'none',
                        marginTop: '4px',
                        textAlign: 'end',
                        fontSize: numberFontSize,
                    }}
                    type="text"
                    placeholder="0(0-0-0)-0"
                    defaultValue={
                        '0(0-0-0)-0'
                    }
                />
                <Handle type="target" position={Position.Top} />
                <Handle type="source" position={Position.Bottom} />
            </div>
            <div
                style={{
                    boxShadow: '1px 4px 100px -15px rgba(34, 60, 80, 0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%'
                }}
            >
                <input
                    defaultValue="Job title"
                    style={{
                        padding: '0',
                        width: '80%',
                        border: 'none',
                        marginTop: '4px',
                        fontSize: jobTitleFontSize
                    }}
                />
                <input
                    defaultValue="-1"
                    style={{
                        padding: '0',
                        width: '20%',
                        border: 'none',
                        marginTop: '4px',
                        textAlign: 'end',
                        fontSize: jobTitleFontSize
                    }}
                />
            </div>
        </div>
    );
};

export default memo(CustomNode);
