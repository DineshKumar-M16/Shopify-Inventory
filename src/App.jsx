// In src/App.jsx, update the VendorSelector to reset when vendor changes
import React, { useState, useCallback } from 'react';
import './styles/App.css';
import VendorSelector from './components/VendorSelector';
import CsvProcessor from './components/CsvProcessor';

import shopifyLogo from './assets/shopify.png';

function App() {
  const [selectedVendor, setSelectedVendor] = useState('GLOBEFW');
  const [key, setKey] = useState(0); // Force re-render on vendor change

  const handleVendorChange = useCallback((vendor) => {
    setSelectedVendor(vendor);
    // Force CsvProcessor to remount and reset
    setKey(prev => prev + 1);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <img src={shopifyLogo} alt="Shopify Logo" className="logo" />
          <div>
            <h1>Shopify Inventory Manager </h1>
            <p className="subtitle">Centralized Stock Management Platform</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="sidebar">
          <VendorSelector 
            selectedVendor={selectedVendor} 
            onVendorChange={handleVendorChange} 
          />
          
          <div className="vendor-info">
            <h3>Current Vendor</h3>
            <p className="vendor-name">{selectedVendor}</p>
            <p className="instructions">
              Upload Shopify files and one Client CSV to process all stores.
            </p>
          </div>
        </div>

        <div className="content">
          {/* Key prop forces re-render on vendor change */}
          <CsvProcessor 
            key={key}
            selectedVendor={selectedVendor}
            onVendorChange={handleVendorChange}
          />
        </div>
      </main>

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Shopify Inventory System | React Version 3.0</p>
      </footer>
    </div>
  );
}

export default App;