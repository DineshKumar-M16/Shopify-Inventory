import React, { useCallback, useState, useRef } from 'react';
import Papa from 'papaparse';
import { validateShopifyHeaders, getMissingHeaders } from '../utils/csvValidator';

const MultiFileUpload = ({ onFilesProcessed, vendor }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [invalidFiles, setInvalidFiles] = useState([]);
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback((event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsProcessing(true);
    setInvalidFiles([]);
    setProcessingProgress({ current: 0, total: files.length });

    const filePromises = files.map(file => {
      return new Promise((resolve) => {
        Papa.parse(file, {
          complete: (results) => {
            // Check if file has data
            if (!results.data || results.data.length === 0) {
              resolve({
                file: file,
                valid: false,
                error: 'Empty CSV file - No data found'
              });
              return;
            }
            
            // Get headers (first row)
            const headers = results.data[0] || [];
            
            // Validate Shopify headers
            if (!validateShopifyHeaders(headers)) {
              const missing = getMissingHeaders(headers);
              resolve({
                file: file,
                valid: false,
                error: `Invalid Shopify CSV format. Missing required columns: ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? `... (${missing.length - 3} more)` : ''}`
              });
              return;
            }
            
            // File is valid
            resolve({
              file: file,
              valid: true,
              data: results.data
            });
          },
          header: false,
          skipEmptyLines: true,
          error: (error) => {
            resolve({
              file: file,
              valid: false,
              error: `Failed to parse CSV: ${error.message}`
            });
          }
        });
      });
    });

    Promise.all(filePromises)
      .then(results => {
        const successful = results.filter(r => r.valid).map(r => ({
          id: `${Date.now()}-${Math.random()}`,
          name: r.file.name,
          size: r.file.size,
          type: r.file.type,
          rawFile: r.file,
          data: r.data.slice(1), // Remove header row
          headers: r.data[0], // Store headers for reference
          rowCount: r.data.length - 1 // Store row count
        }));
        
        const failed = results.filter(r => !r.valid).map(r => ({
          name: r.file.name,
          error: r.error
        }));
        
        setInvalidFiles(failed);
        
        if (failed.length > 0) {
          const errorMessage = `❌ ${failed.length} file(s) failed validation:\n\n` +
            failed.map(f => `• ${f.name}\n  ${f.error}`).join('\n\n') +
            `\n\nOnly valid Shopify export files will be processed.`;
          
          alert(errorMessage);
        }
        
        if (successful.length > 0 && onFilesProcessed) {
          onFilesProcessed(successful);
        }
        
        setUploadedFiles(successful);
        setProcessingProgress({ current: successful.length + failed.length, total: files.length });
      })
      .finally(() => {
        setIsProcessing(false);
      });
  }, [onFilesProcessed]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = Array.from(event.dataTransfer.files).filter(file => 
      file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')
    );
    
    if (files.length > 0) {
      const mockEvent = { target: { files } };
      handleFileSelect(mockEvent);
    }
  }, [handleFileSelect]);

  const removeFile = useCallback((fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  }, []);

  const clearAllFiles = useCallback(() => {
    setUploadedFiles([]);
    setInvalidFiles([]);
  }, []);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Calculate statistics
  const validFileCount = uploadedFiles.length;
  const invalidFileCount = invalidFiles.length;
  const totalFileCount = validFileCount + invalidFileCount;

  return (
    <div className="multi-file-upload">
      <div className="upload-zone">
        <div 
          className="drop-area"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <div className="drop-content">
            <div className="drop-icon">📁</div>
            <p>Drag & drop multiple CSV files or click to browse</p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              multiple
              className="file-input-hidden"
            />
            
            <button 
              className="browse-btn" 
              onClick={(e) => { 
                e.stopPropagation(); 
                triggerFileInput(); 
              }}
            >
              Browse Files
            </button>
          </div>
        </div>
      </div>

      {isProcessing && (
        <div className="processing-overlay">
          <div className="spinner large"></div>
          <p>Validating {processingProgress.current} of {processingProgress.total} files...</p>
          <p className="processing-subtext">Checking Shopify CSV format...</p>
        </div>
      )}

      {/* Valid Files Section */}
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files valid-files">
          <div className="files-header">
            <h4>
              ✅ Valid Shopify Files ({uploadedFiles.length})
              <span className="total-rows">
                Total rows: {uploadedFiles.reduce((sum, file) => sum + file.rowCount, 0)}
              </span>
            </h4>
            <button onClick={clearAllFiles} className="clear-all-btn">
              Clear All
            </button>
          </div>
          
          <div className="files-grid">
            {uploadedFiles.map(file => (
              <div key={file.id} className="file-card valid">
                <div className="file-card-header">
                  <span className="file-icon">📄</span>
                  <div className="file-info">
                    <div className="file-name" title={file.name}>
                      {file.name}
                    </div>
                    <div className="file-details">
                      <span className="file-size">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                      <span className="file-rows">
                        • {file.rowCount} rows
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFile(file.id)} 
                    className="remove-file-btn"
                    title="Remove file"
                  >
                    ×
                  </button>
                </div>
                <div className="file-status valid-status">
                  ✅ Valid Shopify Export
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invalid Files Section */}
      {invalidFiles.length > 0 && (
        <div className="uploaded-files invalid-files">
          <div className="files-header">
            <h4>❌ Invalid Files ({invalidFiles.length})</h4>
            <button 
              onClick={() => setInvalidFiles([])} 
              className="clear-all-btn"
            >
              Dismiss
            </button>
          </div>
          
          <div className="files-grid">
            {invalidFiles.map((file, index) => (
              <div key={index} className="file-card invalid">
                <div className="file-card-header">
                  <span className="file-icon">❌</span>
                  <div className="file-info">
                    <div className="file-name" title={file.name}>
                      {file.name}
                    </div>
                  </div>
                </div>
                <div className="file-error">
                  {file.error}
                </div>
              </div>
            ))}
          </div>
          
          <div className="validation-help">
            <p><strong>Note:</strong> Only valid Shopify export files will be processed.</p>
            <p>Required columns: Handle, Title, SKU, Location, Available, On hand, etc.</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalFileCount === 0 && !isProcessing && (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <p>No files uploaded yet</p>
          <p className="empty-subtext">
            Upload Shopify export files to begin processing
          </p>
        </div>
      )}
    </div>
  );
};

export default MultiFileUpload;