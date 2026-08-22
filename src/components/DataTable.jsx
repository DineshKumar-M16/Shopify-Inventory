import React, { useMemo, useState } from 'react';

const DataTable = ({ data, title }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Define the columns you want to display
  const displayColumns = ['title', 'skuno', 'available', 'onhandnew', 'status'];
  const columnLabels = {
    title: 'Title',
    skuno: 'SKU',
    available: 'Available',
    onhandnew: 'On Hand',
    status: 'Status'
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  if (data.length === 0) {
    return <div className="empty-table">No data available</div>;
  }

  return (
    <div className="data-table-container">
      <h2 className="table-title">{title}</h2>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {displayColumns.map(column => (
                <th key={column} onClick={() => handleSort(column)}>
                  {columnLabels[column] || column}
                  {sortConfig.key === column && (
                    <span className="sort-indicator">
                      {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((row, index) => (
              <tr key={index}>
                {displayColumns.map(column => (
                  <td 
                    key={column} 
                    title={row[column]}
                    className={column === 'status' ? `status-cell status-${row.status?.includes('✅') ? 'matched' : 'not-found'}` : ''}
                  >
                    {column === 'status' ? (
                      <span className="status-icon">
                        {row.status || 'Pending'}
                      </span>
                    ) : (
                      row[column] || '-'
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
      
      <div className="table-stats">
        Showing {currentItems.length} of {sortedData.length} items
      </div>
    </div>
  );
};

export default DataTable;