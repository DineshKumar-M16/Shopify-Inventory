import React from 'react';
import { vendors } from '../data/vendors';

const VendorSelector = ({ selectedVendor, onVendorChange }) => {
  return (
    <div className="vendor-selector">
      <h3>Select Vendor</h3>
      <div className="vendor-grid">
        {Object.entries(vendors).map(([key, vendor]) => (
          <button
            key={key}
            className={`vendor-btn ${selectedVendor === key ? 'active' : ''}`}
            onClick={() => onVendorChange(key)}
          >
            {vendor.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VendorSelector;