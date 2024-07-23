import React, { memo, useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeResizeControl } from 'reactflow';

interface CustomNodeProps {
    data: {
        label: string;
        onChange: (id: string, value: string) => void;
        id: string;
        fontSize: string;
        jobTitleFontSize: string;
        numberFontSize: string;
        jobTitles?: string[];
        divisionNumber: number;
    };
}

const CustomNode: React.FC<CustomNodeProps> = ({ data }) => {
    const [editableLabel, setEditableLabel] = useState(data.label);
    const [fontSize, setFontSize] = useState(data.fontSize);
    const [jobTitleFontSize, setJobTitleFontSize] = useState(data.jobTitleFontSize);
    const [numberFontSize, setNumberFontSize] = useState(data.numberFontSize);
    const [jobTitles, setJobTitles] = useState(data.jobTitles);
    const [nodeDimensions, setNodeDimensions] = useState<{ width: number; height: number }>({ width: 200, height: 100 });
    const [showFontSizeInput, setShowFontSizeInput] = useState(false);
    const [inputFontSize, setInputFontSize] = useState(fontSize);
    const [focusedElement, setFocusedElement] = useState<'label' | 'jobTitle' | 'number' | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const nodeRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        setJobTitles(data.jobTitles);
    }, [data.jobTitles]);

    useEffect(() => {
        if (nodeRef.current) {
            const { width, height } = nodeRef.current.getBoundingClientRect();
            setNodeDimensions({ width, height });
        }
    }, [fontSize, jobTitleFontSize, numberFontSize, editableLabel]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [editableLabel, fontSize]);

    const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditableLabel(event.target.value);
    };

    const handleBlur = () => {
        data.onChange(data.id, editableLabel);
    };

    const handleContextMenu = (event: React.MouseEvent, element: 'label' | 'jobTitle' | 'number') => {
        event.preventDefault();
        setFocusedElement(element);
        setShowFontSizeInput(true);
        switch (element) {
            case 'label':
                setInputFontSize(fontSize);
                break;
            case 'jobTitle':
                setInputFontSize(jobTitleFontSize);
                break;
            case 'number':
                setInputFontSize(numberFontSize);
                break;
            default:
                break;
        }
    };

    const handleFontSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newFontSize = event.target.value;
        setInputFontSize(newFontSize);
        switch (focusedElement) {
            case 'label':
                setFontSize(newFontSize);
                break;
            case 'jobTitle':
                setJobTitleFontSize(newFontSize);
                break;
            case 'number':
                setNumberFontSize(newFontSize);
                break;
            default:
                break;
        }
    };

    const handleFontSizeBlur = () => {
        switch (focusedElement) {
            case 'label':
                setFontSize(inputFontSize);
                break;
            case 'jobTitle':
                setJobTitleFontSize(inputFontSize);
                break;
            case 'number':
                setNumberFontSize(inputFontSize);
                break;
            default:
                break;
        }
        setShowFontSizeInput(false);
        setFocusedElement(null);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (nodeRef.current && !nodeRef.current.contains(event.target as Node)) {
            setShowFontSizeInput(false);
            setFocusedElement(null);
        }
    };

    useEffect(() => {
       
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);



    const renderDivisionsLayersByCondition = (i: number) => {
        let offset: unknown;
        offset = Math.trunc((i * 10) - (data.divisionNumber - 1) * 10);
        return offset;
    };

    const renderDivisions = () => {
        const divisions = [];
        const divisionNumber = isNaN(data.divisionNumber) ? 0 : data.divisionNumber;
        for (let i = 0; i < divisionNumber - 1; i++) {
            divisions.push(
                <div
                    key={i}
                    style={{
                        padding: '1rem',
                        background: '#fff',
                        border: '1px solid #dddddd',
                        borderRadius: '1px',
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                        marginBottom: '1rem',
                        zIndex: i ,
                        position: 'absolute',
                        bottom: `${renderDivisionsLayersByCondition(i -1)}px`,
                        right: `${renderDivisionsLayersByCondition(i -1)}px`,
                        width: '90%',
                        minHeight: nodeDimensions.height - 10
                    }}
                ></div>
            );
        }
        return divisions;
    };

    const zIndex = !isNaN(data.divisionNumber) ? data.divisionNumber + 2 : 2;

    return (
        <React.Fragment>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                <div>
                    <div
                        ref={nodeRef}
                        style={{
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '2px',
                            background: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            fontSize: fontSize + 'px',
                            position: 'relative',
                            zIndex: zIndex + 1000,
                            minHeight: nodeDimensions.height
                        }}
                    >
                        <textarea
                            ref={textareaRef}
                            value={editableLabel}
                            onChange={onChange}
                            onBlur={handleBlur}
                            onContextMenu={(event) => handleContextMenu(event, 'label')}
                            style={{
                                width: '100%',
                                fontSize: fontSize + 'px',
                                resize: 'none',
                                overflow: 'hidden',
                                minHeight: '50px',
                                height: 'auto',
                                border: 'none',
                                textAlign: 'center',
                            }}
                            rows={4}
                        />
                        {showFontSizeInput && focusedElement === 'label' && (
                            <input
                                type="number"
                                value={inputFontSize}
                                onChange={handleFontSizeChange}
                                onBlur={handleFontSizeBlur}
                                style={{
                                    position: 'absolute',
                                    top: '0',
                                    right: '0',
                                    zIndex: 10,
                                    width: '50px',
                                }}
                            />
                        )}
                        {showFontSizeInput && focusedElement === 'jobTitle' && (
                            <input
                                type="number"
                                value={inputFontSize}
                                onChange={handleFontSizeChange}
                                onBlur={handleFontSizeBlur}
                                style={{
                                    position: 'absolute',
                                    top: '0',
                                    right: '0',
                                    zIndex: 10,
                                    width: '50px',
                                }}
                            />
                        )}
                        {showFontSizeInput && focusedElement === 'number' && (
                            <input
                                type="number"
                                value={inputFontSize}
                                onChange={handleFontSizeChange}
                                onBlur={handleFontSizeBlur}
                                style={{
                                    position: 'absolute',
                                    top: '0',
                                    right: '0',
                                    zIndex: 10,
                                    width: '50px',
                                }}
                            />
                        )}
                        <input
                            style={{
                                width: '100%',
                                border: 'none',
                                marginTop: '4px',
                                textAlign: 'end',
                                fontSize: numberFontSize + 'px',
                            }}
                            type="text"
                            placeholder="0(0-0-0)-0"
                            defaultValue={'42(20-0-20)-4'}
                            onContextMenu={(event) => handleContextMenu(event, 'number')}
                        />
                        <Handle type="target" position={Position.Top} />
                        <Handle type="source" position={Position.Bottom} />
                        <NodeResizeControl
                            style={{ position: 'absolute', bottom: '0', right: '0', cursor: 'se-resize' }}
                            minWidth={200}
                            minHeight={100}
                            onResize={(event, { width, height }) => setNodeDimensions({ width, height })}
                        />

                    </div>
                    <div style={{ zIndex: -10000, position: 'absolute', width: '100%' }}>
                        {renderDivisions()}
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', }}>
                    {(jobTitles || ['Lavozimlar']).map((jobTitle, index) => (
                        <div key={index} style={{  display: 'flex', justifyContent: 'space-between', zIndex: 10000 }}>
                            <input
                                defaultValue={jobTitle}
                                style={{
                                    padding: '0',
                                    border: 'none',
                                    marginTop: '4px',
                                    fontSize: jobTitleFontSize + 'px',
                                    width: '100%',
                                }}
                                onContextMenu={(event) => handleContextMenu(event, 'jobTitle')}
                            />
                            <input
                                defaultValue={'42'}
                                style={{
                                    padding: '0',
                                    margin: 0,
                                    border: 'none',
                                    marginTop: '4px',
                                    textAlign: 'end',
                                    fontSize: jobTitleFontSize + 'px',
                                    width: '100%',
                                }}
                                onContextMenu={(event) => handleContextMenu(event, 'jobTitle')}
                            />
                        </div>
                        ))}
                </div>
            </div>
        </React.Fragment>
    );
};

export default memo(CustomNode);
