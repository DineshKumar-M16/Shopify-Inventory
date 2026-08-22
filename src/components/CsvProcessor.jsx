import React, { useState, useCallback, useEffect, useRef } from 'react';
import MultiFileUpload from './MultiFileUpload';
import FileUpload from './FileUpload';
import DataTable from './DataTable';
import { generateZipFromProcessedData } from '../utils/zipGenerator';
import { vendors } from '../data/vendors';
import { getProcessor } from '../utils/processorLoader';

// Import default processors for fallback
import * as GLOBEFW from '../utils/csvProcessors/GLOBEFW_Processor';

// Fixed store codes
const STORE_CODES = ['AN', 'AW', 'ES', 'GO', 'MI', 'MSA', 'MTU', 'MUSA', 'PH', 'SU', 'UMO'];

// Extract store code from filename using fixed list
const extractStoreCode = (filename) => {
  if (!filename) return '';
  
  // Convert filename to uppercase for matching
  const upperFilename = filename.toUpperCase();
  
  // Sort by length descending to match longer codes first (MSA, MTU, MUSA before MS, MT, MU)
  const sortedCodes = [...STORE_CODES].sort((a, b) => b.length - a.length);
  
  // Look for any store code in the filename
  for (const code of sortedCodes) {
    if (upperFilename.includes(code)) {
      return code;
    }
  }
  
  return '';
};

