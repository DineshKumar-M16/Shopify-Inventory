export const Rivelino_Shopify = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data provided to Rivelino_Shopify');
    return [];
  }
  
  return data.map(row => {
    const paddedRow = [...row];
    while (paddedRow.length < 16) {
      paddedRow.push('');
    }
    
    const skuno = paddedRow[8] || '';
    const skuParts = skuno.split('_');
    
    // Remove 'SO6' and non-alphanumeric from SKU
    const sku = cleanSKU(skuParts[0] || '');
    const sizewidthStr = (skuParts[1] || '').toUpperCase();
    const size = extractNumbers(sizewidthStr);
    const width = extractLetters(sizewidthStr);
    
    return {
      handleValue: paddedRow[0] || '',
      title: paddedRow[1] || '',
      option1n: paddedRow[2] || '',
      option1v: paddedRow[3] || '',
      option2n: paddedRow[4] || '',
      option2v: paddedRow[5] || '',
      option3n: paddedRow[6] || '',
      option3v: paddedRow[7] || '',
      skuno: skuno,
      hscode: paddedRow[9] || '',
      coo: paddedRow[10] || '',
      location: paddedRow[11] || '',
      unavailable: paddedRow[12] || '0',
      committed: paddedRow[13] || '0',
      available: paddedRow[14] || '0',
      onhandnew: paddedRow[15] || '0',
      sku: sku,
      size: size,
      width: width,
      status: 'Pending'
    };
  });
};

export const Rivelino_Client = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data provided to Rivelino_Client');
    return [];
  }
  
  const result = [];
  let lastStyle = '';
  
  // First row is header
  const header = data[0] || [];
  const sizeStart = 6;
  const sizeEnd = header.length;
  
  // Start from row 1 to skip header
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    const paddedRow = [...row];
    while (paddedRow.length < sizeEnd) {
      paddedRow.push('');
    }
    
    let unformattedSKU2 = (paddedRow[0] || '').trim();
    if (unformattedSKU2 !== '') {
      lastStyle = unformattedSKU2;
    } else {
      unformattedSKU2 = lastStyle;
    }
    
    const sku2 = cleanSKU(unformattedSKU2);
    const width2 = (paddedRow[5] || '').trim().toUpperCase();
    
    if (!sku2 || !width2) continue;
    
    // Process size columns
    for (let j = sizeStart; j < sizeEnd; j++) {
      const label = (header[j] || '').toString();
      const qty = parseInt((paddedRow[j] || '0').toString().trim());
      
      if (qty > 0 && label.includes('/')) {
        const size2 = extractNumbers(label.split('/')[0]);
        result.push({
          sku: sku2,
          size: size2,
          width: width2,
          available: qty.toString()
        });
      }
    }
  }
  
  return result;
};

export const Rivelino_UpdateData = (shopifyData, clientData) => {
  if (!Array.isArray(shopifyData) || shopifyData.length === 0) {
    console.warn('No shopify data for Rivelino_UpdateData');
    return [];
  }
  
  if (!Array.isArray(clientData) || clientData.length === 0) {
    console.warn('No client data for Rivelino_UpdateData');
    return shopifyData.map(item => ({
      ...item,
      onhandnew: '0',
      status: '❌ No client data'
    }));
  }
  
  return shopifyData.map(item1 => {
    const sku1 = cleanString(item1.sku || '');
    const size1 = cleanString(item1.size || '');
    const width1 = (item1.width || '').toUpperCase().trim();
    let found = false;
    let newOnHand = 0;
    
    for (const item2 of clientData) {
      const sku2 = cleanString(item2.sku || '');
      const size2 = cleanString(item2.size || '');
      const width2 = (item2.width || '').toUpperCase().trim();
      
      if (sku1 === sku2 && size1 === size2 && width1 === width2) {
        newOnHand = item2.available || '0';
        found = true;
        break;
      }
    }
    
    return {
      ...item1,
      onhandnew: found ? newOnHand : '0',
      status: found ? '✅ Matched' : '❌ Not Found'
    };
  });
};

// Local helper functions
const cleanSKU = (sku) => {
  if (!sku) return '';
  return sku.toString().replace(/[^A-Za-z0-9]/g, '').replace(/SO6/g, '').toUpperCase();
};

const cleanString = (str) => {
  if (!str) return '';
  return str.toString().trim();
};

const extractNumbers = (str) => {
  if (!str) return '';
  return (str.toString().match(/\d+/g) || []).join('');
};

const extractLetters = (str) => {
  if (!str) return '';
  return (str.toString().match(/[A-Z]/g) || []).join('');
};