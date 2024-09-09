import React, { ChangeEvent } from 'react'

interface ManageTableProps {
    fontSize: string | number;
    handleTitleFontSizeChange: (event: ChangeEvent<HTMLInputElement>) => void;
    jobTitleFontSize: string | number;
    handleJobTitleFontSizeChange: (event: ChangeEvent<HTMLInputElement>) => void;
    numberFontSize: string | number;
    handleNumberFontSizeChange: (event: ChangeEvent<HTMLInputElement>) => void;
    divisionNumber: number;
    handleDivisionNumberChange: (event: ChangeEvent<HTMLInputElement>) => void;
    jobTitleNumber: number;
    jobTitleNumberFontSize: number | string;
    handleJobTitleNumberChange: (event: ChangeEvent<HTMLInputElement>) => void;
    handleJobTitleNumberFontSizeChange: (event: ChangeEvent<HTMLInputElement>) => void;
    addNode: () => void;
}

const ManageTable: React.FC<ManageTableProps> = ({
    fontSize, handleTitleFontSizeChange,
    jobTitleFontSize,jobTitleNumberFontSize, handleJobTitleFontSizeChange,
    numberFontSize,
    handleNumberFontSizeChange, divisionNumber,
    handleJobTitleNumberFontSizeChange,
    handleDivisionNumberChange,
    jobTitleNumber,
    handleJobTitleNumberChange,
    addNode
}) => {
  return (
    <React.Fragment>
          <div style={{ width: '50%', display: 'flex', flexDirection: "column", justifyContent: 'flex-start', gap: '15px' }}>
              <table>
                  <tbody>
                      <tr>
                          <th style={{ textAlign: 'start' }}><label htmlFor="fontSize">Bo'linmalar shrift hajmi (min 1px, max 36px)</label></th>
                          <td>
                              <input
                                  type='number'
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
                          <th style={{ textAlign: 'start' }}><label htmlFor="jobTitleFontSize">Lavozimlar shrift hajmi (min 1px, max 36px)</label></th>
                          <td>
                              <input
                                  type='number'
                                  style={{ width: '100%', height: '100%', border: "none", background: 'inherit', outline: 'none' }}
                                  placeholder="add here job title font size"
                                  id="jobTitleNumberFontSize"
                                  name="jobTitleNumberFontSize"
                                  value={jobTitleFontSize}
                                  onChange={handleJobTitleFontSizeChange}
                              />
                          </td>
                      </tr>
                      <tr>
                          <th style={{ textAlign: 'start' }}><label htmlFor="jobTitleFontSize">Lavozim soni shrift hajmi (min 1px, max 36px)</label></th>
                          <td>
                              <input
                                  type='number'
                                  style={{ width: '100%', height: '100%', border: "none", background: 'inherit', outline: 'none' }}
                                  placeholder="add here job title font size"
                                  id="jobTitleNumberFontSize"
                                  name="jobTitleNumberFontSize"
                                  value={jobTitleNumberFontSize}
                                  onChange={handleJobTitleNumberFontSizeChange}
                              />
                          </td>
                      </tr>
                      <tr>
                          <th style={{ textAlign: 'start' }}><label htmlFor="number">Sonlar shrift hajmi (min 1px, max 36px)</label></th>
                          <td >
                              <input
                                  type='number'
                                  style={{ width: '100%', height: '100%', border: "none", background: 'inherit', outline: 'none' }}
                                  placeholder="add here number font size"
                                  id="number"
                                  name="number"
                                  value={numberFontSize}
                                  onChange={handleNumberFontSizeChange}
                              />
                          </td>
                      </tr>
                      <tr>
                          <th style={{ textAlign: 'start' }}><label htmlFor="divisionNumber">Bo`linmalar soni</label></th>
                          <td>
                              <input
                                  type='number'
                                  style={{ width: '100%', height: '100%', border: "none", background: 'inherit', outline: 'none' }}
                                  placeholder="add here division number"
                                  id="divisionNumber"
                                  name="divisionNumber"
                                  value={divisionNumber}
                                  onChange={handleDivisionNumberChange}
                              />
                          </td>
                      </tr>
                      <tr>
                          <th style={{ textAlign: 'start' }}>
                              <label htmlFor="jobTitleNumber">Lavozimlar soni</label>
                          </th>
                          <td>
                              <input
                                  type='number'
                                  style={{ width: '100%', height: '100%', border: "none", background: 'inherit', outline: 'none' }}
                                  placeholder="add here job title number"
                                  id="jobTitleNumber"
                                  name="jobTitleNumber"
                                  value={jobTitleNumber}
                                  onChange={handleJobTitleNumberChange}
                              />
                          </td>
                      </tr>
                  </tbody>
              </table>
              <button type='button' style={{ marginLeft: 15 }} className='btn-gray' onClick={addNode}>Bo`linma qo'shish</button>
          </div>
    </React.Fragment>
  )
}

export default ManageTable;