import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  accessor?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  ariaLabel?: string;
}

interface AccessibleTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  caption?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  selectable?: boolean;
  selectedRows?: Set<number>;
  onSelectionChange?: (selectedRows: Set<number>) => void;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  rowClassName?: string;
  announcements?: {
    sortChanged?: (column: string, direction: 'asc' | 'desc') => string;
    selectionChanged?: (selectedCount: number, totalCount: number) => string;
  };
}

/**
 * Accessible table component with full keyboard navigation and ARIA support
 * Supports sorting, selection, and screen reader announcements
 */
function AccessibleTable<T>({
  data,
  columns,
  caption,
  ariaLabel,
  ariaDescribedBy,
  selectable = false,
  selectedRows = new Set(),
  onSelectionChange,
  sortBy,
  sortDirection = 'asc',
  onSort,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
  rowClassName = '',
  announcements = {}
}: AccessibleTableProps<T>) {
  const [focusedCell, setFocusedCell] = useState({ row: -1, col: -1 });
  const [liveRegion, setLiveRegion] = useState('');
  const tableRef = useRef<HTMLTableElement>(null);
  const cellRefs = useRef<(HTMLElement | null)[][]>([]);

  // Initialize cell refs grid
  useEffect(() => {
    cellRefs.current = Array(data.length + 1)
      .fill(null)
      .map(() => Array(columns.length + (selectable ? 1 : 0)).fill(null));
  }, [data.length, columns.length, selectable]);

  // Announce changes to screen readers
  const announce = (message: string) => {
    setLiveRegion(message);
    setTimeout(() => setLiveRegion(''), 1000);
  };

  // Handle sorting
  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable || !onSort) return;

    const columnKey = column.key as string;
    const newDirection = sortBy === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    
    onSort(columnKey, newDirection);
    
    if (announcements.sortChanged) {
      announce(announcements.sortChanged(column.header, newDirection));
    }
  };

  // Handle row selection
  const handleRowSelection = (rowIndex: number, checked: boolean) => {
    if (!selectable || !onSelectionChange) return;

    const newSelectedRows = new Set(selectedRows);
    if (checked) {
      newSelectedRows.add(rowIndex);
    } else {
      newSelectedRows.delete(rowIndex);
    }

    onSelectionChange(newSelectedRows);

    if (announcements.selectionChanged) {
      announce(announcements.selectionChanged(newSelectedRows.size, data.length));
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (!selectable || !onSelectionChange) return;

    const newSelectedRows = checked ? new Set(data.map((_, index) => index)) : new Set<number>();
    onSelectionChange(newSelectedRows);

    if (announcements.selectionChanged) {
      announce(announcements.selectionChanged(newSelectedRows.size, data.length));
    }
  };

  // Keyboard navigation
  const handleKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
    const { key, ctrlKey, shiftKey } = event;
    const maxRows = data.length;
    const maxCols = columns.length + (selectable ? 1 : 0) - 1;
    
    let { row, col } = focusedCell;
    let handled = false;

    switch (key) {
      case 'ArrowDown':
        row = Math.min(row + 1, maxRows);
        handled = true;
        break;

      case 'ArrowUp':
        row = Math.max(row - 1, -1);
        handled = true;
        break;

      case 'ArrowRight':
        col = Math.min(col + 1, maxCols);
        handled = true;
        break;

      case 'ArrowLeft':
        col = Math.max(col - 1, 0);
        handled = true;
        break;

      case 'Home':
        if (ctrlKey) {
          row = -1;
          col = 0;
        } else {
          col = 0;
        }
        handled = true;
        break;

      case 'End':
        if (ctrlKey) {
          row = maxRows;
          col = maxCols;
        } else {
          col = maxCols;
        }
        handled = true;
        break;

      case 'PageDown':
        row = Math.min(row + 10, maxRows);
        handled = true;
        break;

      case 'PageUp':
        row = Math.max(row - 10, -1);
        handled = true;
        break;

      case ' ':
        if (selectable && col === 0 && row >= 0) {
          const isSelected = selectedRows.has(row);
          handleRowSelection(row, !isSelected);
          handled = true;
        } else if (row === -1 && col >= 0) {
          // Sort column
          const columnIndex = selectable ? col - 1 : col;
          if (columnIndex >= 0 && columns[columnIndex]?.sortable) {
            handleSort(columns[columnIndex]);
            handled = true;
          }
        }
        break;

      case 'Enter':
        if (row === -1 && col >= 0) {
          // Sort column
          const columnIndex = selectable ? col - 1 : col;
          if (columnIndex >= 0 && columns[columnIndex]?.sortable) {
            handleSort(columns[columnIndex]);
            handled = true;
          }
        }
        break;

      case 'a':
        if (ctrlKey && selectable) {
          handleSelectAll(true);
          handled = true;
        }
        break;
    }

    if (handled) {
      event.preventDefault();
      event.stopPropagation();

      const newFocusedCell = { row, col };
      setFocusedCell(newFocusedCell);

      // Focus the appropriate cell
      const cellRef = cellRefs.current[row + 1]?.[col];
      if (cellRef) {
        cellRef.focus();
      }
    }
  };

  // Render cell content
  const renderCellContent = (item: T, column: TableColumn<T>) => {
    if (column.accessor) {
      return column.accessor(item);
    }
    return String(item[column.key as keyof T] || '');
  };

  // Generate table ID for ARIA relationships
  const tableId = `accessible-table-${Math.random().toString(36).substr(2, 9)}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3">Loading table data...</span>
      </div>
    );
  }

  return (
    <>
      <table
        ref={tableRef}
        id={tableId}
        className={`min-w-full divide-y divide-gray-200 ${className}`}
        role="table"
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-rowcount={data.length + 1}
        aria-colcount={columns.length + (selectable ? 1 : 0)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {caption && (
          <caption className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {caption}
          </caption>
        )}
        
        <thead className="bg-gray-50">
          <tr role="row" aria-rowindex={1}>
            {selectable && (
              <th
                ref={(el) => (cellRefs.current[0][0] = el)}
                scope="col"
                className="relative px-6 py-3 w-12"
                role="columnheader"
                aria-colindex={1}
                tabIndex={focusedCell.row === -1 && focusedCell.col === 0 ? 0 : -1}
                onFocus={() => setFocusedCell({ row: -1, col: 0 })}
              >
                <label className="sr-only">Select all rows</label>
                <input
                  type="checkbox"
                  className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  checked={selectedRows.size === data.length && data.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  aria-label="Select all rows"
                />
              </th>
            )}
            
            {columns.map((column, index) => {
              const colIndex = selectable ? index + 1 : index;
              const isSorted = sortBy === column.key;
              const isFocused = focusedCell.row === -1 && focusedCell.col === colIndex;
              
              return (
                <th
                  key={String(column.key)}
                  ref={(el) => (cellRefs.current[0][colIndex] = el)}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${isFocused ? 'ring-2 ring-primary-500' : ''}`}
                  style={{ width: column.width, textAlign: column.align }}
                  role="columnheader"
                  aria-colindex={colIndex + 1}
                  aria-sort={
                    isSorted
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : column.sortable
                      ? 'none'
                      : undefined
                  }
                  aria-label={column.ariaLabel || column.header}
                  tabIndex={isFocused ? 0 : -1}
                  onClick={() => column.sortable && handleSort(column)}
                  onFocus={() => setFocusedCell({ row: -1, col: colIndex })}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <span className="ml-2 flex-none rounded text-gray-400">
                        {isSorted ? (
                          sortDirection === 'asc' ? (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )
                        ) : (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M5 12l5-5 5 5H5z" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr role="row">
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-6 py-12 text-center text-gray-500"
                role="cell"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => {
              const isSelected = selectedRows.has(rowIndex);
              const isRowFocused = focusedCell.row === rowIndex;
              
              return (
                <tr
                  key={rowIndex}
                  className={`${isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'} ${rowClassName}`}
                  role="row"
                  aria-rowindex={rowIndex + 2}
                  aria-selected={selectable ? isSelected : undefined}
                >
                  {selectable && (
                    <td
                      ref={(el) => (cellRefs.current[rowIndex + 1][0] = el)}
                      className="relative px-6 py-4 w-12"
                      role="cell"
                      aria-colindex={1}
                      tabIndex={isRowFocused && focusedCell.col === 0 ? 0 : -1}
                      onFocus={() => setFocusedCell({ row: rowIndex, col: 0 })}
                    >
                      <label className="sr-only">Select row {rowIndex + 1}</label>
                      <input
                        type="checkbox"
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        checked={isSelected}
                        onChange={(e) => handleRowSelection(rowIndex, e.target.checked)}
                        aria-label={`Select row ${rowIndex + 1}`}
                      />
                    </td>
                  )}
                  
                  {columns.map((column, colIndex) => {
                    const cellIndex = selectable ? colIndex + 1 : colIndex;
                    const isCellFocused = isRowFocused && focusedCell.col === cellIndex;
                    
                    return (
                      <td
                        key={String(column.key)}
                        ref={(el) => (cellRefs.current[rowIndex + 1][cellIndex] = el)}
                        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                          isCellFocused ? 'ring-2 ring-primary-500 ring-inset' : ''
                        }`}
                        style={{ textAlign: column.align }}
                        role="cell"
                        aria-colindex={cellIndex + 1}
                        tabIndex={isCellFocused ? 0 : -1}
                        onFocus={() => setFocusedCell({ row: rowIndex, col: cellIndex })}
                      >
                        {renderCellContent(item, column)}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Live region for announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveRegion}
      </div>

      {/* Hidden instructions */}
      <div className="sr-only">
        Table navigation: Use arrow keys to move between cells. Press Space to select rows or sort columns.
        Press Ctrl+A to select all rows. Press Home/End to jump to beginning/end of row.
        Press Ctrl+Home/End to jump to beginning/end of table.
      </div>
    </>
  );
}

export default AccessibleTable;