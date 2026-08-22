import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Fixed store codes
const STORE_CODES = ['AN', 'AW', 'ES', 'GO', 'MI', 'MSA', 'MTU', 'MUSA', 'PH', 'SU', 'UMO'];

// Extract store code from filename using fixed list
const extractStoreCode = (filename) => {
  if (!filename) return '';
  
  const upperFilename = filename.toUpperCase();
  const sortedCodes = [...STORE_CODES].sort((a, b) => b.length - a.length);
  
  for (const code of sortedCodes) {
    if (upperFilename.includes(code)) {
      return code;
    }
  }
  
  return '';
};

export const generateZipFromProcessedData = async (processedFiles, vendorCode, timestamp) => {
  const zip = new JSZip();
  let fileCount = 0;

  processedFiles.forEach((file, index) => {
    if (!file.processed || !file.processedData || file.processedData.length === 0) {
      return; // Skip failed or empty files
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

    // Generate filename with store code - UPDATED
    const storeCode = extractStoreCode(file.originalName);
    const storeCodePart = storeCode ? `_${storeCode}` : '';
    const downloadFilename = `UPLOAD_${vendorCode}${storeCodePart}_${timestamp}_${index + 1}.csv`;

    // Add file to ZIP
    zip.file(downloadFilename, csvContent);
    fileCount++;
  });

  if (fileCount === 0) {
    throw new Error('No valid processed files to download');
  }

  // Generate and download ZIP
  const zipFilename = `UPLOAD_${vendorCode}_${timestamp}.zip`;
  const zipContent = await zip.generateAsync({ type: 'blob' });
  saveAs(zipContent, zipFilename);

  return {
    fileCount,
    zipFilename
  };
};

export const downloadSingleFile = (file, vendor, timestamp, index) => {
  if (!file.processedData || file.processedData.length === 0) {
    throw new Error('No processed data available for this file');
  }

  const csvContent = convertToCSV(file.processedData);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const fileIndex = index !== undefined ? index + 1 : 1;
  const filename = `UPLOAD_${vendor}_${timestamp}_${fileIndex}.csv`;
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  return filename;
};

export const convertToCSV = (data) => {
  // Define the exact Shopify export headers
  const headers = [
    'Handle',
    'Title',
    'Option1 Name',
    'Option1 Value',
    'Option2 Name',
    'Option2 Value',
    'Option3 Name',
    'Option3 Value',
    'SKU',
    'HS Code',
    'COO',
    'Location',
    'Unavailable (not editable)',
    'Committed (not editable)',
    'Available (not editable)',
    'On hand (new)'
  ];
  
  // Create CSV rows
  const csvRows = [
    // Headers row
    headers.join(','),
    
    // Data rows
    ...data.map(item => {
      const row = [
        escapeCSVField(item.handleValue || ''),
        escapeCSVField(item.title || ''),
        escapeCSVField(item.option1n || ''),
        escapeCSVField(item.option1v || ''),
        escapeCSVField(item.option2n || ''),
        escapeCSVField(item.option2v || ''),
        escapeCSVField(item.option3n || ''),
        escapeCSVField(item.option3v || ''),
        escapeCSVField(item.skuno || ''),
        escapeCSVField(item.hscode || ''),
        escapeCSVField(item.coo || ''),
        escapeCSVField(item.location || ''),
        escapeCSVField(item.unavailable || '0'),
        escapeCSVField(item.committed || '0'),
        escapeCSVField(item.available || '0'),
        escapeCSVField(item.onhandnew || '0')
      ];
      return row.join(',');
    })
  ];
  
  return csvRows.join('\n');
};

export const escapeCSVField = (field) => {
  if (field === null || field === undefined) {
    return '""';
  }
  
  const stringField = String(field);
  
  // Escape double quotes by doubling them
  const escapedField = stringField.replace(/"/g, '""');
  
  // Wrap in quotes if field contains commas, double quotes, or newlines
  if (stringField.includes(',') || 
      stringField.includes('"') || 
      stringField.includes('\n') || 
      stringField.includes('\r')) {
    return `"${escapedField}"`;
  }
  
  return escapedField;
};

export const getCurrentTimestamp = () => {
  const now = new Date();
  // Format: YYYYMMDD_HHMMSS
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
};

export const getDateStamp = () => {
  const now = new Date();
  // Format: YYYYMMDD
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  return `${year}${month}${day}`;
};

// Helper to generate sequential filenames
export const generateSequentialFilenames = (count, vendor, timestamp) => {
  return Array.from({ length: count }, (_, i) => {
    const fileNumber = i + 1;
    return {
      index: i,
      filename: `UPLOAD_${vendor}_${timestamp}_${fileNumber}.csv`,
      displayName: `File ${fileNumber}`
    };
  });
};