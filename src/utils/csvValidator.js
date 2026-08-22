export const validateShopifyHeaders = (headers) => {
  const expectedHeaders = [
    'Handle','Title','Option1 Name','Option1 Value','Option2 Name','Option2 Value',
    'Option3 Name','Option3 Value','SKU','HS Code','COO','Location',
    'Unavailable (not editable)','Committed (not editable)',
    'Available (not editable)','On hand (new)'
  ];
  
  // Check if all expected headers exist (order doesn't matter)
  if (!headers || headers.length < expectedHeaders.length) {
    return false;
  }
  
  // Convert to lowercase for case-insensitive comparison
  const lowerHeaders = headers.map(h => h.toString().trim().toLowerCase());
  const lowerExpected = expectedHeaders.map(h => h.toLowerCase());
  
  // Check if all expected headers are present
  for (const expected of lowerExpected) {
    if (!lowerHeaders.includes(expected)) {
      return false;
    }
  }
  
  return true;
};

export const validateClientCSV = (headers, vendor) => {
  // Basic validation - at least some data
  if (!headers || headers.length === 0) {
    return false;
  }
  
  // You can add vendor-specific validation here if needed
  return true;
};

export const getMissingHeaders = (headers) => {
  const expectedHeaders = [
    'Handle','Title','Option1 Name','Option1 Value','Option2 Name','Option2 Value',
    'Option3 Name','Option3 Value','SKU','HS Code','COO','Location',
    'Unavailable (not editable)','Committed (not editable)',
    'Available (not editable)','On hand (new)'
  ];
  
  const lowerHeaders = headers.map(h => h.toString().trim().toLowerCase());
  const lowerExpected = expectedHeaders.map(h => h.toLowerCase());
  
  return lowerExpected.filter(expected => !lowerHeaders.includes(expected));
};