import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import PropTypes from 'prop-types';

const ResizableTable = ({
  columns,
  data,
  className = '',
  defaultColumnWidth = 150,
  defaultRowHeight = 60,
  noDataMessage = 'No Data Found'
}) => {
  const [colWidths, setColWidths] = useState(
    columns.reduce((acc, col) => ({
      ...acc,
      [col.key]: col.width || defaultColumnWidth
    }), {})
  );

  const [rowHeights, setRowHeights] = useState(
    data.reduce((acc, _, index) => ({
      ...acc,
      [index]: defaultRowHeight
    }), {})
  );

  const [resizing, setResizing] = useState(null);

  const handleMouseDown = (e, type, key) => {
    e.preventDefault();
    setResizing({
      type,
      key,
      startPos: type === 'col' ? e.clientX : e.clientY
    });
  };

  const handleMouseMove = (e) => {
    if (!resizing) return;

    const { type, key, startPos } = resizing;
    const diff = type === 'col' ? e.clientX - startPos : e.clientY - startPos;

    if (type === 'col') {
      setColWidths(prev => ({
        ...prev,
        [key]: Math.max(50, prev[key] + diff)
      }));
    } else {
      setRowHeights(prev => ({
        ...prev,
        [key]: Math.max(30, prev[key] + diff)
      }));
    }

    setResizing({
      ...resizing,
      startPos: type === 'col' ? e.clientX : e.clientY
    });
  };

  const handleMouseUp = () => {
    setResizing(null);
  };

  useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizing]);

  // Update row heights when data changes
  useEffect(() => {
    setRowHeights(
      data.reduce((acc, _, index) => ({
        ...acc,
        [index]: defaultRowHeight
      }), {})
    );
  }, [data, defaultRowHeight]);

  return (
    <div className="position-relative p-4">
      <Table bordered className={`text-center fs-6 w-100 bg-white ${className}`}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="position-relative py-3 font-medium"
                style={{ width: colWidths[col.key] }}
              >
                {col.label}
                <div
                  className="position-absolute top-0 end-0 h-100 hover:bg-gray-200"
                  style={{
                    width: '4px',
                    cursor: 'col-resize',
                    backgroundColor: 'transparent'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, 'col', col.key)}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col) => (
                  <td
                    key={`${rowIndex}-${col.key}`}
                    style={{
                      width: colWidths[col.key],
                      height: rowHeights[rowIndex]
                    }}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center pb-2">
                {noDataMessage}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

ResizableTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    width: PropTypes.number,
    render: PropTypes.func
  })).isRequired,
  data: PropTypes.array.isRequired,
  className: PropTypes.string,
  defaultColumnWidth: PropTypes.number,
  defaultRowHeight: PropTypes.number,
  noDataMessage: PropTypes.string
};

export default ResizableTable;