const CsvProcessor = ({ selectedVendor, onVendorChange }) => {
  const [shopifyFiles, setShopifyFiles] = useState([]);
  const [clientCsvData, setClientCsvData] = useState(null);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [activeFile, setActiveFile] = useState('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProcessor, setCurrentProcessor] = useState(GLOBEFW);
  const processorRef = useRef(GLOBEFW);

  const vendor = vendors[selectedVendor];

  // Load processor when vendor changes
  useEffect(() => {
    const loadProcessor = async () => {
      try {
        const processorModule = await getProcessor(selectedVendor);
        setCurrentProcessor(processorModule);
        processorRef.current = processorModule;
      } catch (error) {
        console.error('Failed to load processor:', error);
        // Use default processor
        setCurrentProcessor(GLOBEFW);
        processorRef.current = GLOBEFW;
      }
    };
    
    loadProcessor();
  }, [selectedVendor]);

  // Reset all data when vendor changes
  useEffect(() => {
    startOver();
  }, [selectedVendor]);

  // Handle multiple shopify files upload
  const handleShopifyFilesUploaded = useCallback((files) => {
    setShopifyFiles(files);
  }, []);

  // Handle single client CSV upload
  const handleClientCsvUpload = useCallback((data) => {
    setClientCsvData(data);
  }, []);

  // Process all files with single client sheet
  const processAllFiles = useCallback(() => {
    if (!shopifyFiles.length || !clientCsvData) {
      alert('Please upload both Shopify files and Client CSV');
      return;
    }

    setIsProcessing(true);
    const processed = [];
    const processor = processorRef.current;

    shopifyFiles.forEach((file, index) => {
      try {
        // Generate a clean identifier for the file
        const fileIdentifier = getFileIdentifier(file.name, index);
        
        // Process using the vendor-specific processor
        const shopifyProcessed = processor[`${selectedVendor}_Shopify`]?.(file.data) || 
                                 processor[`GLOBEFW_Shopify`]?.(file.data) || 
                                 [];
        const clientProcessed = processor[`${selectedVendor}_Client`]?.(clientCsvData) || 
                                processor[`GLOBEFW_Client`]?.(clientCsvData) || 
                                [];
        const processedData = processor[`${selectedVendor}_UpdateData`]?.(shopifyProcessed, clientProcessed) || 
                              processor[`GLOBEFW_UpdateData`]?.(shopifyProcessed, clientProcessed) || 
                              [];
        
        const processedFile = {
          ...file,
          identifier: fileIdentifier,
          processed: true,
          processedData: processedData,
          index: index,
          originalName: file.name,
          vendor: selectedVendor,
          timestamp: new Date().toISOString()
        };
        
        processed.push(processedFile);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        processed.push({
          ...file,
          processed: false,
          error: error.message,
          identifier: getFileIdentifier(file.name, index),
          originalName: file.name
        });
      }
    });

    setProcessedFiles(processed);
    setIsProcessing(false);
    
    // Set first file as active
    if (processed.length > 0 && processed[0].identifier) {
      setActiveFile(processed[0].identifier);
    }
  }, [shopifyFiles, clientCsvData, selectedVendor]);

  // Get a clean identifier for the file (no store code extraction)
  const getFileIdentifier = (filename, index) => {
    // Remove extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    // Use sanitized filename or generic identifier
    const cleanName = nameWithoutExt
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30);
    
    return cleanName || `File_${index + 1}`;
  };

  // Start over - reset all data
  const startOver = useCallback(() => {
    setShopifyFiles([]);
    setClientCsvData(null);
    setProcessedFiles([]);
    setActiveFile('all');
  }, []);

  // Download single file - UPDATED
  const downloadSingleFile = useCallback((file) => {
    if (!file.processedData || file.processedData.length === 0) {
      alert('No processed data available for this file');
      return;
    }

    const headers = ['Handle','Title','Option1 Name','Option1 Value','Option2 Name','Option2 Value',
                    'Option3 Name','Option3 Value','SKU','HS Code','COO','Location',
                    'Unavailable (not editable)','Committed (not editable)',
                    'Available (not editable)','On hand (new)'];
    
    const csvContent = [
      headers.join(','),
      ...file.processedData.map(item => [
        item.handleValue || '',
        item.title || '',
        item.option1n || '',
        item.option1v || '',
        item.option2n || '',
        item.option2v || '',
        item.option3n || '',
        item.option3v || '',
        item.skuno || '',
        item.hscode || '',
        item.coo || '',
        item.location || '',
        item.unavailable || '0',
        item.committed || '0',
        item.available || '0',
        item.onhandnew || '0'
      ].map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Generate clean download filename with store code
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const vendorCode = selectedVendor || 'PROCESSED';
    const storeCode = extractStoreCode(file.originalName);
    const storeCodePart = storeCode ? `_${storeCode}` : '';
    const downloadName = `UPLOAD_${vendorCode}${storeCodePart}_${timestamp}_${file.index + 1}.csv`;
    
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [selectedVendor]);

  // Download all files as ZIP
  const downloadAllAsZip = useCallback(async () => {
    if (processedFiles.length === 0) {
      alert('No processed files available');
      return;
    }

    try {
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const result = await generateZipFromProcessedData(
        processedFiles, 
        selectedVendor, 
        timestamp
      );
      alert(`✅ Successfully downloaded ${result.fileCount} files in ${result.zipFilename}`);
    } catch (error) {
      console.error('Error generating ZIP:', error);
      alert('❌ Error downloading files. Please try again.');
    }
  }, [processedFiles, selectedVendor]);

  // Get unique file identifiers for tabs
  const getFileIdentifiers = useCallback(() => {
    const identifiers = processedFiles
      .map(file => file.identifier)
      .filter(Boolean)
      .filter((id, index, self) => self.indexOf(id) === index);
    
    return ['all', ...identifiers];
  }, [processedFiles]);

  // Get files to display based on active file
  const getDisplayFiles = useCallback(() => {
    if (activeFile === 'all') {
      return processedFiles;
    }
    return processedFiles.filter(file => file.identifier === activeFile);
  }, [processedFiles, activeFile]);

  const fileIdentifiers = getFileIdentifiers();
  const displayFiles = getDisplayFiles();
  const hasMultipleFiles = shopifyFiles.length > 1;
  const canProcess = shopifyFiles.length > 0 && clientCsvData;
  
  // Get processing statistics
  const validProcessedCount = processedFiles.filter(f => f.processed).length;
  const totalRows = processedFiles.reduce((sum, file) => 
    sum + (file.processedData ? file.processedData.length : 0), 0);

  return (
    <div className="csv-processor-simple">
      {/* Header with Start Over Button */}
      <div className="processor-header">
        <div className="header-left">
          <h2>{vendor?.name || 'Select Vendor'}</h2>
          <div className="file-stats">
            <span className="stat">
              📁 {shopifyFiles.length} Shopify file(s)
            </span>
            <span className="stat">
              📋 {clientCsvData ? 'Client CSV ✅' : 'No Client CSV ❌'}
            </span>
            <span className="stat">
              ⚙️ {validProcessedCount} Processed ({totalRows} items)
            </span>
          </div>
        </div>
        
        <div className="header-right">
          <button onClick={startOver} className="start-over-btn">
            🔄 Start Over
          </button>
        </div>
      </div>

      {/* Upload Section */}
      <div className="upload-section">
        <div className="upload-column">
          <h3>1. Upload Shopify Export Files</h3>
          <MultiFileUpload 
            onFilesProcessed={handleShopifyFilesUploaded}
            vendor={selectedVendor}
          />
          {shopifyFiles.length > 0 && (
            <div className="uploaded-summary">
              <div className="summary-header">
                <span>✅ {shopifyFiles.length} valid Shopify file(s) ready</span>
              </div>
              <div className="files-preview">
                {shopifyFiles.slice(0, 3).map((file, index) => (
                  <div key={file.id || index} className="file-preview">
                    <span className="preview-icon">📄</span>
                    <span className="preview-name" title={file.name}>
                      {file.name.length > 30 ? file.name.substring(0, 27) + '...' : file.name}
                    </span>
                    <span className="preview-rows">{file.rowCount} rows</span>
                  </div>
                ))}
                {shopifyFiles.length > 3 && (
                  <div className="more-files">
                    + {shopifyFiles.length - 3} more file(s)
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="upload-column">
          <h3>2. Upload Client Inventory CSV</h3>
          <FileUpload 
            label="Client inventory CSV for matching"
            onFileParsed={handleClientCsvUpload}
            vendor={selectedVendor}
          />
          {clientCsvData && (
            <div className="client-summary">
              <div className="summary-success">
                <span>✅ Client CSV loaded</span>
                <span className="row-count">{clientCsvData.length - 1} inventory records</span>
              </div>
              <div className="client-hint">
                This CSV will be used to update inventory for all uploaded Shopify files
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Process Button */}
      <div className="process-section">
        <button 
          onClick={processAllFiles}
          disabled={!canProcess || isProcessing}
          className="process-btn-large"
        >
          {isProcessing ? (
            <>
              <span className="spinner-small"></span>
              Processing {validProcessedCount}/{shopifyFiles.length} files...
            </>
          ) : (
            '⚡ Process All Files'
          )}
        </button>
        
        {/* {!canProcess && (
          <div className="process-requirements">
            <p className="requirements-title">Requirements to enable processing:</p>
            <ul className="requirements-list">
              <li className={shopifyFiles.length > 0 ? 'met' : 'unmet'}>
                {shopifyFiles.length > 0 ? '✅' : '❌'} At least one Shopify export file
              </li>
              <li className={clientCsvData ? 'met' : 'unmet'}>
                {clientCsvData ? '✅' : '❌'} Client inventory CSV uploaded
              </li>
            </ul>
          </div>
        )} */}
      </div>

      {/* Results Section */}
      {processedFiles.length > 0 && (
        <div className="results-section">
          <div className="results-header">
            <h3>3. Processing Results</h3>
            
            <div className="results-summary">
              <span className="results-stat">
                {validProcessedCount} of {shopifyFiles.length} files processed
              </span>
              <span className="results-stat">
                {totalRows} inventory items updated
              </span>
            </div>
            
            <div className="results-actions">
              {/* Single File Download (only if single file uploaded) */}
              {!hasMultipleFiles && processedFiles[0] && (
                <button 
                  onClick={() => downloadSingleFile(processedFiles[0])}
                  className="download-btn single"
                >
                  📥 Download Processed CSV
                </button>
              )}
              
              {/* ZIP Download (only if multiple files uploaded) */}
              {hasMultipleFiles && (
                <button 
                  onClick={downloadAllAsZip}
                  className="download-btn zip"
                  disabled={processedFiles.length === 0}
                >
                  📦 Download All as ZIP
                </button>
              )}
            </div>
          </div>

          {/* File Tabs (only if multiple files) */}
          {fileIdentifiers.length > 2 && (
            <div className="file-tabs">
              <div className="tabs-header">
                <span className="tabs-label">View Results:</span>
                <div className="tabs-container">
                  {fileIdentifiers.map(id => (
                    <button
                      key={id}
                      className={`file-tab ${activeFile === id ? 'active' : ''}`}
                      onClick={() => setActiveFile(id)}
                    >
                      {id === 'all' ? 'All Files' : id}
                      {id !== 'all' && (
                        <span className="tab-badge">
                          {processedFiles.filter(f => f.identifier === id).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Display Results */}
          {displayFiles.map((file, index) => (
            <div key={file.id || index} className="result-file">
              <div className="result-header">
                <div className="result-title">
                  <h4>
                    <span className="file-icon">
                      {file.processed ? '📊' : '❌'}
                    </span>
                    {file.identifier}
                    <span className="original-filename" title={file.originalName}>
                      ({file.originalName})
                    </span>
                  </h4>
                  <div className="result-stats">
                    <span className="stat">
                      {file.processedData ? file.processedData.length : 0} items
                    </span>
                    <span className={`status ${file.processed ? 'success' : 'error'}`}>
                      {file.processed ? '✅ Processed' : '❌ Failed'}
                    </span>
                  </div>
                </div>
                
                {hasMultipleFiles && file.processed && (
                  <button 
                    onClick={() => downloadSingleFile(file)}
                    className="download-single-btn"
                    title="Download this file separately"
                  >
                    📥 Download
                  </button>
                )}
              </div>
              
              {file.processed && file.processedData && file.processedData.length > 0 ? (
                <>
                  <div className="data-summary">
                    <span className="summary-item">
                      <strong>Vendor:</strong> {vendor?.name}
                    </span>
                    <span className="summary-item">
                      <strong>Source:</strong> {file.originalName}
                    </span>
                    <span className="summary-item">
                      <strong>Matched Items:</strong> {file.processedData.filter(item => item.status === '✅ Matched').length}
                    </span>
                    <span className="summary-item">
                      <strong>Unmatched Items:</strong> {file.processedData.filter(item => item.status === '❌ Not Found').length}
                    </span>
                  </div>
                  <DataTable 
                    data={file.processedData}
                    title={`${vendor?.name} - ${file.identifier}`}
                  />
                </>
              ) : (
                <div className="error-details">
                  <div className="error-icon">⚠️</div>
                  <div className="error-content">
                    <p className="error-title">Failed to process this file</p>
                    <p className="error-message">{file.error || 'Unknown processing error'}</p>
                    <p className="error-hint">
                      Please check that the CSV format matches Shopify export requirements
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Processing Summary */}
          {validProcessedCount > 0 && (
            <div className="processing-summary">
              <h4>Processing Complete</h4>
              <div className="summary-grid">
                <div className="summary-card success">
                  <div className="card-icon">✅</div>
                  <div className="card-content">
                    <div className="card-value">{validProcessedCount}</div>
                    <div className="card-label">Files Successfully Processed</div>
                  </div>
                </div>
                <div className="summary-card total">
                  <div className="card-icon">📊</div>
                  <div className="card-content">
                    <div className="card-value">{totalRows}</div>
                    <div className="card-label">Total Inventory Items</div>
                  </div>
                </div>
                <div className="summary-card matched">
                  <div className="card-icon">🔗</div>
                  <div className="card-content">
                    <div className="card-value">
                      {processedFiles.reduce((sum, file) => 
                        sum + (file.processedData ? 
                          file.processedData.filter(item => item.status === '✅ Matched').length : 0), 0)}
                    </div>
                    <div className="card-label">Items Successfully Matched</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CsvProcessor;