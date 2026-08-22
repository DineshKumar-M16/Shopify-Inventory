import React, { useState } from 'react';
import DataTable from './DataTable';

const StoreTabs = ({ storeData, vendor, month, weekno, onUpdateProcessedData }) => {
  const [activeStore, setActiveStore] = useState(Object.keys(storeData)[0] || '');

  if (Object.keys(storeData).length === 0) {
    return (
      <div className="empty-store-tabs">
        <p>No store data available. Please upload CSV files.</p>
      </div>
    );
  }

  const stores = Object.keys(storeData);

  return (
    <div className="store-tabs">
      <div className="tabs-header">
        <div className="tabs-list">
          {stores.map(store => (
            <button
              key={store}
              className={`tab-btn ${activeStore === store ? 'active' : ''}`}
              onClick={() => setActiveStore(store)}
            >
              {store}
              <span className="tab-badge">
                {storeData[store].filter(file => file.processedData).length} / {storeData[store].length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="tabs-content">
        {storeData[activeStore]?.map((file, index) => (
          <div key={file.id || index} className="store-tab-panel">
            <div className="panel-header">
              <h4>{file.name}</h4>
              <div className="panel-status">
                {file.processedData ? (
                  <span className="status-badge success">✅ Processed</span>
                ) : (
                  <span className="status-badge pending">⏳ Waiting for Client CSV</span>
                )}
              </div>
            </div>
            
            {file.processedData && file.processedData.length > 0 && (
              <DataTable 
                data={file.processedData}
                title={`${vendor} - Store ${activeStore} - ${file.name}`}
              />
            )}
            
            {!file.processedData && (
              <div className="no-data-message">
                <p>Upload a Client CSV for this store to process inventory data.</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreTabs;