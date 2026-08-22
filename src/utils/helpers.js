// Helper function to clean SKU by removing special characters
export const cleanSKU = (sku) => {
  if (!sku) return '';
  return sku.toString().replace(/[\s\-/\\\.]+/g, '').toUpperCase();
};

// Helper to process CSV data (replaces the imported processCSV function)
export const processCSVData = (data) => {
  // This function processes CSV data - you can customize based on your needs
  if (!Array.isArray(data)) return [];
  return data.filter(row => row && row.length > 0);
};

// Get current month and week number
export const getCurrentDateInfo = () => {
  const now = new Date();
  const monthAbbr = now.toLocaleString('default', { month: 'short' }).toUpperCase();
  const weekNumber = getWeekNumber(now);
  return { 
    month: monthAbbr, 
    weekno: weekNumber.toString().padStart(2, '0'),
    year: now.getFullYear()
  };
};

// Calculate week number
export const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

// Download CSV file
export const downloadCSV = (data, filename) => {
  try {
    const headers = [
      'Handle', 'Title', 'Option1 Name', 'Option1 Value', 
      'Option2 Name', 'Option2 Value', 'Option3 Name', 'Option3 Value',
      'SKU', 'HS Code', 'COO', 'Location',
      'Unavailable (not editable)', 'Committed (not editable)', 
      'Available (not editable)', 'On hand (new)'
    ];
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        row.handleValue || '',
        row.title || '',
        row.option1n || '',
        row.option1v || '',
        row.option2n || '',
        row.option2v || '',
        row.option3n || '',
        row.option3v || '',
        row.skuno || '',
        row.hscode || '',
        row.coo || '',
        row.location || '',
        row.unavailable || '0',
        row.committed || '0',
        row.available || '0',
        row.onhandnew || '0'
      ].map(field => `"${field.toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error downloading CSV:', error);
    return false;
  }
};

// Validate CSV data structure
export const validateCSVData = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return { isValid: false, error: 'No data available' };
  }
  
  // Check if data has minimum required columns
  if (data[0] && data[0].length < 10) {
    return { 
      isValid: false, 
      error: 'CSV file must have at least 10 columns' 
    };
  }
  
  return { isValid: true, error: null };
};

// Parse CSV string to array
export const parseCSVString = (csvString) => {
  const rows = csvString.split('\n');
  return rows.map(row => {
    // Simple CSV parsing - for more complex cases, use a library like PapaParse
    return row.split(',').map(cell => 
      cell.trim().replace(/^"|"$/g, '')
    );
  });
};

// Format number with commas
export const formatNumber = (num) => {
  if (isNaN(num)) return '0';
  return parseInt(num).toLocaleString();
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Debounce function for performance optimization
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};