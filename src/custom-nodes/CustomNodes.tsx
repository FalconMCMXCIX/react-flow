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
    const [nodeDimensions, setNodeDimensions] = useState<{ width: number, height: number }>({ width: 0, height: 0 });
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

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [editableLabel, fontSize]);

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
                        zIndex: i + 1,
                        position: 'absolute',
                        right: `${renderDivisionsLayersByCondition(i)}px`,
                        width:'90%',
                        height: nodeDimensions.height,
                    }}
                >
                </div>
            );
        }
        return divisions;
    };

    const zIndex = !isNaN(data.divisionNumber) ? data.divisionNumber + 2 : 2;

    return (
        <React.Fragment>
            {renderDivisions()}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
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
                        width: nodeDimensions.width,
                        height: nodeDimensions.height,
                        minWidth: '400px',
                        minHeight: '100px',
                        fontSize: fontSize + 'px',
                        position: 'relative',
                        zIndex,
                    }}
                >
                    <textarea
                        ref={textareaRef}
                        value={editableLabel}
                        onChange={onChange}
                        onBlur={handleBlur}
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
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '400px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', width: '100%' }}>
                        {(jobTitles || ["Lavozimlar"]).map((jobTitle, index) => (
                            <div key={index} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: '2px', zIndex: 1000 }}>
                                <input
                                    defaultValue={jobTitle}
                                    style={{
                                        padding: '0',
                                        width: '80%',
                                        border: 'none',
                                        marginTop: '4px',
                                        fontSize: jobTitleFontSize + 'px',
                                    }}
                                />
                                <input
                                    defaultValue={"42"}
                                    style={{
                                        padding: '0',
                                        width: '20%',
                                        border: 'none',
                                        marginTop: '4px',
                                        textAlign: 'end',
                                        fontSize: jobTitleFontSize + 'px',
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </React.Fragment>
       
    );
};

export default memo(CustomNode);