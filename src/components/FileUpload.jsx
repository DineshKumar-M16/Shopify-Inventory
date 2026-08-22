import React, { useCallback, useState } from 'react';
import Papa from 'papaparse';

const FileUpload = ({ onFileParsed, label, accept = ".csv", vendor }) => {
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [rowCount, setRowCount] = useState(0);
  const [fileSize, setFileSize] = useState(0);
  const [isValid, setIsValid] = useState(false);
  const [headerRow, setHeaderRow] = useState([]);
  const [delimiter, setDelimiter] = useState(',');

  const detectDelimiter = useCallback((text) => {
    // Try to detect delimiter from sample text
    const sample = text.substring(0, 1000);
    const commaCount = (sample.match(/,/g) || []).length;
    const semicolonCount = (sample.match(/;/g) || []).length;
    const tabCount = (sample.match(/\t/g) || []).length;
    const pipeCount = (sample.match(/\|/g) || []).length;
    
    const counts = [
      { delimiter: ',', count: commaCount },
      { delimiter: ';', count: semicolonCount },
      { delimiter: '\t', count: tabCount },
      { delimiter: '|', count: pipeCount }
    ];
    
    counts.sort((a, b) => b.count - a.count);
    
    // Return the most common delimiter, or comma as default
    return counts[0].count > 0 ? counts[0].delimiter : ',';
  }, []);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Reset states
    setFileName(file.name);
    setFileSize(file.size);
    setError('');
    setRowCount(0);
    setIsValid(false);
    setHeaderRow([]);
    setIsProcessing(true);

    // Read file as text first to detect delimiter
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const fileContent = e.target.result;
      const detectedDelimiter = detectDelimiter(fileContent);
      setDelimiter(detectedDelimiter);
      
      console.log(`Detected delimiter: "${detectedDelimiter}"`);
      console.log(`File size: ${fileContent.length} characters`);
      console.log(`First 500 chars: ${fileContent.substring(0, 500)}`);
      
      // Now parse with PapaParse
      Papa.parse(fileContent, {
        delimiter: detectedDelimiter,
        complete: (results) => {
          setIsProcessing(false);
          
          // Check if parsing was successful
          if (!results.data) {
            setError('❌ Failed to parse CSV file');
            return;
          }
          
          const totalRows = results.data.length;
          console.log(`CSV Parsed: ${totalRows} total rows`);
          console.log('First 5 rows:', results.data.slice(0, 5));
          
          if (totalRows === 0) {
            setError('❌ Empty CSV file - No data found');
            return;
          }
          
          // Check if the file might be Excel with wrong encoding
          if (totalRows === 1 && results.data[0].length === 1) {
            console.warn('Single cell detected - possible encoding issue');
            setError('⚠️ Warning: CSV appears to have incorrect format or encoding. Trying alternative parsing...');
            
            // Try parsing with different settings
            setTimeout(() => {
              Papa.parse(fileContent, {
                delimiter: ';',
                complete: (altResults) => {
                  if (altResults.data && altResults.data.length > 1) {
                    console.log('Alternative parse successful:', altResults.data.length, 'rows');
                    processResults(altResults.data, ';');
                  } else {
                    setError('❌ CSV format not recognized. Please check file encoding.');
                  }
                },
                header: false,
                skipEmptyLines: true
              });
            }, 100);
            return;
          }
          
          processResults(results.data, detectedDelimiter);
        },
        header: false,
        skipEmptyLines: true,
        error: (parseError) => {
          setIsProcessing(false);
          console.error('CSV parsing error:', parseError);
          setError(`❌ Error parsing CSV: ${parseError.message || 'Invalid CSV format'}`);
        }
      });
    };
    
    reader.onerror = () => {
      setIsProcessing(false);
      setError('❌ Failed to read file');
    };
    
    reader.readAsText(file, 'UTF-8');
    
    const processResults = (data, usedDelimiter) => {
      const totalRows = data.length;
      
      // Store header row if it exists
      if (totalRows > 0) {
        setHeaderRow(data[0] || []);
      }
      
      // Count ALL rows
      setRowCount(totalRows);
      
      // Client CSV can have any format - no strict validation
      setIsValid(true);
      
      // Clear any previous errors
      setError('');
      
      // Pass ALL data to parent
      onFileParsed(data);
      
      console.log(`File processed successfully: ${totalRows} rows, ${data[0]?.length || 0} columns`);
      console.log(`Used delimiter: "${usedDelimiter}"`);
    };
    
  }, [onFileParsed, vendor, detectDelimiter]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Check if it's a CSV file
      if (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')) {
        const mockEvent = { target: { files: [file] } };
        handleFileUpload(mockEvent);
      } else {
        setError('❌ Please upload a CSV file (.csv extension required)');
      }
    }
  }, [handleFileUpload]);

  const clearFile = useCallback(() => {
    setFileName('');
    setError('');
    setRowCount(0);
    setFileSize(0);
    setIsValid(false);
    setHeaderRow([]);
    // Notify parent that file is cleared
    onFileParsed(null);
  }, [onFileParsed]);

  const triggerFileInput = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = handleFileUpload;
    input.click();
  }, [accept, handleFileUpload]);

  return (
    <div className="file-upload">
      <div className="upload-label-container">
        <h4>{label}</h4>
        {fileName && (
          <button 
            type="button" 
            onClick={clearFile}
            className="clear-file-btn"
            title="Remove file"
          >
            × Clear
          </button>
        )}
      </div>
      
      <div className="upload-container">
        {fileName ? (
          <div className={`file-selected-container ${isValid ? 'valid' : error ? 'error' : ''}`}>
            <div className="file-selected">
              <div className="file-header">
                <span className="file-icon">
                  {isValid ? '📄' : error ? '❌' : '📁'}
                </span>
                <div className="file-details">
                  <div className="file-name" title={fileName}>
                    {fileName}
                  </div>
                  <div className="file-meta">
                    <span className="file-size">
                      {(fileSize / 1024).toFixed(1)} KB
                    </span>
                    {rowCount > 0 && (
                      <>
                        <span className="file-rows">
                          • {rowCount} row{rowCount !== 1 ? 's' : ''}
                        </span>
                        {delimiter && (
                          <span className="file-delimiter" title="Detected delimiter">
                            • Delimiter: "{delimiter}"
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="file-status">
                {isProcessing ? (
                  <div className="processing-status">
                    <div className="small-spinner"></div>
                    <span>Processing...</span>
                  </div>
                ) : error ? (
                  <div className="error-status">
                    <span>❌ Invalid</span>
                  </div>
                ) : isValid ? (
                  <div className="success-status">
                    <span>✅ Ready</span>
                  </div>
                ) : (
                  <div className="pending-status">
                    <span>📁 Uploaded</span>
                  </div>
                )}
              </div>
            </div>
            
            <button 
              className="change-file-btn"
              onClick={triggerFileInput}
            >
              Change File
            </button>
          </div>
        ) : (
          <div 
            className={`upload-placeholder ${error ? 'has-error' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <div className="upload-icon">📁</div>
            <div className="upload-text">
              {error ? 'Click to re-upload CSV' : 'Click to upload CSV or drag & drop'}
            </div>
            <div className="upload-subtext">
              Please upload a CSV file
            </div>
            
            <input
              type="file"
              accept={accept}
              onChange={handleFileUpload}
              className="file-input-hidden"
              id={`file-upload-${label.replace(/\s+/g, '-')}`}
            />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className={`error-message ${error.startsWith('❌') ? 'error' : 'warning'}`}>
          {error}
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="processing-indicator">
          <div className="spinner"></div>
          <span>Analyzing CSV file...</span>
        </div>
      )}

      {/* Success Message */}
      {isValid && !isProcessing && rowCount > 0 && (
        <div className="success-message">
          <div className="success-header">
            <span className="success-icon">✅</span>
            <span className="success-title">Client CSV loaded successfully</span>
          </div>
          <div className="success-details">
            <div className="detail-row">
              <span className="detail-label">File:</span>
              <span className="detail-value">{fileName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Rows:</span>
              <span className="detail-value">{rowCount} total rows</span>
            </div>
            {headerRow.length > 0 && (
              <div className="detail-row">
                <span className="detail-label">Columns:</span>
                <span className="detail-value">{headerRow.length}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Delimiter:</span>
              <span className="detail-value">"{delimiter}"</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Size:</span>
              <span className="detail-value">{(fileSize / 1024).toFixed(1)} KB</span>
            </div>
          </div>
        </div>
      )}


      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && rowCount > 0 && (
        <div className="debug-info">
          <details>
            <summary>CSV Preview (First 5 rows)</summary>
            <div className="debug-table">
              <table>
                <thead>
                  <tr>
                    {headerRow.map((header, idx) => (
                      <th key={idx}>Col {idx + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[headerRow, ...(rowCount > 1 ? [headerRow] : [])].slice(0, 5).map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} title={cell}>
                          {String(cell).length > 50 ? String(cell).substring(0, 47) + '...' : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default FileUpload;